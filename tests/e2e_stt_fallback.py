"""Sarvam first, browser engine as fallback: credits out mid-answer, Sarvam down, recovery, no browser engine.
Needs tests/mock_sarvam.py on 127.0.0.1:4599 and the site started with SARVAM_API_KEY=local-test-only SARVAM_API_URL=http://127.0.0.1:4599."""
import os, re, time, json, subprocess
os.environ.setdefault("ADMIN_PASSWORD", "x")
src = open("/home/claude/e2e/e2e_v2.py").read()
exec(src[: src.index("def action_all")])
exec(src[src.index("def start_case"): src.index("\n", src.index("return ctx, page, links")) + 1])
voice = open(os.path.join(os.path.dirname(__file__), "e2e_voice.py")).read()
exec(voice[voice.index("MOCK = "): voice.index("def plans")])
from playwright.sync_api import sync_playwright

LOG, MODE = "/home/claude/stt/requests.jsonl", "/home/claude/stt/mode.json"
def mode(m):
    if m: json.dump(m, open(MODE, "w"))
    elif os.path.exists(MODE): os.remove(MODE)
    open(LOG, "w").close()
def reqs(): return [json.loads(l) for l in open(LOG)]
def sql(q): return subprocess.run(["psql", "-h", "/tmp", "-p", "5433", "-U", "postgres", "plinth5", "-Atc", q], capture_output=True, text=True).stdout.strip()
def to_open_page(page):
    for _ in range(12):
        if page.locator(".q textarea").count(): return True
        fill_section(page, {}, "vary", {}); page.locator(".inst-nav .btn").last.click(); page.wait_for_timeout(500)
    return False
ARGS = ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream", "--use-file-for-fake-audio-capture=/home/claude/stt/speechlike.wav%noloop"]
def session(p, name, init=MOCK):
    b = p.chromium.launch(args=ARGS)
    ctx, page, links = start_case(b, name, "2013-03-02", "Class VII", f"fb.{int(time.time()*1000)}@example.com")
    ctx.add_init_script(init); ctx.grant_permissions(["microphone", "camera"], origin=BASE)
    page.goto(BASE + "/case/parent-form"); page.wait_for_timeout(800)
    check(to_open_page(page), f"{name}: on a page with a written answer")
    return b, page
def panel_text(q): return q.locator(".voice-panel").inner_text()

sql("delete from stt_state")
mail_mark = os.path.getsize("/tmp/next.log")
with sync_playwright() as p:
    # 1. Credits run out after two pieces: keep both, carry on in the browser engine, pause Sarvam, email once.
    mode({"after": 2, "status": 403})
    b, page = session(p, "Credits Run Out")
    page.evaluate("p => window.__plans.push(...p)", [{"results": [[["and then the browser carried on", True]]]}])
    q = page.locator(".q:has(textarea)").first
    q.get_by_role("button", name="Speak your answer").click()
    check("takes over automatically" in panel_text(q), "notice says the browser engine takes over if Sarvam is unavailable")
    q.get_by_role("button", name="Start speaking").click()
    page.wait_for_function("() => document.querySelector('.voice-note')?.textContent.includes('has taken over')", timeout=25000)
    check(True, "panel says Sarvam is unavailable and the browser engine has taken over, while still listening")
    page.wait_for_timeout(800)
    live = q.locator(".voice-text").inner_text()
    check(live.startswith("piece1 piece2") and "browser carried on" in live, f"words heard by Sarvam are kept, browser words follow ({live!r})")
    check(page.evaluate("window.__recCount") >= 1, "browser engine started mid-answer")
    n = len(reqs()); page.wait_for_timeout(3000)
    check(len(reqs()) == n == 3, f"Sarvam is not called again after it refused, and no retry on a refusal ({len(reqs())} requests)")
    q.get_by_role("button", name="Stop").click()
    q.locator(".voice-panel textarea").wait_for(timeout=10000)
    check(q.locator(".voice-panel textarea").input_value() == "piece1 piece2 and then the browser carried on", "review holds both parts in order")
    q.get_by_role("button", name="Add to my answer").click()
    check(q.locator("textarea").first.input_value().endswith("browser carried on"), "confirmed text goes into the answer")
    check(sql("select paused_until > now() + interval '14 minutes' from stt_state") == "t", "Sarvam is paused for everyone for 15 minutes")
    time.sleep(1)
    tail = open("/tmp/next.log").read()[mail_mark:]
    check(tail.count("Sarvam voice typing paused") == 1, "PLINTH is emailed once about the pause")
    q2 = q  # speak again on the page: the answer is idle after Add
    q2.get_by_role("button", name="Speak your answer").click(); page.wait_for_timeout(300)
    if q2.get_by_role("button", name="Start speaking").count(): q2.get_by_role("button", name="Start speaking").click()
    page.wait_for_timeout(1500)
    check(page.evaluate("window.__recCount") >= 2 and len(reqs()) == 3, "the next answer on the page starts straight on the browser engine")
    q2.get_by_role("button", name="Discard").click()
    page.reload(); page.wait_for_timeout(800); to_open_page(page)
    q = page.locator(".q:has(textarea)").first
    q.get_by_role("button", name="Speak your answer").click()
    t = panel_text(q)
    check("Google" in t and "Sarvam" not in t, "while paused, a newly opened form shows the browser notice and never tries Sarvam")
    b.close()

    # 2. Pause ends and Sarvam works again: back to Sarvam with no redeploy; the alert is not repeated.
    sql("update stt_state set paused_until = now() - interval '1 minute'"); mode(None)
    b, page = session(p, "Sarvam Back")
    q = page.locator(".q:has(textarea)").first
    q.get_by_role("button", name="Speak your answer").click()
    check("Sarvam AI" in panel_text(q), "after the pause, forms use Sarvam again")
    q.get_by_role("button", name="Start speaking").click()
    page.wait_for_function("() => document.querySelector('.voice-text')?.textContent.includes('piece1')", timeout=15000)
    check(True, "Sarvam transcribes again")
    q.get_by_role("button", name="Discard").click()
    b.close()

    # 3. Sarvam failing (500): one retry per piece, then the browser takes over; no global pause.
    mode({"after": 1, "status": 500})
    b, page = session(p, "Sarvam Down")
    page.evaluate("p => window.__plans.push(...p)", [{"results": [[["browser after outage", True]]]}])
    q = page.locator(".q:has(textarea)").first
    q.get_by_role("button", name="Speak your answer").click(); q.get_by_role("button", name="Start speaking").click()
    page.wait_for_function("() => document.querySelector('.voice-note')?.textContent.includes('has taken over')", timeout=25000)
    page.wait_for_timeout(800)
    r = reqs(); live = q.locator(".voice-text").inner_text()
    check(live.startswith("piece1") and "browser after outage" in live, f"outage: first piece kept, browser continues ({live!r})")
    check(len(r) >= 3, f"failed piece was retried before switching ({len(r)} requests)")
    check(sql("select coalesce(bool_or(paused_until > now()), false) from stt_state") == "f", "a passing outage does not pause Sarvam for everyone")
    q.get_by_role("button", name="Discard").click()
    b.close()

    # 4. Browser with no speech engine of its own: Sarvam refuses → keep what was heard, ask to type the rest.
    mode({"after": 1, "status": 402})
    b, page = session(p, "No Engine", init=NOSPEECH)
    q = page.locator(".q:has(textarea)").first
    q.get_by_role("button", name="Speak your answer").click()
    check("takes over automatically" not in panel_text(q), "no promise of a takeover where the browser has no engine")
    q.get_by_role("button", name="Start speaking").click()
    q.locator(".voice-panel textarea").wait_for(timeout=25000)
    check(q.locator(".voice-panel textarea").input_value() == "piece1", "what Sarvam heard is kept for review")
    check("type the rest" in q.inner_text(), "person is asked to type the rest")
    b.close()
sql("delete from stt_state"); mode(None)
print("\nALL PASSED" if not fails else f"\n{len(fails)} FAILED")

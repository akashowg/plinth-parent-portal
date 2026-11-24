"""Speak / video answers: scripted speech engine + fake camera, on real parent and child forms."""
import os, re, time
os.environ.setdefault("ADMIN_PASSWORD", "x")
src = open("/home/claude/e2e/e2e_v2.py").read()
exec(src[: src.index("def action_all")])          # BASE, ok/bad/check, fill_section helpers
exec(src[src.index("def start_case"): src.index("\n", src.index("return ctx, page, links")) + 1])
from playwright.sync_api import sync_playwright

MOCK = r"""
(() => {
  window.__plans = []; window.__recCount = 0; window.__mediaRecorderUsed = false; window.__tracks = [];
  class FakeRec {
    constructor() { window.__recCount++; this.onresult = this.onerror = this.onend = null; this._t = []; }
    _ev(list) { return { results: list.map(([t, f]) => Object.assign([{ transcript: t }], { isFinal: f })) }; }
    start() {
      window.__lastLang = this.lang;
      const plan = window.__plans.shift() || { results: [] };
      if (plan.error) { this._t.push(setTimeout(() => { this.onerror && this.onerror({ error: plan.error }); this.onend && this.onend(); }, 60)); return; }
      plan.results.forEach((r, i) => this._t.push(setTimeout(() => this.onresult && this.onresult(this._ev(r)), 90 * (i + 1))));
      if (plan.endAfter) this._t.push(setTimeout(() => this.onend && this.onend(), 90 * (plan.results.length + 1)));
    }
    stop() { setTimeout(() => this.onend && this.onend(), 40); }
    abort() { this._t.forEach(clearTimeout); setTimeout(() => this.onend && this.onend(), 10); }
  }
  window.SpeechRecognition = FakeRec; window.webkitSpeechRecognition = FakeRec;
  const RealMR = window.MediaRecorder;
  window.MediaRecorder = function (...a) { window.__mediaRecorderUsed = true; return new RealMR(...a); };
  const gum = navigator.mediaDevices && navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
  if (gum) navigator.mediaDevices.getUserMedia = async (c) => { const s = await gum(c); window.__tracks.push(...s.getTracks()); return s; };
})();
"""
NOSPEECH = "delete window.SpeechRecognition; delete window.webkitSpeechRecognition; window.SpeechRecognition = undefined; window.webkitSpeechRecognition = undefined;"

def plans(page, p): page.evaluate("p => window.__plans.push(...p)", p)

def to_open_page(page):
    for _ in range(12):
        if page.locator(".q textarea").count(): return True
        fill_section(page, {}, "vary", {})
        page.locator(".inst-nav .btn").last.click(); page.wait_for_timeout(500)
    return False

posted = []
with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"])
    r = b.new_context().request.get(BASE + "/")
    check("microphone=(self)" in r.headers.get("permissions-policy", "") and "camera=(self)" in r.headers.get("permissions-policy", ""), "site allows its own pages to use microphone and camera")

    ctx, page, links = start_case(b, "Meera Voicetest", "2013-03-02", "Class VII", f"voice.{int(time.time())}@example.com")
    ctx.add_init_script(MOCK)
    ctx.grant_permissions(["microphone", "camera"], origin=BASE)
    page.on("request", lambda rq: posted.append(rq) if rq.method == "POST" else None)
    page.goto(BASE + "/case/parent-form"); page.wait_for_timeout(800)
    check(to_open_page(page), "reached a page with written answers")
    qs = page.locator(".q:has(textarea)")
    n = qs.count()
    check(all(qs.nth(i).get_by_role("button", name="Speak your answer").count() == 1 and qs.nth(i).get_by_role("button", name="Speak on video").count() == 1 for i in range(n)),
          f"every written answer on the page ({n}) has Speak and Video buttons")

    q = qs.nth(0); ta = q.locator("textarea").first
    plans(page, [{"results": [[["Meera helps", False]], [["Meera helps her brother", True]],
                              [["Meera helps her brother", True], ["with homework", False]],
                              [["Meera helps her brother", True], ["with homework every evening", True]]]}])
    q.get_by_role("button", name="Speak your answer").click()
    check(q.get_by_text("PLINTH never receives or keeps a recording").count() == 1, "first use explains that no recording reaches PLINTH")
    check(q.locator(".voice-lang select").input_value() == "en", "speech language defaults to the page language")
    q.get_by_role("button", name="Start speaking").click()
    page.wait_for_timeout(250)
    check(q.locator(".voice-interim").count() == 1, "live panel shows words as they are heard")
    page.wait_for_timeout(400)
    check("every evening" in q.locator(".voice-text").inner_text(), "live text reaches the last phrase")
    q.get_by_role("button", name="Stop").click()
    q.locator(".voice-panel textarea").wait_for(timeout=3000)
    heard = q.locator(".voice-panel textarea").input_value()
    check(heard == "Meera helps her brother with homework every evening", f"review shows exactly what was heard ({heard!r})")
    check(ta.input_value() == "", "nothing reaches the answer before it is confirmed")
    q.locator(".voice-panel textarea").fill("Meera helps her younger brother with homework every evening")
    q.get_by_role("button", name="Add to my answer").click()
    check(ta.input_value() == "Meera helps her younger brother with homework every evening", "confirmed (and corrected) text becomes the answer")
    check(str(len(ta.input_value())) in q.locator(".q-foot").inner_text(), "character count updates")

    # Second take on the same answer: no notice; browser ends a session after a pause (restart),
    # and Android-style cumulative finals must not duplicate words. It is appended, not replaced.
    plans(page, [{"results": [[["She is patient", True]]], "endAfter": True},
                 {"results": [[["when he", True], ["when he gets stuck", True]]]}])
    q.get_by_role("button", name="Speak your answer").click()
    check(q.get_by_role("button", name="Start speaking").count() == 0, "notice is not repeated on the page")
    page.wait_for_timeout(700)
    q.get_by_role("button", name="Stop").click()
    q.locator(".voice-panel textarea").wait_for(timeout=3000)
    heard2 = q.locator(".voice-panel textarea").input_value()
    check(heard2 == "She is patient when he gets stuck", f"keeps listening across a pause without repeating words ({heard2!r})")
    q.get_by_role("button", name="Add to my answer").click()
    check(ta.input_value().endswith("evening She is patient when he gets stuck"), "a second take is added after the first")

    # Discard leaves the answer alone
    before = ta.input_value()
    plans(page, [{"results": [[["something I do not want", True]]]}])
    q.get_by_role("button", name="Speak your answer").click(); page.wait_for_timeout(300)
    q.get_by_role("button", name="Discard").click(); page.wait_for_timeout(200)
    check(ta.input_value() == before, "discarding leaves the answer unchanged")

    # Video: local mirror only, camera tracks stop afterwards
    q2 = qs.nth(1 if n > 1 else 0); ta2 = q2.locator("textarea").first
    plans(page, [{"results": [[["On video she sounds confident", True]]]}])
    q2.get_by_role("button", name="Speak on video").click(); page.wait_for_timeout(700)
    live_cam = page.evaluate("() => { const v = document.querySelector('.voice-mirror video'); return !!(v && v.srcObject && v.srcObject.getVideoTracks().length) }")
    check(live_cam, "video mode shows the camera as a mirror")
    check(page.evaluate("() => window.__tracks.every(t => t.kind === 'video')"), "camera is opened without audio (speech service uses the mic itself)")
    q2.get_by_role("button", name="Stop").click(); q2.locator(".voice-panel textarea").wait_for(timeout=3000)
    check(page.evaluate("() => window.__tracks.length > 0 && window.__tracks.every(t => t.readyState === 'ended')"), "camera is switched off when speaking stops")
    q2.get_by_role("button", name="Add to my answer").click()
    check(ta2.input_value().endswith("On video she sounds confident"), "video take becomes text in the answer")

    # Microphone blocked
    plans(page, [{"error": "not-allowed"}])
    q2.get_by_role("button", name="Speak your answer").click(); page.wait_for_timeout(400)
    check(q2.get_by_text("microphone is blocked").count() == 1, "blocked microphone gives a clear message")

    check(not page.evaluate("() => window.__mediaRecorderUsed"), "no audio or video is ever recorded (MediaRecorder never created)")
    bodies = [(rq.post_data_buffer or b"") for rq in posted]
    check(all(b"RIFF" not in x and b"webm" not in x.lower() and len(x) < 200_000 for x in bodies), f"no media is sent to PLINTH ({len(bodies)} posts checked)")

    # Saved: the confirmed text survives a reload (autosaved draft)
    page.wait_for_timeout(7000); page.reload(); page.wait_for_timeout(1200)
    to_open_page(page)
    check(any("She is patient when he gets stuck" in t.input_value() for t in page.locator(".q textarea").all()), "confirmed text is saved with the draft")
    ctx.close()

    # Browser without speech recognition: no dead buttons, keyboard tip instead
    ctx2 = b.new_context(); ctx2.add_init_script(NOSPEECH)
    pg = ctx2.new_page()
    pg.goto(links[0] if links else BASE); pg.wait_for_timeout(800)
    child_text = pg.locator(".q textarea").count()
    tip_ok = pg.get_by_role("button", name="Speak your answer").count() == 0
    check(tip_ok, "without speech support the buttons are hidden")
    ctx2.close()
    b.close()
print("\nALL PASSED" if not fails else f"\n{len(fails)} FAILED")

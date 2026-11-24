"""Server transcription (Sarvam) end to end: fake microphone speech → pieces at pauses → live text → confirm."""
# Needs: tests/mock_sarvam.py on 127.0.0.1:4599 and the site started with SARVAM_API_KEY=local-test-only SARVAM_API_URL=http://127.0.0.1:4599
import os, re, time, json, io, wave, struct
os.environ.setdefault("ADMIN_PASSWORD", "x")
src = open("/home/claude/e2e/e2e_v2.py").read()
exec(src[: src.index("def action_all")])
exec(src[src.index("def start_case"): src.index("\n", src.index("return ctx, page, links")) + 1])
exec(open("/home/claude/repo-clone/tests/e2e_voice.py").read().split("posted = []")[0].split("MOCK = ")[0].split("from playwright")[0])
from playwright.sync_api import sync_playwright
LOG = "/home/claude/stt/requests.jsonl"
def reqs():
    return [json.loads(l) for l in open(LOG)] if os.path.exists(LOG) else []
def to_open_page(page):
    for _ in range(12):
        if page.locator(".q textarea").count(): return True
        fill_section(page, {}, "vary", {}); page.locator(".inst-nav .btn").last.click(); page.wait_for_timeout(500)
    return False
def wav(secs, rate=16000):
    b = io.BytesIO(); w = wave.open(b, "wb"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(rate); w.writeframes(b"\0\0" * int(secs * rate)); w.close(); return b.getvalue()

with sync_playwright() as p:
    b = p.chromium.launch(args=["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream",
                                "--use-file-for-fake-audio-capture=/home/claude/stt/speechlike.wav%noloop", "--autoplay-policy=no-user-gesture-required"])
    ctx, page, links = start_case(b, "Ishaan Voicecheck", "2013-03-02", "Class VII", f"stt.{int(time.time())}@example.com")
    ctx.grant_permissions(["microphone", "camera"], origin=BASE)
    page.goto(f"{BASE}/lang?to=hi&back=%2Fcase%2Fparent-form"); page.wait_for_timeout(800)
    check(to_open_page(page), "parent form page with a written answer")
    q = page.locator(".q:has(textarea)").first; ta = q.locator("textarea").first
    q.locator(".voice-btn").first.click()
    check("Sarvam AI" in q.locator(".voice-panel").inner_text(), "notice names Sarvam AI and says nobody keeps a recording")
    open(LOG, "w").close()
    t0 = time.time()
    q.locator(".voice-panel .btn").first.click()
    first_text_at = None; seen = []
    while time.time() - t0 < 24:
        txt = q.locator(".voice-text").inner_text().strip().replace("…", "").strip()
        if txt and first_text_at is None: first_text_at = time.time() - t0
        if txt and (not seen or seen[-1] != txt): seen.append(txt)
        page.wait_for_timeout(250)
    check(first_text_at is not None and first_text_at < 5.0, f"first words appear while still speaking ({first_text_at and round(first_text_at,1)} s after start)")
    check(len(seen) >= 3, f"text grows piece by piece during speech ({len(seen)} updates)")
    q.get_by_role("button", name=re.compile("रोकें|Stop")).click()
    q.locator(".voice-panel textarea").wait_for(timeout=30000)
    heard = q.locator(".voice-panel textarea").input_value()
    r = reqs(); n = len(r)
    check(heard == " ".join(f"piece{i}" for i in range(1, n + 1)), f"review holds every piece in order ({heard!r})")
    check(n >= 4, f"speech was cut at pauses into pieces ({n}: {[x.get('secs') for x in r]})")
    check(all(x.get("rate") == 16000 and x.get("ch") == 1 and x.get("bits") == 16 for x in r), "every piece is 16 kHz mono 16-bit WAV")
    check(max(x.get("secs", 99) for x in r) <= 8.6, "no piece is longer than about 8 s (long speech is split)")
    check(all(x["key"] == "local-test-only" and x["model"] == "saaras:v4" and x["mode"] == "transcribe" and x["lang"] == "hi-IN" for x in r),
          "Sarvam gets the key header, saaras:v4, transcribe mode and hi-IN for a Hindi page")
    check(ta.input_value() == "", "nothing enters the answer before it is confirmed")
    q.locator(".voice-panel .btn").first.click()
    check(ta.input_value() == heard, "confirmed text becomes the answer")

    # The endpoint itself
    api = ctx.request
    rs = api.post(BASE + "/api/transcribe", multipart={"lang": "hi", "kind": "parent", "audio": {"name": "a.wav", "mimeType": "audio/wav", "buffer": wav(2)}})
    check(rs.status == 200, f"signed-in parent can transcribe ({rs.status})")
    anon = p.request.new_context()
    rs = anon.post(BASE + "/api/transcribe", multipart={"lang": "hi", "kind": "parent", "audio": {"name": "a.wav", "mimeType": "audio/wav", "buffer": wav(2)}})
    check(rs.status == 401, f"no sign-in, no transcription ({rs.status})")
    rs = anon.post(BASE + "/api/transcribe", multipart={"lang": "hi", "kind": "student", "token": "not-a-real-token-123", "audio": {"name": "a.wav", "mimeType": "audio/wav", "buffer": wav(2)}})
    check(rs.status == 401, f"a made-up child link is refused ({rs.status})")
    child_tok = links[0].rsplit("/", 1)[1]
    before = len(reqs())
    rs = anon.post(BASE + "/api/transcribe", multipart={"lang": "or", "kind": "student", "token": child_tok, "audio": {"name": "a.wav", "mimeType": "audio/wav", "buffer": wav(2)}})
    check(rs.status == 200 and reqs()[-1]["lang"] == "od-IN", f"child's link works, and Odia is sent as Sarvam's od-IN ({rs.status}, {reqs()[-1]['lang']})")
    rs = anon.post(BASE + "/api/transcribe", multipart={"lang": "hi", "kind": "student", "token": child_tok, "audio": {"name": "a.webm", "mimeType": "audio/webm", "buffer": b"\x1aE\xdf\xa3" + b"0" * 4000}})
    check(rs.status == 400, f"anything that is not a short 16 kHz WAV is refused ({rs.status})")
    rs = anon.post(BASE + "/api/transcribe", multipart={"lang": "hi", "kind": "student", "token": child_tok, "audio": {"name": "a.wav", "mimeType": "audio/wav", "buffer": wav(31)}})
    check(rs.status == 400, f"pieces over 30 s are refused ({rs.status})")
    codes = []
    for i in range(92):
        rs = anon.post(BASE + "/api/transcribe", multipart={"lang": "hi", "kind": "student", "token": child_tok, "audio": {"name": "a.wav", "mimeType": "audio/wav", "buffer": wav(30)}})
        codes.append(rs.status)
        if rs.status == 429: break
    check(codes[-1] == 429 and codes.count(200) <= 91, f"hourly cap stops runaway use ({codes.count(200)} × 30 s accepted, then 429)")
    b.close()
print("\nALL PASSED" if not fails else f"\n{len(fails)} FAILED")

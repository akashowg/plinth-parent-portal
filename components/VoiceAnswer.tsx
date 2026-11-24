"use client";

import { useEffect, useRef, useState } from "react";
import { LANGS } from "@/lib/i18n/langs";

/**
 * Speak (or speak on camera) instead of typing a written answer.
 *
 * Speech becomes text through the browser's own speech service (Web Speech API: Google on Chrome and
 * Android, Apple on Safari). No MediaRecorder is used and nothing is uploaded to PLINTH: the only thing
 * that ever reaches the form is text the person has read, corrected and confirmed. In video mode the
 * camera feeds a local mirror only; its frames never leave the page and the tracks stop on finish.
 */

type Rec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};
type RecCtor = new () => Rec;

function recognizer(): RecCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: RecCtor; webkitSpeechRecognition?: RecCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const MAX_MS = 3 * 60 * 1000;
/** Shared across every answer on the page: the notice is shown once, and the chosen language is remembered. */
const page = { noticeSeen: false, speechLang: "" };

type Mode = "audio" | "video";
type Phase = "idle" | "notice" | "live" | "review";
type UU = (k: string) => string;

/** Join the final pieces of one recognition session, dropping pieces Android repeats cumulatively. */
function finalsOf(results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>) {
  const finals: string[] = [];
  let interim = "";
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const text = (r[0]?.transcript ?? "").trim();
    if (!text) continue;
    if (!r.isFinal) {
      interim += (interim ? " " : "") + text;
      continue;
    }
    const prev = finals[finals.length - 1];
    if (prev && text.startsWith(prev)) finals[finals.length - 1] = text;
    else if (!prev || !prev.startsWith(text)) finals.push(text);
  }
  return { final: finals.join(" "), interim };
}

const join = (a: string, b: string) => (a && b ? `${a} ${b}` : a || b).replace(/\s+/g, " ").trim();

export default function VoiceAnswer({
  lang,
  uu,
  current,
  onConfirm,
  maxLength = 4000,
}: {
  lang: string;
  uu: UU;
  current: string;
  onConfirm: (text: string) => void;
  maxLength?: number;
}) {
  const [supported, setSupported] = useState<boolean | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [mode, setMode] = useState<Mode>("audio");
  const [speechLang, setSpeechLang] = useState(page.speechLang || lang);
  const [committed, setCommitted] = useState("");
  const [live, setLive] = useState({ final: "", interim: "" });
  const [draft, setDraft] = useState("");
  const [note, setNote] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);

  const rec = useRef<Rec | null>(null);
  const want = useRef(false);
  const sessionText = useRef("");
  const committedRef = useRef("");
  const startedAt = useRef(0);
  const stream = useRef<MediaStream | null>(null);
  const video = useRef<HTMLVideoElement | null>(null);
  const reviewBox = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => setSupported(!!recognizer()), []);
  useEffect(() => () => teardown(), []); // eslint-disable-line react-hooks/exhaustive-deps

  // While listening: tick the timer, keep the child-form idle lock from firing, stop at the limit.
  useEffect(() => {
    if (phase !== "live") return;
    const t = setInterval(() => {
      const ms = Date.now() - startedAt.current;
      setElapsed(ms);
      window.dispatchEvent(new Event("input"));
      if (ms >= MAX_MS) {
        setNote(uu("vLimit"));
        finish();
      }
    }, 500);
    return () => clearInterval(t);
  }, [phase]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (phase === "live" && mode === "video" && video.current && stream.current) {
      video.current.srcObject = stream.current;
      video.current.play().catch(() => {});
    }
    if (phase === "review") reviewBox.current?.focus();
  }, [phase, mode]);

  function stopCamera() {
    stream.current?.getTracks().forEach((tr) => tr.stop());
    stream.current = null;
    if (video.current) video.current.srcObject = null;
  }

  function teardown() {
    want.current = false;
    try {
      rec.current?.abort();
    } catch {}
    rec.current = null;
    stopCamera();
  }

  function bankSession() {
    if (sessionText.current) {
      committedRef.current = join(committedRef.current, sessionText.current);
      sessionText.current = "";
      setCommitted(committedRef.current);
      setLive({ final: "", interim: "" });
    }
  }

  function listen(code: string) {
    const Ctor = recognizer();
    if (!Ctor) return;
    const r = new Ctor();
    r.lang = LANGS.find((l) => l.code === code)?.locale ?? "en-IN";
    r.continuous = true;
    r.interimResults = true;
    r.maxAlternatives = 1;
    r.onresult = (e) => {
      const { final, interim } = finalsOf(e.results);
      sessionText.current = final;
      setLive({ final, interim });
    };
    r.onerror = (e) => {
      if (e.error === "no-speech" || e.error === "aborted") return;
      want.current = false;
      if (e.error === "not-allowed" || e.error === "service-not-allowed") setNote(uu("vDenied"));
      else if (e.error === "network") setNote(uu("vNetwork"));
      else if (e.error === "language-not-supported") setNote(uu("vLangUnsupported"));
      else setNote(uu("vNetwork"));
    };
    // Browsers end a session after a pause; keep listening until the person presses Stop.
    r.onend = () => {
      bankSession();
      if (want.current) {
        try {
          r.start();
          return;
        } catch {}
      }
      if (rec.current === r) {
        rec.current = null;
        toReview();
      }
    };
    rec.current = r;
    try {
      r.start();
    } catch {
      setNote(uu("vNetwork"));
      toReview();
    }
  }

  function toReview() {
    want.current = false;
    stopCamera();
    const text = join(committedRef.current, sessionText.current);
    sessionText.current = "";
    setDraft(text);
    setPhase(text ? "review" : "idle");
    if (!text) setNote((n) => n ?? uu("vEmpty"));
  }

  async function begin(m: Mode) {
    setNote(null);
    setMode(m);
    if (!page.noticeSeen) {
      setPhase("notice");
      return;
    }
    await go(m);
  }

  async function go(m: Mode) {
    page.noticeSeen = true;
    page.speechLang = speechLang;
    committedRef.current = "";
    sessionText.current = "";
    setCommitted("");
    setLive({ final: "", interim: "" });
    setElapsed(0);
    if (m === "video") {
      try {
        stream.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: false });
      } catch {
        setNote(uu("vCamDenied"));
        m = "audio";
        setMode("audio");
      }
    }
    want.current = true;
    startedAt.current = Date.now();
    setPhase("live");
    listen(speechLang);
  }

  function finish() {
    want.current = false;
    const r = rec.current;
    if (r) {
      try {
        r.stop(); // onend banks the last words and opens the review
      } catch {
        rec.current = null;
        toReview();
      }
    } else toReview();
  }

  function switchLang(code: string) {
    setSpeechLang(code);
    page.speechLang = code;
    if (phase === "live" && rec.current) {
      const r = rec.current;
      rec.current = null;
      r.onend = null;
      try {
        r.abort();
      } catch {}
      bankSession();
      listen(code);
    }
  }

  function confirm() {
    const add = draft.trim();
    if (add) onConfirm(join(current, add).slice(0, maxLength));
    setDraft("");
    setPhase("idle");
    setNote(uu("vAdded"));
  }

  function discard() {
    teardown();
    setDraft("");
    setPhase("idle");
    setNote(null);
  }

  if (supported === null) return null;
  if (!supported) return <p className="small muted voice-tip">{uu("vUnsupported")}</p>;

  const langSelect = (
    <label className="voice-lang">
      <span>{uu("vLangLabel")}</span>
      <select value={speechLang} onChange={(e) => switchLang(e.target.value)}>
        {LANGS.map((l) => (
          <option key={l.code} value={l.code} lang={l.code}>
            {l.native}
          </option>
        ))}
      </select>
    </label>
  );
  const secs = Math.floor(elapsed / 1000);
  const clock = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;

  return (
    <div className="voice" data-phase={phase}>
      {phase === "idle" && (
        <div className="voice-row">
          <button type="button" className="voice-btn" onClick={() => begin("audio")}>
            <MicIcon />
            {uu("vSpeak")}
          </button>
          <button type="button" className="voice-btn" onClick={() => begin("video")}>
            <CamIcon />
            {uu("vVideo")}
          </button>
        </div>
      )}

      {phase === "notice" && (
        <div className="voice-panel" role="dialog" aria-label={uu("vNoticeTitle")}>
          <p className="voice-title">{uu("vNoticeTitle")}</p>
          <p>{uu("vNotice")}</p>
          {mode === "video" && <p>{uu("vNoticeVideo")}</p>}
          {langSelect}
          <div className="voice-row">
            <button type="button" className="btn" onClick={() => go(mode)}>
              {uu("vStart")}
            </button>
            <button type="button" className="btn btn-quiet" onClick={discard}>
              {uu("vCancel")}
            </button>
          </div>
        </div>
      )}

      {phase === "live" && (
        <div className="voice-panel voice-live">
          <div className="voice-status">
            <span className="voice-dot" aria-hidden="true" />
            <span>{uu("vListening")}</span>
            <span className="voice-clock">{clock}</span>
          </div>
          {mode === "video" && (
            <figure className="voice-mirror">
              <video ref={video} muted playsInline autoPlay aria-hidden="true" />
              <figcaption>{uu("vMirror")}</figcaption>
            </figure>
          )}
          <p className="voice-text" aria-live="polite" lang={speechLang}>
            {join(committed, live.final)} <span className="voice-interim">{live.interim}</span>
          </p>
          {langSelect}
          <div className="voice-row">
            <button type="button" className="btn" onClick={finish}>
              {uu("vStop")}
            </button>
            <button type="button" className="btn btn-quiet" onClick={discard}>
              {uu("vDiscard")}
            </button>
          </div>
        </div>
      )}

      {phase === "review" && (
        <div className="voice-panel">
          <p className="voice-title">{uu("vReviewTitle")}</p>
          <p className="small muted">{uu("vReviewHelp")}</p>
          <textarea ref={reviewBox} rows={5} maxLength={maxLength} value={draft} onChange={(e) => setDraft(e.target.value)} lang={speechLang} aria-label={uu("vReviewTitle")} />
          <div className="voice-row">
            <button type="button" className="btn" onClick={confirm} disabled={!draft.trim()}>
              {uu("vAdd")}
            </button>
            <button type="button" className="btn btn-quiet" onClick={() => begin(mode)}>
              {uu("vRetry")}
            </button>
            <button type="button" className="linkbtn" onClick={discard}>
              {uu("vDiscard")}
            </button>
          </div>
        </div>
      )}

      {note && (
        <p className="small voice-note" role="status">
          {note}
        </p>
      )}
    </div>
  );
}

function MicIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <rect x="5.5" y="1.5" width="5" height="8.5" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M3 7.5a5 5 0 0 0 10 0M8 12.5v2.5M5.5 15h5" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function CamIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <rect x="1.5" y="4" width="9" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <path d="M10.5 7l4-2.2v6.4l-4-2.2z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

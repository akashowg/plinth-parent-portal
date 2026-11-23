"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { discardDraft, saveDraft, submitInstrument, unlockDraft } from "@/app/instrument-actions";
import { ANCHORS } from "@/lib/instrument/scales";
import type { Answer, Answers, FormDef, Item, Lang, Opt } from "@/lib/instrument/types";
import { u } from "@/lib/instrument/ui";
import { chosenSubjects, gridKeys, isVisible, SKIP, textLength, validateSection, type Problem } from "@/lib/instrument/validate";

type DraftData = { answers: Answers; timings: Record<string, number>; step: number };
type Props = {
  def: FormDef;
  lang: Lang;
  token?: string;
  initial?: DraftData | { locked: true; step: number } | null;
  /** Child forms: drafts are sealed with a 4-digit code the child chooses, and the page locks when left idle. */
  pinRequired?: boolean;
  /** Shown above the first section (assent, notice, administrator guidance). */
  preface?: ReactNode;
  done: ReactNode;
};

const PILL_KINDS = new Set(["freq", "obs", "a3", "rate"]);
const WEAK_PINS = new Set(["1234", "4321", "0123", "1212", "2580", "1122", "1004", "2000", "2025", "2026"]);
const IDLE_MS = 2 * 60 * 1000;
const HIDDEN_MS = 30 * 1000;

export default function InstrumentForm({ def, lang, token, initial, preface, done, pinRequired }: Props) {
  const startLocked = !!initial && "locked" in initial;
  const draft = !startLocked ? (initial as DraftData | null | undefined) : null;
  const [answers, setAnswers] = useState<Answers>(draft?.answers ?? {});
  const [step, setStep] = useState(() => Math.min(draft?.step ?? 0, def.sections.length - 1));
  const [gate, setGate] = useState<"unlock" | null>(startLocked ? "unlock" : null);
  const [pin, setPin] = useState<string | null>(null);
  const [pinA, setPinA] = useState("");
  const [pinB, setPinB] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [paused, setPaused] = useState(false);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const timings = useRef<Record<string, number>>({ ...(draft?.timings ?? {}) });
  const shownAt = useRef<number>(Date.now());
  const top = useRef<HTMLDivElement>(null);
  const dirty = useRef(false);

  const section = def.sections[step];
  const L = (x: { en: string; hi: string }) => x[lang];

  // Earliest section the respondent may return to (sections marked lockOnLeave close once passed).
  const minStep = useMemo(() => {
    let m = 0;
    def.sections.forEach((s, i) => {
      if (s.lockOnLeave && step > i) m = i + 1;
    });
    return m;
  }, [def.sections, step]);

  const bank = useCallback(() => {
    const id = def.sections[step].id;
    const now = Date.now();
    timings.current[id] = (timings.current[id] ?? 0) + (now - shownAt.current);
    shownAt.current = now;
  }, [def.sections, step]);

  const persist = useCallback(
    async (nextStep: number, a: Answers, pinNow?: string | null) => {
      const code = pinNow ?? pin;
      if (pinRequired && !code) return; // a child's answers are never stored without the child's code
      setStatus("saving");
      try {
        await saveDraft({ source: def.source, token, answers: a, timings: timings.current, step: nextStep, pin: code ?? undefined });
        setStatus("saved");
        dirty.current = false;
      } catch {
        setStatus("idle");
      }
    },
    [def.source, token, pin, pinRequired],
  );

  // Gentle autosave a few seconds after the last change.
  useEffect(() => {
    if (!dirty.current) return;
    const t = setTimeout(() => {
      bank();
      void persist(step, answers);
    }, 5000);
    return () => clearTimeout(t);
  }, [answers, step, bank, persist]);

  useEffect(() => {
    shownAt.current = Date.now();
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step]);

  // Idle lock: a child's form hides itself after two minutes untouched, or thirty seconds in the background.
  useEffect(() => {
    if (!pinRequired || !pin || paused || gate) return;
    let last = Date.now();
    let hiddenAt = 0;
    const touch = () => (last = Date.now());
    const lock = () => {
      bank();
      setPaused(true);
    };
    const onVis = () => {
      if (document.hidden) hiddenAt = Date.now();
      else if (hiddenAt && Date.now() - hiddenAt > HIDDEN_MS) lock();
    };
    const evs = ["pointerdown", "keydown", "scroll", "touchstart", "input"] as const;
    evs.forEach((e) => window.addEventListener(e, touch, { passive: true }));
    document.addEventListener("visibilitychange", onVis);
    const t = setInterval(() => Date.now() - last > IDLE_MS && lock(), 10000);
    return () => {
      evs.forEach((e) => window.removeEventListener(e, touch));
      document.removeEventListener("visibilitychange", onVis);
      clearInterval(t);
    };
  }, [pinRequired, pin, paused, gate, bank]);

  const set = (k: string, v: Answer | undefined) => {
    dirty.current = true;
    setAnswers((prev) => {
      const n = { ...prev };
      if (v === undefined) delete n[k];
      else n[k] = v;
      return n;
    });
    setProblems((p) => p.filter((x) => x.k !== k && !x.k.startsWith("S1.")));
  };

  const go = async (dir: 1 | -1) => {
    setError(null);
    let newPin: string | null = null;
    if (dir === 1) {
      const p = validateSection(def, section, answers);
      if (p.length) {
        setProblems(p);
        setTimeout(() => document.getElementById(`q-${p[0].k}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 30);
        return;
      }
      if (pinRequired && !pin) {
        const bad = !/^\d{4}$/.test(pinA) ? "pinInvalid" : pinA !== pinB ? "pinMismatch" : /^(\d)\1{3}$/.test(pinA) || WEAK_PINS.has(pinA) ? "pinSimple" : null;
        if (bad) {
          setPinError(u(lang, bad));
          setTimeout(() => document.getElementById("q-pin")?.scrollIntoView({ behavior: "smooth", block: "center" }), 30);
          return;
        }
        newPin = pinA;
        setPin(pinA);
        setPinA("");
        setPinB("");
        setPinError(null);
      }
    }
    bank();
    setProblems([]);
    const next = Math.max(minStep, Math.min(def.sections.length - 1, step + dir));
    if (dir === 1 && step === def.sections.length - 1) return submit();
    setStep(next);
    void persist(next, answers, newPin);
  };

  const submit = async () => {
    setStatus("sending");
    try {
      const r = await submitInstrument({ source: def.source, token, answers, timings: timings.current });
      if (r.ok) {
        setStatus("done");
        return;
      }
      setStatus("idle");
      if (r.error === "invalid" && r.problems && r.section) {
        const i = def.sections.findIndex((s) => s.id === r.section);
        if (i >= 0) setStep(i);
        setProblems(r.problems);
        setError(u(lang, "fixBelow"));
        return;
      }
      setError(
        r.error === "link" ? u(lang, "errLink")
        : r.error === "locked" ? u(lang, "errLocked")
        : r.error === "done" ? u(lang, "errDone")
        : r.error === "session" ? u(lang, "errSession")
        : u(lang, "fixBelow"),
      );
    } catch {
      setStatus("idle");
      setError(u(lang, "errNetwork"));
    }
  };

  if (status === "done") return <>{done}</>;

  if (gate === "unlock" && token)
    return (
      <Unlock
        lang={lang}
        onUnlock={async (code) => {
          const r = await unlockDraft({ token, pin: code });
          if (r.ok) {
            setAnswers(r.answers);
            timings.current = { ...r.timings };
            setStep(Math.min(r.step, def.sections.length - 1));
            setPin(code);
            setGate(null);
            return null;
          }
          if (r.error === "wrong") return u(lang, "wrongPin", { left: r.left });
          setGate(null); // reset or nothing left: start fresh
          return r.error === "reset" ? u(lang, "resetDone") : null;
        }}
        onStartAgain={async () => {
          await discardDraft({ token });
          setGate(null);
        }}
      />
    );

  if (paused && pin)
    return (
      <Unlock
        lang={lang}
        paused
        onUnlock={async (code) => {
          if (code !== pin) return u(lang, "wrongLocal");
          shownAt.current = Date.now();
          setPaused(false);
          return null;
        }}
      />
    );

  const problemFor = (k: string) => problems.find((p) => p.k === k || (k === "S1.grid" && p.k.startsWith("S1.")));
  const visible = section.items.filter((i) => isVisible(i, answers));
  const last = step === def.sections.length - 1;

  return (
    <div className="inst" ref={top}>
      <div className="inst-progress" aria-hidden="true">
        <div style={{ width: `${Math.round(((step + 1) / def.sections.length) * 100)}%` }} />
      </div>
      <p className="inst-step">
        {u(lang, "section")} {step + 1} {u(lang, "of")} {def.sections.length}
        <span className="inst-save">{status === "saving" ? u(lang, "saving") : status === "saved" ? u(lang, "savedDraft") : ""}</span>
      </p>
      {step === 0 && preface}
      <h2 className="inst-title">{L(section.title)}</h2>
      {section.lead && <p className="inst-lead">{L(section.lead)}</p>}
      {step > 0 && minStep === step && def.sections[step - 1]?.lockOnLeave && <p className="small muted">{u(lang, "lockedBehind")}</p>}

      <div className="inst-items">
        {visible.map((item) => (
          <Field key={item.k} item={item} def={def} lang={lang} answers={answers} set={set} problem={problemFor(item.k)} />
        ))}
        {pinRequired && !pin && step === 0 && (
          <div className={`q${pinError ? " q-bad" : ""}`} id="q-pin">
            <p className="q-text">{u(lang, "pinTitle")}</p>
            <p className="small muted">{u(lang, def.band === "A" ? "pinLeadA" : "pinLead")}</p>
            <div className="pin-row">
              <label>
                <span className="small">{u(lang, "pinLabel")}</span>
                <input type="password" inputMode="numeric" autoComplete="off" maxLength={4} pattern="\d{4}" value={pinA} onChange={(e) => setPinA(e.target.value.replace(/\D/g, "").slice(0, 4))} aria-label={u(lang, "pinLabel")} />
              </label>
              <label>
                <span className="small">{u(lang, "pinAgain")}</span>
                <input type="password" inputMode="numeric" autoComplete="off" maxLength={4} pattern="\d{4}" value={pinB} onChange={(e) => setPinB(e.target.value.replace(/\D/g, "").slice(0, 4))} aria-label={u(lang, "pinAgain")} />
              </label>
            </div>
            {pinError && <p className="q-error" role="alert">{pinError}</p>}
          </div>
        )}
      </div>

      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}
      {problems.length > 0 && !error && (
        <p className="alert" role="alert">
          {u(lang, "fixBelow")}
        </p>
      )}

      <div className="inst-nav">
        {step > minStep ? (
          <button type="button" className="btn btn-quiet" onClick={() => go(-1)} disabled={status === "sending"}>
            {u(lang, "back")}
          </button>
        ) : (
          <span />
        )}
        <button type="button" className="btn" onClick={() => go(1)} disabled={status === "sending"} aria-busy={status === "sending"}>
          {status === "sending" ? u(lang, "sending") : last ? u(lang, "submit") : u(lang, "next")}
        </button>
      </div>
      <p className="small muted inst-resume">{u(lang, "resumeNote")}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ fields */

function Field({
  item,
  def,
  lang,
  answers,
  set,
  problem,
}: {
  item: Item;
  def: FormDef;
  lang: Lang;
  answers: Answers;
  set: (k: string, v: Answer | undefined) => void;
  problem?: Problem;
}) {
  const L = (x: { en: string; hi: string }) => x[lang];
  const v = answers[item.k];
  const msg = problem && (
    <p className="q-error" role="alert">
      {problem.code === "floor"
        ? u(lang, "floor", { n: problem.need ?? 0, m: textLength(String(v ?? "")) })
        : item.kind === "grid"
          ? u(lang, "requiredGrid")
          : problem.code === "invalid"
            ? u(lang, "invalid")
            : u(lang, "required")}
    </p>
  );
  const cls = `q${problem ? " q-bad" : ""}`;

  if (item.kind === "grid") {
    const subs = chosenSubjects(def, answers);
    return (
      <div className={cls} id={`q-${item.k}`}>
        <p className="q-text">{L(item.t)}</p>
        {subs.length === 0 ? (
          <p className="small muted">{u(lang, "pickSubjectsFirst")}</p>
        ) : (
          <div className="grid-subjects">
            {subs.map((s) => {
              const g = gridKeys(s.v);
              return (
                <div key={s.v} className="grid-row">
                  <p className="grid-name">{L(s.t)}</p>
                  {(["enjoy", "ease"] as const).map((axis) => (
                    <div key={axis} className="grid-axis">
                      <span className="grid-label">{u(lang, axis)}</span>
                      <Pills
                        name={g[axis]}
                        opts={["1", "2", "3", "4", "5"].map((x) => ({ v: x, t: { en: x, hi: x } }))}
                        value={answers[g[axis]]}
                        onChange={(x) => set(g[axis], x)}
                        lang={lang}
                        anchors={ANCHORS[axis]}
                      />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
        {msg}
      </div>
    );
  }

  if (item.kind === "multi") {
    const opts: Opt[] = item.k === "S1.0" ? (def.subjects ?? []).map((s) => ({ v: s.v, t: s.t })) : (item.opts ?? []);
    const cur = Array.isArray(v) ? v : [];
    const toggle = (o: Opt) => {
      let next: string[];
      if (cur.includes(o.v)) next = cur.filter((x) => x !== o.v);
      else if (o.exclusive) next = [o.v];
      else next = [...cur.filter((x) => !opts.find((p) => p.v === x)?.exclusive), o.v];
      set(item.k, next.length ? next : undefined);
    };
    return (
      <fieldset className={cls} id={`q-${item.k}`}>
        <legend className="q-text">{L(item.t)}</legend>
        <div className="opt-list">
          {opts.map((o) => (
            <label key={o.v} className={`opt${cur.includes(o.v) ? " opt-on" : ""}`}>
              <input type="checkbox" checked={cur.includes(o.v)} onChange={() => toggle(o)} />
              <span>{L(o.t)}</span>
            </label>
          ))}
        </div>
        {msg}
      </fieldset>
    );
  }

  if (item.kind === "subject") {
    const subs = chosenSubjects(def, answers);
    return (
      <fieldset className={cls} id={`q-${item.k}`}>
        <legend className="q-text">{L(item.t)}</legend>
        {subs.length === 0 ? (
          <p className="small muted">{u(lang, "pickSubjectsFirst")}</p>
        ) : (
          <div className="opt-list">
            {subs.map((s) => (
              <label key={s.v} className={`opt${v === s.v ? " opt-on" : ""}`}>
                <input type="radio" name={item.k} value={s.v} checked={v === s.v} onChange={() => set(item.k, s.v)} />
                <span>{L(s.t)}</span>
              </label>
            ))}
          </div>
        )}
        {msg}
      </fieldset>
    );
  }

  if (item.kind === "open") {
    const text = typeof v === "string" && v !== SKIP ? v : "";
    const skipped = v === SKIP;
    const n = item.floor ?? 0;
    const m = textLength(text);
    return (
      <div className={cls} id={`q-${item.k}`}>
        <label className="q-text" htmlFor={`in-${item.k}`}>
          {L(item.t)}
        </label>
        {item.help && <p className="small muted">{L(item.help)}</p>}
        {item.ex && (
          <details className="q-example">
            <summary>{u(lang, "example")}</summary>
            <p>{L(item.ex)}</p>
          </details>
        )}
        {skipped ? (
          <p className="small">
            {u(lang, "skipped")}{" "}
            <button type="button" className="linkbtn" onClick={() => set(item.k, undefined)}>
              {u(lang, "unskip")}
            </button>
          </p>
        ) : (
          <>
            <textarea id={`in-${item.k}`} rows={5} maxLength={4000} value={text} onChange={(e) => set(item.k, e.target.value)} />
            <div className="q-foot">
              <span className={`small ${n > 0 && m < n ? "muted" : "ok"}`}>
                {n > 0 ? u(lang, "chars", { m, n }) : u(lang, "charsFree", { m })}
              </span>
              {item.skippable && (
                <button type="button" className="linkbtn" onClick={() => set(item.k, SKIP)}>
                  {u(lang, "skip")}
                </button>
              )}
            </div>
          </>
        )}
        {msg}
      </div>
    );
  }

  if (item.kind === "text") {
    return (
      <div className={cls} id={`q-${item.k}`}>
        <label className="q-text" htmlFor={`in-${item.k}`}>
          {L(item.t)}
        </label>
        <input id={`in-${item.k}`} type="text" maxLength={120} value={typeof v === "string" ? v : ""} onChange={(e) => set(item.k, e.target.value)} autoComplete="off" />
        {msg}
      </div>
    );
  }

  if (item.kind === "check") {
    return (
      <div className={cls} id={`q-${item.k}`}>
        <label className="check">
          <input type="checkbox" checked={v === "yes"} onChange={(e) => set(item.k, e.target.checked ? "yes" : undefined)} />
          <span>
            <strong>{L(item.t)}</strong>
          </span>
        </label>
        {msg}
      </div>
    );
  }

  const opts = item.opts ?? [];
  if (PILL_KINDS.has(item.kind)) {
    return (
      <fieldset className={cls} id={`q-${item.k}`}>
        <legend className="q-text">{L(item.t)}</legend>
        <Pills
          name={item.k}
          opts={opts}
          value={v}
          onChange={(x) => set(item.k, x)}
          lang={lang}
          anchors={item.anchors ? ANCHORS[item.anchors] : undefined}
          size={item.kind === "a3"}
        />
        {msg}
      </fieldset>
    );
  }

  // choice / pair — described options, stacked.
  return (
    <fieldset className={cls} id={`q-${item.k}`}>
      <legend className="q-text">{L(item.t)}</legend>
      <div className="opt-list">
        {opts.map((o) => (
          <label key={o.v} className={`opt${v === o.v ? " opt-on" : ""}${o.v === "na" ? " opt-na" : ""}`}>
            <input type="radio" name={item.k} value={o.v} checked={v === o.v} onChange={() => set(item.k, o.v)} />
            <span>{L(o.t)}</span>
          </label>
        ))}
      </div>
      {msg}
    </fieldset>
  );
}

function Pills({
  name,
  opts,
  value,
  onChange,
  lang,
  anchors,
  size,
}: {
  name: string;
  opts: Opt[];
  value: Answer | undefined;
  onChange: (v: string) => void;
  lang: Lang;
  anchors?: { lo: { en: string; hi: string }; hi: { en: string; hi: string } };
  size?: boolean;
}) {
  return (
    <div className="pills-wrap">
      <div className={`scale-opts${size ? " scale-a3" : ""}`} role="radiogroup">
        {opts.map((o, i) => (
          <label key={o.v} className={`pill${o.v === "na" ? " pill-na" : ""}`}>
            <input type="radio" name={name} value={o.v} checked={value === o.v} onChange={() => onChange(o.v)} />
            <span>
              {size && <i className={`dot dot-${i + 1}`} aria-hidden="true" />}
              {o.t[lang]}
            </span>
          </label>
        ))}
      </div>
      {anchors && (
        <div className="anchor-row small muted">
          <span>1 = {anchors.lo[lang]}</span>
          <span>5 = {anchors.hi[lang]}</span>
        </div>
      )}
    </div>
  );
}

function Unlock({
  lang,
  paused,
  onUnlock,
  onStartAgain,
}: {
  lang: Lang;
  paused?: boolean;
  onUnlock: (code: string) => Promise<string | null>;
  onStartAgain?: () => Promise<void>;
}) {
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!/^\d{4}$/.test(code)) return setMsg(u(lang, "pinInvalid"));
    setBusy(true);
    const m = await onUnlock(code).catch(() => u(lang, "errNetwork"));
    setBusy(false);
    setCode("");
    setMsg(m);
  };
  return (
    <div className="panel panel-accent unlock">
      <h2>{u(lang, paused ? "pausedTitle" : "unlockTitle")}</h2>
      <p>{u(lang, paused ? "pausedLead" : "unlockLead")}</p>
      <div className="pin-row">
        <input
          type="password"
          inputMode="numeric"
          autoComplete="off"
          autoFocus
          maxLength={4}
          value={code}
          aria-label={u(lang, "pinLabel")}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <button type="button" className="btn" onClick={submit} disabled={busy}>
          {u(lang, "unlockBtn")}
        </button>
      </div>
      {msg && (
        <p className="q-error" role="alert">
          {msg}
        </p>
      )}
      {onStartAgain && (
        <p className="small" style={{ marginTop: 16 }}>
          <button
            type="button"
            className="linkbtn"
            onClick={async () => {
              if (window.confirm(u(lang, "startAgainConfirm"))) await onStartAgain();
            }}
          >
            {u(lang, "startAgain")}
          </button>
        </p>
      )}
    </div>
  );
}

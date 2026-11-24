"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { discardDraft, saveDraft, submitInstrument, unlockDraft } from "@/app/instrument-actions";
import { ANCHORS } from "@/lib/instrument/scales";
import type { Answer, Answers, FormDef, Item, Lang, Opt } from "@/lib/instrument/types";
import { u, type UKey } from "@/lib/instrument/ui";
import VoiceAnswer from "@/components/VoiceAnswer";
import { chosenSubjects, gridKeys, isVisible, SKIP, textLength, validateSection, type Problem } from "@/lib/instrument/validate";

type DraftData = { answers: Answers; timings: Record<string, number>; step: number };
type Props = {
  def: FormDef;
  lang: Lang;
  token?: string;
  initial?: DraftData | { locked: true; step: number } | null;
  /** Child forms: drafts are sealed with a 4-digit code the child chooses, and the page locks when left idle. */
  pinRequired?: boolean;
  /** Catalog subset for languages beyond English and Hindi. */
  dict?: Dict;
  /** Shown above the first section (assent, notice, administrator guidance). */
  preface?: ReactNode;
  done: ReactNode;
};


type Dict = Record<string, string>;
type TT = { en: string; hi: string };
/** Localise authored text: English and Hindi come from the source, other languages from the server-supplied dict. */
function loc(lang: Lang, x: TT, dict?: Dict): string {
  if (lang === "en") return x.en;
  if (lang === "hi") return x.hi;
  return dict?.[x.en] ?? x.en;
}
function useText(lang: Lang, dict?: Dict) {
  return {
    L: (x: TT) => loc(lang, x, dict),
    uu: (k: UKey, v?: Record<string, string | number>) => u(lang, k, v, dict),
  };
}

const PILL_KINDS = new Set(["freq", "obs", "a3", "rate"]);
const WEAK_PINS = new Set(["1234", "4321", "0123", "1212", "2580", "1122", "1004", "2000", "2025", "2026"]);
const IDLE_MS = 2 * 60 * 1000;
const HIDDEN_MS = 30 * 1000;

export default function InstrumentForm({ def, lang, token, initial, preface, done, pinRequired, dict }: Props) {
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
  const { L, uu } = useText(lang, dict);

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
          setPinError(uu(bad));
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
        setError(uu("fixBelow"));
        return;
      }
      setError(
        r.error === "link" ? uu("errLink")
        : r.error === "locked" ? uu("errLocked")
        : r.error === "done" ? uu("errDone")
        : r.error === "session" ? uu("errSession")
        : uu("fixBelow"),
      );
    } catch {
      setStatus("idle");
      setError(uu("errNetwork"));
    }
  };

  if (status === "done") return <>{done}</>;

  if (gate === "unlock" && token)
    return (
      <Unlock
        lang={lang}
        dict={dict}
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
          if (r.error === "wrong") return uu("wrongPin", { left: r.left });
          setGate(null); // reset or nothing left: start fresh
          return r.error === "reset" ? uu("resetDone") : null;
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
        dict={dict}
        paused
        onUnlock={async (code) => {
          if (code !== pin) return uu("wrongLocal");
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
        {uu("section")} {step + 1} {uu("of")} {def.sections.length}
        <span className="inst-save">{status === "saving" ? uu("saving") : status === "saved" ? uu("savedDraft") : ""}</span>
      </p>
      {step === 0 && preface}
      <h2 className="inst-title">{L(section.title)}</h2>
      {section.lead && <p className="inst-lead">{L(section.lead)}</p>}
      {step > 0 && minStep === step && def.sections[step - 1]?.lockOnLeave && <p className="small muted">{uu("lockedBehind")}</p>}

      <div className="inst-items">
        {visible.map((item) => (
          <Field key={item.k} item={item} def={def} lang={lang} dict={dict} answers={answers} set={set} problem={problemFor(item.k)} />
        ))}
        {pinRequired && !pin && step === 0 && (
          <div className={`q${pinError ? " q-bad" : ""}`} id="q-pin">
            <p className="q-text">{uu("pinTitle")}</p>
            <p className="small muted">{uu(def.band === "A" ? "pinLeadA" : "pinLead")}</p>
            <div className="pin-row">
              <label>
                <span className="small">{uu("pinLabel")}</span>
                <input type="password" inputMode="numeric" autoComplete="off" maxLength={4} pattern="\d{4}" value={pinA} onChange={(e) => setPinA(e.target.value.replace(/\D/g, "").slice(0, 4))} aria-label={uu("pinLabel")} />
              </label>
              <label>
                <span className="small">{uu("pinAgain")}</span>
                <input type="password" inputMode="numeric" autoComplete="off" maxLength={4} pattern="\d{4}" value={pinB} onChange={(e) => setPinB(e.target.value.replace(/\D/g, "").slice(0, 4))} aria-label={uu("pinAgain")} />
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
          {uu("fixBelow")}
        </p>
      )}

      <div className="inst-nav">
        {step > minStep ? (
          <button type="button" className="btn btn-quiet" onClick={() => go(-1)} disabled={status === "sending"}>
            {uu("back")}
          </button>
        ) : (
          <span />
        )}
        <button type="button" className="btn" onClick={() => go(1)} disabled={status === "sending"} aria-busy={status === "sending"}>
          {status === "sending" ? uu("sending") : last ? uu("submit") : uu("next")}
        </button>
      </div>
      <p className="small muted inst-resume">{uu("resumeNote")}</p>
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
  dict,
}: {
  item: Item;
  def: FormDef;
  lang: Lang;
  dict?: Dict;
  answers: Answers;
  set: (k: string, v: Answer | undefined) => void;
  problem?: Problem;
}) {
  const { L, uu } = useText(lang, dict);
  const v = answers[item.k];
  const msg = problem && (
    <p className="q-error" role="alert">
      {problem.code === "floor"
        ? uu("floor", { n: problem.need ?? 0, m: textLength(String(v ?? "")) })
        : item.kind === "grid"
          ? uu("requiredGrid")
          : problem.code === "invalid"
            ? uu("invalid")
            : uu("required")}
    </p>
  );
  const cls = `q${problem ? " q-bad" : ""}`;

  if (item.kind === "grid") {
    const subs = chosenSubjects(def, answers);
    return (
      <div className={cls} id={`q-${item.k}`}>
        <p className="q-text">{L(item.t)}</p>
        {subs.length === 0 ? (
          <p className="small muted">{uu("pickSubjectsFirst")}</p>
        ) : (
          <div className="grid-subjects">
            {subs.map((s) => {
              const g = gridKeys(s.v);
              return (
                <div key={s.v} className="grid-row">
                  <p className="grid-name">{L(s.t)}</p>
                  {(["enjoy", "ease"] as const).map((axis) => (
                    <div key={axis} className="grid-axis">
                      <span className="grid-label">{uu(axis)}</span>
                      <Pills
                        dict={dict}
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
          <p className="small muted">{uu("pickSubjectsFirst")}</p>
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
            <summary>{uu("example")}</summary>
            <p>{L(item.ex)}</p>
          </details>
        )}
        {skipped ? (
          <p className="small">
            {uu("skipped")}{" "}
            <button type="button" className="linkbtn" onClick={() => set(item.k, undefined)}>
              {uu("unskip")}
            </button>
          </p>
        ) : (
          <>
            <textarea id={`in-${item.k}`} rows={5} maxLength={4000} value={text} onChange={(e) => set(item.k, e.target.value)} />
            <VoiceAnswer lang={lang} uu={(k) => uu(k as UKey)} current={text} onConfirm={(t) => set(item.k, t)} />
            <div className="q-foot">
              <span className={`small ${n > 0 && m < n ? "muted" : "ok"}`}>
                {n > 0 ? uu("chars", { m, n }) : uu("charsFree", { m })}
              </span>
              {item.skippable && (
                <button type="button" className="linkbtn" onClick={() => set(item.k, SKIP)}>
                  {uu("skip")}
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
          dict={dict}
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
  dict,
}: {
  dict?: Dict;
  name: string;
  opts: Opt[];
  value: Answer | undefined;
  onChange: (v: string) => void;
  lang: Lang;
  anchors?: { lo: { en: string; hi: string }; hi: { en: string; hi: string } };
  size?: boolean;
}) {
  const { L } = useText(lang, dict);
  return (
    <div className="pills-wrap">
      <div className={`scale-opts${size ? " scale-a3" : ""}`} role="radiogroup">
        {opts.map((o, i) => (
          <label key={o.v} className={`pill${o.v === "na" ? " pill-na" : ""}`}>
            <input type="radio" name={name} value={o.v} checked={value === o.v} onChange={() => onChange(o.v)} />
            <span>
              {size && <i className={`dot dot-${i + 1}`} aria-hidden="true" />}
              {L(o.t)}
            </span>
          </label>
        ))}
      </div>
      {anchors && (
        <div className="anchor-row small muted">
          <span>1 = {L(anchors.lo)}</span>
          <span>5 = {L(anchors.hi)}</span>
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
  dict,
}: {
  dict?: Dict;
  lang: Lang;
  paused?: boolean;
  onUnlock: (code: string) => Promise<string | null>;
  onStartAgain?: () => Promise<void>;
}) {
  const { uu } = useText(lang, dict);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!/^\d{4}$/.test(code)) return setMsg(uu("pinInvalid"));
    setBusy(true);
    const m = await onUnlock(code).catch(() => uu("errNetwork"));
    setBusy(false);
    setCode("");
    setMsg(m);
  };
  return (
    <div className="panel panel-accent unlock">
      <h2>{uu(paused ? "pausedTitle" : "unlockTitle")}</h2>
      <p>{uu(paused ? "pausedLead" : "unlockLead")}</p>
      <div className="pin-row">
        <input
          type="password"
          inputMode="numeric"
          autoComplete="off"
          autoFocus
          maxLength={4}
          value={code}
          aria-label={uu("pinLabel")}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
          onKeyDown={(e) => e.key === "Enter" && submit()}
        />
        <button type="button" className="btn" onClick={submit} disabled={busy}>
          {uu("unlockBtn")}
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
              if (window.confirm(uu("startAgainConfirm"))) await onStartAgain();
            }}
          >
            {uu("startAgain")}
          </button>
        </p>
      )}
    </div>
  );
}

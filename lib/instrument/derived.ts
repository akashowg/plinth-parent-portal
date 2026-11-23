import { ageClassDivergence, chosenSubjects, gridKeys } from "./forms";
import type { Submitted, Validity } from "./scoring";
import type { Band, Source } from "./types";

/**
 * Derived cross-construct signals. Each one is a reading the engine must take into account before it
 * interprets anything nearby — e.g. a language mismatch blocks any comprehension inference.
 */
export type Derived = { id: string; reading: string; evidence: string[]; engine_rule?: string };

const num = (v: unknown) => (typeof v === "string" && v !== "" && v !== "na" ? Number(v) : NaN);

export function deriveSignals(
  band: Band,
  ctx: { age: number; klass: string },
  subs: Partial<Record<Source, Submitted>>,
  val: Partial<Record<Source, Validity>>,
): Derived[] {
  const out: Derived[] = [];
  const S = subs.student?.answers ?? {};
  const P = subs.parent?.answers ?? {};
  const T = subs.teacher?.answers ?? {};

  // Age–class divergence (environmental signal, not a data error).
  const gap = ageClassDivergence(ctx.age, ctx.klass);
  if (gap !== null && Math.abs(gap) > 1.5)
    out.push({
      id: "age_class_divergence",
      reading: `Age ${ctx.age.toFixed(1)} is ${Math.abs(gap).toFixed(1)} years ${gap > 0 ? "above" : "below"} the typical age for ${ctx.klass}.`,
      evidence: ["date of birth", "current class"],
      engine_rule: "Treat as an environmental signal (early or late start, repeated year, transfer). Never as a cognitive finding.",
    });

  // Language mismatch between home and instruction.
  const instr = P["P1.5"];
  const home = (S["S10.5"] as string) || (P["P1.6"] as string);
  if (typeof instr === "string" && typeof home === "string" && instr !== "mixed" && instr !== "other" && home !== instr)
    out.push({
      id: "language_mismatch",
      reading: `Home language (${home}) differs from the language of instruction (${instr}).`,
      evidence: ["S10.5 / P1.6", "P1.5"],
      engine_rule: "Blocks any cognitive-comprehension inference until the mismatch has been accounted for.",
    });

  if (subs.student && band !== "A") {
    const def = subs.student.def;
    // Engagement–output gap per subject.
    const rows = chosenSubjects(def, S).map((s) => {
      const g = gridKeys(s.v);
      return { subject: s.t.en, enjoy: num(S[g.enjoy]), ease: num(S[g.ease]) };
    });
    const suppressed = rows.filter((r) => r.enjoy >= 4 && r.ease <= 2);
    const hardest = def.subjects?.find((s) => s.v === S["S1.19"])?.t.en;
    const attribution = Array.isArray(S["S1.20"]) ? (S["S1.20"] as string[]) : [];
    const ENV = ["pace", "basics", "method", "language", "nohelp"];
    const gapSubject = S["S1.21"] === "yes" ? def.subjects?.find((s) => s.v === S["S1.21s"])?.t.en : undefined;
    out.push({
      id: "engagement_output_gap",
      reading:
        (suppressed.length
          ? `High enjoyment with low ease in ${suppressed.map((r) => r.subject).join(", ")} — the suppressed-capability pattern.`
          : "No subject shows high enjoyment with low ease.") +
        (hardest ? ` Hardest subject: ${hardest}; attributed to ${attribution.join(", ") || "—"}` : "") +
        (attribution.length ? ` (${attribution.filter((x) => ENV.includes(x)).length} environmental, ${attribution.includes("boring") ? "1 motivational" : "0 motivational"}, ${attribution.includes("fear") ? "1 emotional" : "0 emotional"}).` : ".") +
        (gapSubject ? ` Student reports marks below interest in ${gapSubject}.` : ""),
      evidence: rows.map((r) => `${r.subject}: enjoy ${r.enjoy} · ease ${r.ease}`),
      engine_rule: "Requires the environmental attribution (S1.20) before any interpretation. Difficulty is not ability.",
    });

    // Help-seeking mode: S2.1 (tries first) × S6.5 (asks early) × S6.6 raw (depends on others).
    const tries = num(S["S2.1"]), asks = num(S["S6.5"]), depends = num(S["S6.6"]);
    if (![tries, asks, depends].some(Number.isNaN)) {
      const mode =
        asks >= 4 && tries >= 4 && depends <= 2 ? "adaptive"
        : asks >= 4 && tries <= 2 && depends >= 4 ? "dependent"
        : asks <= 2 && depends >= 4 ? "avoidant"
        : "mixed";
      out.push({ id: "help_seeking_mode", reading: `Help-seeking pattern reads as ${mode}.`, evidence: [`S2.1 ${tries}`, `S6.5 ${asks}`, `S6.6 ${depends}`] });
    }

    // Confidence variability.
    const ctxConf = num(S["S5.7"]);
    const pConf = P["P3.5"];
    if (!Number.isNaN(ctxConf))
      out.push({
        id: "confidence_variability",
        reading:
          ctxConf >= 4
            ? "Student reports confidence that depends strongly on context — situational, not globally low."
            : "Student reports fairly stable confidence across situations.",
        evidence: [`S5.7 ${ctxConf}`, `S5.1 ${S["S5.1"] ?? "—"}`, `P3.5 ${pConf ?? "—"}`, `T5.3 ${T["T5.3"] ?? "—"}`],
        engine_rule: "Distinguish context-dependent confidence from globally low confidence; they call for different support.",
      });

    // Aspiration source and family mediation.
    const src = S["S8.2"];
    if (typeof src === "string")
      out.push({
        id: "aspiration_alignment",
        reading:
          `Student’s picture of the future comes mostly from: ${src}. Direction: ${S["S8.1"] ?? "—"}.` +
          (src === "family" ? " Family-mediated: cap every interest-derived inference at Moderate." : ""),
        evidence: ["S8.1", "S8.2", "P9.1 (parent hope)", "P9.2 (parent’s model of the child’s hope)"],
        engine_rule:
          "Read P9.1, P9.2 and the student’s own answers together: convergent, aware divergence, or unaware divergence. This governs how career and roadmap language may be framed.",
      });
  }

  // Digital displacement — duration alone is not a finding.
  const sDisp = num(S["S9.5"]), pDisp = num(P["P7.4"]);
  if (!Number.isNaN(sDisp) || !Number.isNaN(pDisp))
    out.push({
      id: "digital_displacement",
      reading:
        sDisp >= 4 && pDisp >= 4
          ? "Displacement reported by both student and parent — a finding."
          : sDisp >= 4 || pDisp >= 4
            ? `Displacement reported by ${sDisp >= 4 ? "the student" : "the parent"} only — an emerging signal.`
            : "No meaningful displacement reported.",
      evidence: [`S9.4 ${S["S9.4"] ?? "—"}`, `S9.5 ${S["S9.5"] ?? "—"}`, `P7.3 ${P["P7.3"] ?? "—"}`, `P7.4 ${P["P7.4"] ?? "—"}`],
    });

  // Environmental load — tuition hours against discretionary time.
  const tuition = (S["S10.4"] as string) || (P["P6.4"] as string);
  const freeTime = num(S["S10.7"]);
  if (tuition)
    out.push({
      id: "environmental_load",
      reading:
        (["8-12", "12+"].includes(tuition) ? `Heavy tuition load (${tuition} hours a week)` : `Tuition ${tuition} hours a week`) +
        (!Number.isNaN(freeTime) ? `; time for non-school things rated ${freeTime}/5.` : "."),
      evidence: [`S10.4 ${S["S10.4"] ?? "—"}`, `P6.4 ${P["P6.4"] ?? "—"}`, `S10.7 ${S["S10.7"] ?? "—"}`],
      engine_rule: "Where load is heavy and discretionary time low, use the Environmental Mismatch framing.",
    });

  // Routine–need fit.
  const fit = P["P6.1"];
  if (typeof fit === "string" && fit !== "na")
    out.push({
      id: "routine_need_fit",
      reading:
        (fit === "c" || fit === "d" ? "Parent acknowledges a mismatch between home routines and the child’s needs." : "Parent reports home routines mostly match the child’s needs.") +
        (S["S10.1"] ? ` Student study place: ${S["S10.1"]}; has what they need: ${S["S10.2"] ?? "—"}/5.` : ""),
      evidence: ["P6.1", "S10.1", "S10.2"],
      engine_rule: "Parent-acknowledged mismatch converging with student-reported study conditions is a high-confidence environmental finding.",
    });

  // Parent visibility as an environmental signal.
  if (val.parent?.flags.includes("parent_observation_confidence_low") || val.parent?.flags.includes("parent_limited_contact_hours"))
    out.push({
      id: "parent_visibility_limited",
      reading: "The parent reports limited visibility of parts of the child’s day. Parent observations there are down-weighted, not discarded.",
      evidence: ["P1.1", "P1.4", "P3.c", "P5.c"],
    });

  return out;
}

/* ------------------------------------------------------------------ interest texture (RIASEC-24) */

export type InterestTexture = {
  status: "not_collected" | "provisional" | "collected" | "invalidated";
  themes?: Record<"R" | "I" | "A" | "S" | "E" | "C", number>;
  rule: string;
};

export function interestTexture(sub: Submitted | undefined, val: Validity | undefined): InterestTexture {
  const rule =
    "Engine-internal only. Never print theme letters or a Holland code. Interest is never reported as talent. When this is the sole source for a claim, confidence caps at Moderate. Enterprising and Conventional are read as family-mediated unless S8.2 says otherwise.";
  if (!sub || sub.def.band === "A" || (sub.def.age ?? 0) < 12) return { status: "not_collected", rule };
  if (val?.straightlined.includes("s11")) return { status: "invalidated", rule };
  const items = sub.def.sections.find((s) => s.id === "s11")?.items ?? [];
  const sums: Record<string, number[]> = {};
  for (const i of items) {
    const v = Number(sub.answers[i.k]);
    if (i.riasec && v >= 1 && v <= 5) (sums[i.riasec] ??= []).push(v);
  }
  const themes = Object.fromEntries(
    (["R", "I", "A", "S", "E", "C"] as const).map((t) => [t, sums[t]?.length ? Math.round((sums[t].reduce((a, b) => a + b, 0) / sums[t].length) * 100) / 100 : 0]),
  ) as InterestTexture["themes"];
  return { status: (sub.def.age ?? 0) < 15 ? "provisional" : "collected", themes, rule };
}

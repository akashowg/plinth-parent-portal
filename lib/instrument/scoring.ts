import { CONSTRUCTS, INDIVIDUAL_ATTENTION_ITEMS, SOURCE_WEIGHTS, parentVisibilityKey, type Construct } from "./constructs";
import { allItems, isVisible } from "./forms";
import type { Answers, Band, FormDef, Item, Source } from "./types";

/* ====================================================================================================
 * 1 · Item normalisation — every scorable answer becomes a value on 1–5 (reverse-coded items inverted).
 * ==================================================================================================*/

export type Submitted = { def: FormDef; answers: Answers; timings: Record<string, number> };

export function itemIndex(def: FormDef): Map<string, Item> {
  return new Map(allItems(def).map((i) => [i.k, i]));
}

export function itemValue(item: Item | undefined, raw: unknown, override?: Record<string, number>): number | null {
  if (!item || typeof raw !== "string" || raw === "" || raw === "na") return null;
  if (override && raw in override) return override[raw];
  let v: number | null = null;
  if (item.kind === "freq" || item.kind === "obs" || item.kind === "rate") {
    const n = Number(raw);
    v = n >= 1 && n <= 5 ? n : null;
  } else if (item.kind === "a3" || item.kind === "choice") {
    const o = item.opts?.find((x) => x.v === raw);
    v = o?.s ?? null;
  }
  if (v === null) return null;
  return item.rev ? 6 - v : v;
}

/* ====================================================================================================
 * 2 · Validity architecture — nine controls, none visible as controls. Output is a set of flags that can
 * only ever reduce the confidence the engine may express.
 * ==================================================================================================*/

export type Validity = {
  source: Source;
  flags: string[];
  attention?: { failed: number; total: number };
  consistency?: { pair: string; a: number | null; b: number | null; divergent: boolean }[];
  socialDesirability?: { endorsed: number; total: number };
  straightlined: string[];
  rushed: { section: string; seconds: number; floor: number }[];
  /** Per-block parent visibility multipliers (0.5–1.0). */
  parentVisibility?: Record<string, number>;
  teacherTenureWeight?: number;
  teacherLargeClass?: boolean;
  humanReview: boolean;
};

const CONSISTENCY_PAIRS: [string, string][] = [
  ["S2.1", "S6.6"],
  ["S3.8", "S4.6"],
  ["S5.6", "S5.9"],
];

const visibilityWeight = (raw: unknown) => {
  const n = Number(raw);
  return n >= 1 && n <= 5 ? 0.5 + (n - 1) * 0.125 : 1;
};

function itemSeconds(i: Item, def: FormDef, a: Answers): number {
  if (i.sec !== undefined && i.kind !== "grid") return i.sec;
  switch (i.kind) {
    case "grid": {
      const picked = Array.isArray(a["S1.0"]) ? (a["S1.0"] as string[]).length : 0;
      return picked * 2 * 4;
    }
    case "open":
      return 60;
    case "multi":
      return 10;
    case "text":
      return 5;
    case "check":
      return 3;
    case "rate":
      return 4;
    default:
      return 7;
  }
}

export function validity(sub: Submitted): Validity {
  const { def, answers: a, timings } = sub;
  const idx = itemIndex(def);
  const out: Validity = { source: def.source, flags: [], straightlined: [], rushed: [], humanReview: false };

  // Section timing — below 40% of the modelled floor is "rushed".
  for (const s of def.sections) {
    const floor = s.items.filter((i) => isVisible(i, a)).reduce((t, i) => t + itemSeconds(i, def, a), 0);
    const spent = (timings[s.id] ?? 0) / 1000;
    if (floor >= 20 && spent > 0 && spent < floor * 0.4) out.rushed.push({ section: s.id, seconds: Math.round(spent), floor });
  }

  // Straightlining — near-identical raw answers across a section of ≥ 8 rated items.
  const rated = (i: Item) => i.kind === "freq" || i.kind === "rate" || i.kind === "obs";
  for (const s of def.sections) {
    const vals = s.items.filter(rated).map((i) => a[i.k]).filter((v): v is string => typeof v === "string" && v !== "na");
    if (vals.length < 8) continue;
    const counts = new Map<string, number>();
    for (const v of vals) counts.set(v, (counts.get(v) ?? 0) + 1);
    const modal = Math.max(...counts.values());
    if (modal / vals.length >= 0.9) out.straightlined.push(s.id);
  }
  if (def.source === "teacher") {
    const vals = allItems(def).filter((i) => i.kind === "obs").map((i) => a[i.k]).filter((v): v is string => typeof v === "string" && v !== "na");
    if (vals.length >= 12 && new Set(vals).size === 1) out.flags.push("teacher_uniform_ratings");
  }
  if (out.straightlined.length) out.flags.push("straightlining");
  if (out.rushed.length) out.flags.push("rushed_sections");
  if (out.rushed.some((r) => out.straightlined.includes(r.section))) out.humanReview = true;

  if (def.source === "student" && def.band !== "A") {
    // Attention checks.
    const checks = allItems(def).filter((i) => i.v === "attn");
    const failed = checks.filter((i) => a[i.k] !== i.expect).length;
    out.attention = { failed, total: checks.length };
    if (failed === 1) out.flags.push("attention_check_one_failed");
    if (failed >= 2) out.flags.push("attention_checks_failed");

    // Consistency pairs (semantically near-equivalent items placed sections apart).
    out.consistency = CONSISTENCY_PAIRS.map(([x, y]) => {
      const vx = itemValue(idx.get(x), a[x]);
      const vy = itemValue(idx.get(y), a[y]);
      return { pair: `${x}↔${y}`, a: vx, b: vy, divergent: vx !== null && vy !== null && Math.abs(vx - vy) >= 2 };
    });
    if (out.consistency.filter((c) => c.divergent).length >= 2) out.flags.push("careless_responding");

    // Social desirability — implausible-virtue items endorsed at Often / Almost always.
    const sd = allItems(def).filter((i) => i.v === "sd");
    const endorsed = sd.filter((i) => Number(a[i.k]) >= 4).length;
    out.socialDesirability = { endorsed, total: sd.length };
    if (endorsed >= 3) out.flags.push("impression_management");

    // Observed while answering (the form must be completed without a parent present).
    if (a["S0.alone"] === "watching") out.flags.push("possibly_observed");
  }

  if (def.source === "parent") {
    out.parentVisibility = {
      "P1.4": visibilityWeight(a["P1.4"]),
      "P3.c": visibilityWeight(a["P3.c"] ?? a["P1.4"]),
      "P5.c": visibilityWeight(a["P5.c"] ?? a["P1.4"]),
    };
    if (Object.values(out.parentVisibility).some((w) => w <= 0.625)) out.flags.push("parent_observation_confidence_low");
    if (a["P1.1"] === "lt1") out.flags.push("parent_limited_contact_hours");
  }

  if (def.source === "teacher") {
    out.teacherTenureWeight = a["T1.1"] === "lt_term" ? 0.6 : 1;
    out.teacherLargeClass = a["T1.3"] === "45+";
    if (out.teacherTenureWeight < 1) out.flags.push("teacher_tenure_under_one_term");
    if (out.teacherLargeClass) out.flags.push("teacher_class_over_45");
  }
  return out;
}

/* ====================================================================================================
 * 3 · Signal ledger — one entry per construct. Values per source, convergence verdict, confidence tier,
 * the flags that shaped it, and the engine permission block that enforces the governance rules.
 * ==================================================================================================*/

export type Tier = "high" | "moderate" | "low" | "insufficient";
const TIER_ORDER: Tier[] = ["insufficient", "low", "moderate", "high"];
const capTier = (t: Tier, cap: Tier): Tier => (TIER_ORDER.indexOf(t) > TIER_ORDER.indexOf(cap) ? cap : t);

export type SourceValue = { value: number; n_items: number; weight: number; items: string[] };

export type LedgerEntry = {
  construct: string;
  label: string;
  cluster: string;
  maps_to: { hdi: number[]; pic: string[] };
  sources: Partial<Record<Source, SourceValue>>;
  combined: number | null;
  convergence: "convergent" | "partial" | "divergent" | "single_source" | "none";
  divergence_pairs: [Source, Source, number][];
  contradiction_token: string | null;
  confidence: Tier;
  confidence_basis: string;
  flags: string[];
  band_gate: string | null;
  engine_permission: { may_state: boolean; may_suggest: boolean; must_preserve_contradiction: boolean; permitted_frames: string[] };
};

const INITIAL: Record<Source, string> = { student: "S", parent: "P", teacher: "T" };

export function buildLedger(band: Band, subs: Partial<Record<Source, Submitted>>, val: Partial<Record<Source, Validity>>): LedgerEntry[] {
  const idx: Partial<Record<Source, Map<string, Item>>> = {};
  for (const s of Object.keys(subs) as Source[]) idx[s] = itemIndex(subs[s]!.def);
  const vs = val.student;
  const straight = new Set(vs?.straightlined ?? []);
  const studentSectionOf = (k: string) => subs.student?.def.sections.find((s) => s.items.some((i) => i.k === k))?.id;

  return CONSTRUCTS.map((c) => {
    const flags: string[] = [];
    let bandGate: string | null = null;
    const sources: Partial<Record<Source, SourceValue>> = {};

    for (const src of ["student", "parent", "teacher"] as Source[]) {
      const sub = subs[src];
      if (!sub) continue;
      if (src === "student" && band === "A" && c.adultOnlyInA) {
        bandGate = "band_a_adult_sources_only";
        continue;
      }
      let keys = src === "student" ? (band === "A" ? c.studentA : c.student) : src === "parent" ? c.parent : c.teacher;
      if (!keys?.length) continue;
      if (src === "student") {
        const dropped = keys.filter((k) => straight.has(studentSectionOf(k) ?? ""));
        if (dropped.length) flags.push("student_section_invalidated_straightlining");
        keys = keys.filter((k) => !dropped.includes(k));
      }
      const used: string[] = [];
      const vals: number[] = [];
      for (const k of keys) {
        const v = itemValue(idx[src]!.get(k), sub.answers[k], c.optionScores?.[k]);
        if (v !== null) {
          vals.push(v);
          used.push(k);
        }
      }
      if (vals.length < 2) continue;
      let weight = SOURCE_WEIGHTS[band][src];
      if (src === "parent" && val.parent?.parentVisibility) {
        const pv = val.parent.parentVisibility;
        const m = used.reduce((t, k) => t + (pv[parentVisibilityKey(k)] ?? 1), 0) / used.length;
        weight *= m;
        if (m <= 0.625) flags.push("parent_observation_confidence_low");
      }
      if (src === "teacher" && val.teacher) {
        weight *= val.teacher.teacherTenureWeight ?? 1;
        if (val.teacher.teacherLargeClass && used.some((k) => INDIVIDUAL_ATTENTION_ITEMS.has(k))) weight *= 0.85;
        if (val.teacher.flags.includes("teacher_uniform_ratings")) {
          weight *= 0.7;
          flags.push("teacher_uniform_ratings");
        }
      }
      if (src === "student" && vs?.flags.includes("attention_checks_failed")) weight *= 0.3;
      sources[src] = { value: round(mean(vals)), n_items: vals.length, weight: round(weight), items: used };
    }

    // Convergence — never averaged across divergent sources.
    const present = (Object.keys(sources) as Source[]).filter((s) => sources[s]);
    const pairs: [Source, Source, number][] = [];
    for (let i = 0; i < present.length; i++)
      for (let j = i + 1; j < present.length; j++)
        pairs.push([present[i], present[j], round(Math.abs(sources[present[i]]!.value - sources[present[j]]!.value))]);
    const maxGap = pairs.reduce((m, p) => Math.max(m, p[2]), 0);
    const convergence: LedgerEntry["convergence"] =
      present.length === 0 ? "none" : present.length === 1 ? "single_source" : maxGap >= 1.5 ? "divergent" : maxGap <= 1.0 ? "convergent" : "partial";
    const divergent = pairs.filter((p) => p[2] >= 1.5);

    let confidence: Tier =
      convergence === "none" ? "insufficient"
      : convergence === "single_source" || convergence === "divergent" ? "low"
      : convergence === "convergent" ? (present.length >= 3 ? "high" : "moderate")
      : present.length >= 3 ? "moderate" : "low";
    const basis = [`${present.length} source${present.length === 1 ? "" : "s"} present`];
    if (divergent.length) basis.push(divergent.map((d) => `${d[0]}–${d[1]} divergence ${d[2]}`).join("; "));

    // Validity flags propagate to confidence. They can only reduce it.
    const usesStudent = !!sources.student;
    if (usesStudent && vs) {
      if (vs.flags.includes("careless_responding")) {
        const pairItems = new Set(CONSISTENCY_PAIRS.flat());
        if (sources.student!.items.some((k) => pairItems.has(k))) {
          confidence = capTier(confidence, "low");
          flags.push("careless_responding");
        }
      }
      if (vs.flags.includes("impression_management")) {
        confidence = capTier(confidence, c.characterLeadership ? "low" : "moderate");
        flags.push("impression_management");
      }
      if (vs.flags.includes("attention_checks_failed")) {
        confidence = capTier(confidence, present.length === 1 ? "low" : "moderate");
        flags.push("attention_checks_failed");
      }
      if (vs.flags.includes("possibly_observed") && c.cluster === "Emotional regulation & recovery") {
        confidence = capTier(confidence, "moderate");
        flags.push("possibly_observed");
      }
    }
    if (band === "B" && c.id === "direction_meaning" && usesStudent) {
      bandGate = "band_b_identity_provisional";
      confidence = capTier(confidence, "moderate");
    }

    const combined =
      convergence === "convergent" || convergence === "partial" || convergence === "single_source"
        ? round(present.reduce((t, s) => t + sources[s]!.value * sources[s]!.weight, 0) / present.reduce((t, s) => t + sources[s]!.weight, 0))
        : null;
    const token = divergent.length
      ? `${divergent.map((d) => INITIAL[d[0]] + INITIAL[d[1]]).join("_")}_${c.id.toUpperCase()}_GAP`
      : null;

    return {
      construct: c.id,
      label: c.label,
      cluster: c.cluster,
      maps_to: { hdi: c.hdi, pic: c.pic },
      sources,
      combined,
      convergence,
      divergence_pairs: pairs,
      contradiction_token: token,
      confidence,
      confidence_basis: basis.join("; "),
      flags: [...new Set(flags)],
      band_gate: bandGate,
      engine_permission: {
        may_state: (confidence === "high" || confidence === "moderate") && convergence !== "divergent",
        may_suggest: confidence !== "insufficient",
        must_preserve_contradiction: convergence === "divergent",
        permitted_frames: convergence === "divergent" ? [...new Set(["context_variability", ...c.frames])] : c.frames,
      },
    } satisfies LedgerEntry;
  });
}

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
const round = (x: number) => Math.round(x * 100) / 100;

export type { Construct };

import "server-only";
import type { CaseRow, Parent } from "./cases";
import { educatorIntegrity } from "./integrity";
import { ANCHORS, FREQ } from "./instrument/scales";
import { allItems, chosenSubjects, gridKeys, isVisible, SKIP } from "./instrument/forms";
import { heldItems } from "./instrument/safeguarding";
import type { Analysis } from "./instrument/store";
import type { Item, Source } from "./instrument/types";

const SOURCE_LETTER: Record<Source, string> = { student: "S", parent: "P", teacher: "T" };
const TITLE: Record<Source, string> = { student: "STUDENT RESPONSES", parent: "PARENT RESPONSES", teacher: "TEACHER RESPONSES" };

/** Display ID in the specification’s notation: Band · Source · Section.Item, with (R) for reverse-coded. */
export function displayId(band: string, source: Source, key: string, item?: Item): string {
  const rest = key.replace(/^a?[SPT]/, "");
  return `${key.startsWith("a") ? "A" : band}·${SOURCE_LETTER[source]}·${rest}${item?.rev ? " (R)" : ""}${item?.provisionalB && band === "B" ? " (provisional)" : ""}`;
}

export function answerText(item: Item, raw: unknown, subjects: { v: string; t: { en: string } }[]): string {
  if (raw === undefined || raw === null || raw === "") return "(no answer)";
  if (raw === SKIP) return "(skipped by respondent)";
  if (Array.isArray(raw)) {
    const pool = item.k === "S1.0" ? subjects : (item.opts ?? []);
    return raw.map((v) => pool.find((o) => o.v === v)?.t.en ?? v).join("; ");
  }
  const v = String(raw);
  if (item.kind === "subject") return subjects.find((s) => s.v === v)?.t.en ?? v;
  if (item.kind === "freq" || item.kind === "obs") return v === "na" ? "Not observed" : `${v} · ${FREQ.find((o) => o.v === v)?.t.en ?? ""}`;
  if (item.kind === "rate") {
    const a = item.anchors ? ANCHORS[item.anchors] : undefined;
    return a ? `${v} (1 = ${a.lo.en}, 5 = ${a.hi.en})` : v;
  }
  if (item.kind === "check") return v === "yes" ? "Confirmed" : v;
  const o = item.opts?.find((x) => x.v === v);
  return o ? o.t.en : v;
}

function openText(a: Analysis, source: Source): string {
  const sub = a.submitted[source];
  if (!sub) return "";
  const held = heldItems(a.hits);
  return allItems(sub.def)
    .filter((i) => i.kind === "open" && !i.reviewerOnly && !held.has(i.k))
    .map((i) => sub.answers[i.k])
    .filter((v): v is string => typeof v === "string" && v !== SKIP)
    .join("\n");
}

export function integrityCheck(a: Analysis) {
  if (!a.submitted.teacher || !a.submitted.parent) return null;
  return educatorIntegrity(openText(a, "teacher"), openText(a, "parent"));
}

/**
 * Paste-ready intake for PLINTH Studio. The signal ledger comes first and its permissions are binding on the
 * engine; item-level responses follow with permanent IDs. Validity items, reviewer-only notes and any text
 * held under safeguarding are never included.
 */
export function studioText(c: CaseRow, parent: Parent, a: Analysis): string {
  const { ctx } = a;
  const child = ctx.child;
  const L: string[] = [];
  const held = heldItems(a.hits);
  const sources: Source[] = ["student", "parent", "teacher"];

  L.push("=== PLINTH HDI INTAKE · INSTRUMENT v2.0 — exported from the PLINTH Parent Portal ===");
  L.push(`Case reference: ${c.ref}`);
  L.push(`Instrument: ${a.version} · Band ${ctx.band} (${ctx.band === "A" ? "6–10, child form read aloud by a non-parent adult" : ctx.band === "B" ? "11–14" : "15–18"}) · source weights ${ctx.band === "A" ? "S15/P40/T45" : ctx.band === "B" ? "S40/P30/T30" : "S50/P22/T28"}`);
  L.push(`Consent: parent/guardian consent given and email verified ${c.verified_at ? new Date(c.verified_at).toISOString() : "—"}`);
  L.push(`Sources received: ${sources.map((s) => `${s} ${a.submitted[s] ? "yes" : a.legacy.includes(s) ? "legacy v1 only" : "no"}`).join(", ")}`);
  L.push(
    "Status of the instrument: a structured developmental inventory built on validated constructs and public-domain markers, NOT a validated psychometric assessment (validation stages V0–V3 not yet complete). Frame every finding as a developmental indicator.",
  );
  const sgCount = a.hits.filter((h) => h.code !== "RV").length;
  L.push(
    sgCount
      ? `Safeguarding: ${sgCount} trigger(s) were raised and actioned by a human reviewer. Their content is NOT in this export. Do not infer, mention or allude to it.`
      : "Safeguarding: no triggers raised.",
  );
  L.push("");
  L.push("--- STUDENT DETAILS (given by the parent) ---");
  L.push(`Full name: ${child.name}`);
  L.push(`Date of birth: ${child.dob} (age at export ${ctx.age.toFixed(1)})`);
  L.push(`Current class: ${child.klass}`);
  L.push(`Described by parent as: ${child.gender}`);
  L.push(`City: ${child.city}`);
  L.push(`State: ${child.state}`);
  L.push(`Parent completing the form: ${parent.name} (${parent.relation})`);
  if (parent.otherParent) L.push(`Other parent: ${parent.otherParent}`);
  const tch = a.submitted.teacher?.answers;
  if (tch) {
    const role = a.submitted.teacher!.def.sections[0].items.find((i) => i.k === "T0.role")?.opts?.find((o) => o.v === tch["T0.role"])?.t.en;
    L.push(`Teacher respondent: ${tch["T0.name"] ?? "—"} · ${role ?? "—"} · ${tch["T1.2"] ?? "—"}`);
  }

  L.push("");
  L.push("--- ENGINE RULES FOR THIS INTAKE (binding) ---");
  L.push("1. Read the SIGNAL LEDGER before anything else. It governs what may be said.");
  L.push("2. may_state = no → do not write a definite statement about that construct (no “<name> is …”). Use suggest-level, conditional language only.");
  L.push("3. must_preserve_contradiction = yes → the sources disagree. Present the disagreement as a finding about context; never average it into a middle value.");
  L.push("4. Use only the permitted frames listed for each construct.");
  L.push("5. Apply every derived-signal rule below before interpreting anything nearby (e.g. language mismatch blocks comprehension inferences).");
  L.push("6. Interest texture is engine-internal: never print theme letters or a Holland code, never report interest as talent.");
  L.push("7. Confidence can only be lowered by you, never raised.");

  L.push("");
  L.push("--- VALIDITY ---");
  for (const s of sources) {
    const v = a.validity[s];
    if (!v) continue;
    const parts = [v.flags.length ? v.flags.join(", ") : "no flags"];
    if (v.attention) parts.push(`attention checks failed ${v.attention.failed}/${v.attention.total}`);
    if (v.socialDesirability) parts.push(`implausible-virtue items endorsed ${v.socialDesirability.endorsed}/${v.socialDesirability.total}`);
    if (v.straightlined.length) parts.push(`straightlined sections ${v.straightlined.join(", ")} (invalidated)`);
    if (v.rushed.length) parts.push(`rushed sections ${v.rushed.map((r) => `${r.section} ${r.seconds}s of ${r.floor}s floor`).join(", ")}`);
    if (v.parentVisibility) parts.push(`parent visibility weights ${Object.entries(v.parentVisibility).map(([k, w]) => `${k} ${w}`).join(", ")}`);
    if (v.teacherTenureWeight !== undefined) parts.push(`teacher tenure weight ${v.teacherTenureWeight}${v.teacherLargeClass ? ", class over 45" : ""}`);
    if (s === "student" && a.submitted.student?.answers["S0.alone"]) parts.push(`setting: ${a.submitted.student.answers["S0.alone"]}`);
    L.push(`${s}: ${parts.join(" · ")}${v.humanReview ? " · HUMAN REVIEW REQUIRED" : ""}`);
  }
  const integ = integrityCheck(a);
  if (integ)
    L.push(
      `source integrity (teacher vs parent written text): ${Math.round(integ.overlap * 100)}% phrase overlap — ${integ.level === "duplicate" ? "NOT an independent teacher source; build as two sources and cap confidence." : integ.level === "review" ? "check independence before counting the teacher as a third source." : "independent."}`,
    );

  L.push("");
  L.push("--- SIGNAL LEDGER (values 1–5; per-source value · items · weight) ---");
  for (const e of a.ledger) {
    if (e.convergence === "none" && !e.band_gate) continue;
    const src = (["student", "parent", "teacher"] as Source[])
      .map((s) => (e.sources[s] ? `${s[0].toUpperCase()} ${e.sources[s]!.value} (${e.sources[s]!.n_items} items, w ${e.sources[s]!.weight})` : null))
      .filter(Boolean)
      .join(" · ");
    L.push(
      `${e.label} [${e.construct}] → HDI ${e.maps_to.hdi.join("/")} · PIC ${e.maps_to.pic.join("/")}: ${src || "no source with ≥2 items"} · ${e.convergence}` +
        `${e.combined !== null ? ` · combined ${e.combined}` : ""} · confidence ${e.confidence.toUpperCase()} (${e.confidence_basis})` +
        `${e.contradiction_token ? ` · contradiction ${e.contradiction_token}` : ""}${e.flags.length ? ` · flags ${e.flags.join(", ")}` : ""}${e.band_gate ? ` · gate ${e.band_gate}` : ""}` +
        ` · may_state ${e.engine_permission.may_state ? "yes" : "no"} · must_preserve_contradiction ${e.engine_permission.must_preserve_contradiction ? "yes" : "no"} · frames ${e.engine_permission.permitted_frames.join(", ")}`,
    );
  }

  L.push("");
  L.push("--- DERIVED SIGNALS ---");
  if (!a.derived.length) L.push("(none)");
  for (const d of a.derived) L.push(`${d.id}: ${d.reading}${d.engine_rule ? ` RULE: ${d.engine_rule}` : ""}${d.evidence.length ? ` [${d.evidence.join("; ")}]` : ""}`);

  L.push("");
  L.push("--- INTEREST TEXTURE (engine-internal; never printed) ---");
  L.push(
    a.interest.themes
      ? `status ${a.interest.status}: ${Object.entries(a.interest.themes).map(([k, v]) => `${k} ${v}`).join(", ")}. ${a.interest.rule}`
      : `status ${a.interest.status}. ${a.interest.rule}`,
  );

  for (const s of sources) {
    const sub = a.submitted[s];
    L.push("");
    L.push(`--- ${TITLE[s]} ---`);
    if (!sub) {
      L.push(a.legacy.includes(s) ? "Only a legacy v1 response exists for this source. Reopen and re-collect for the v2 ledger." : "Not returned.");
      continue;
    }
    L.push(`(Submitted ${sub.at.toISOString()} · ${sub.def.version})`);
    const subjects = chosenSubjects(sub.def, sub.answers);
    for (const sec of sub.def.sections) {
      L.push(`[${sec.title.en}]`);
      for (const item of sec.items) {
        if (!isVisible(item, sub.answers) || item.v === "attn" || item.v === "sd" || item.reviewerOnly) continue;
        if (item.k === "T0.declare" || item.k === "S0.assent" || item.k === "aS0.assent" || item.k === "aS0.notparent" || item.k === "aS0.name") continue;
        if (item.kind === "grid") {
          for (const sj of subjects) {
            const g = gridKeys(sj.v);
            L.push(`${displayId(sub.def.band, s, "S1.grid")} ${sj.t.en}: enjoyment ${sub.answers[g.enjoy] ?? "—"}/5 · perceived ease ${sub.answers[g.ease] ?? "—"}/5`);
          }
          continue;
        }
        const raw = held.has(item.k) ? "[held for human review — not for the engine]" : sub.answers[item.k];
        L.push(`${displayId(sub.def.band, s, item.k, item)} ${item.t.en}`);
        L.push(`  → ${typeof raw === "string" && raw.startsWith("[held") ? raw : answerText(item, raw, subjects)}`);
      }
    }
  }

  L.push("");
  L.push("--- LEDGER JSON ---");
  L.push(JSON.stringify(a.ledger.filter((e) => e.convergence !== "none")));
  return L.join("\n");
}

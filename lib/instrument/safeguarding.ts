import { allItems, SKIP } from "./forms";
import { CATEGORY_LABEL, LEXICON_VERSION, scanText, type CustomTerm, type LexiconHit } from "./lexicon";
import type { Answers, FormDef, Source } from "./types";

/**
 * Safeguarding: flag, do not screen. PLINTH is not a mental-health screening instrument, but it can no longer
 * claim not to have seen what a child tells it. Every trigger goes to a named person; none is written into
 * the report, and no free text that matches the lexicon is ever interpreted automatically.
 *
 *  SG-1  Student says they rarely or never feel okay in a normal week        → named contact within 48 hours
 *  SG-2  Student has no adult at school they could go to                     → pastoral lead (institutional finding)
 *  SG-3  Sleep under 5 hours, or a marked change in mood or energy reported   → human reviewer judgement before report
 *  SG-4U Written words suggesting possible current harm (self-harm, abuse,   → same-day action; held from the engine
 *        neglect, exploitation, forced marriage)
 *  SG-4  Written words suggesting distress, bullying, fear of home, substances → within 48 hours; held from the engine
 *  RV    A reviewer-only note was left (parent or teacher)                   → reviewer reads before report
 */
export type SgCode = "SG-1" | "SG-2" | "SG-3" | "SG-4U" | "SG-4" | "RV";
export type SgHit = { code: SgCode; source: Source; item: string; detail?: LexiconHit[] };

export const SG_MEANING: Record<SgCode, string> = {
  "SG-1": "The child said they rarely or never feel okay in a normal week. Contact the named wellbeing person within 48 hours.",
  "SG-2": "The child said there is no adult at school they could go to if something was wrong. Refer to the school’s pastoral lead as an institutional finding.",
  "SG-3": "Very short sleep, or a marked change in mood or energy, was reported. Reviewer judgement is needed before any report is generated.",
  "SG-4U": "A written answer contains words that may mean the child is being harmed or is thinking about harming themselves. Act today. The answer is held from the engine.",
  "SG-4": "A written answer contains words suggesting distress, bullying, fear of going home or substance use. Read it within 48 hours. It is held from the engine.",
  RV: "A parent or teacher left a note for the reviewer only. Read it before generating a report.",
};

/** Kept for callers that only need a yes/no. */
export function lexiconMatch(text: string, custom: CustomTerm[] = []): boolean {
  return scanText(text, custom).length > 0;
}

export { CATEGORY_LABEL, LEXICON_VERSION };

export function safeguardingHits(def: FormDef, a: Answers, custom: CustomTerm[] = []): SgHit[] {
  const src = def.source;
  const hits: SgHit[] = [];
  const add = (code: SgCode, item: string, detail?: LexiconHit[]) => hits.push({ code, source: src, item, ...(detail ? { detail } : {}) });

  if (src === "student") {
    if (a["S9.8"] === "1" || a["S9.8"] === "2") add("SG-1", "S9.8");
    if (a["S9.7"] === "1") add("SG-2", "S9.7");
    if (a["aS2.3"] === "1") add("SG-2", "aS2.3");
    if (a["S9.1"] === "4") add("SG-3", "S9.1");
  }
  if (src === "parent") {
    if (a["P7.1"] === "4") add("SG-3", "P7.1");
    if (a["P7.6"] === "marked") add("SG-3", "P7.6");
    if (a["P7.5"] === "marked") add("SG-3", "P7.5");
  }
  for (const i of allItems(def)) {
    const v = a[i.k];
    if (typeof v !== "string" || v === SKIP || !v.trim()) continue;
    if (i.kind !== "open" && i.kind !== "text") continue;
    if (i.reviewerOnly) add("RV", i.k);
    const found = scanText(v, custom);
    if (found.length) add(found.some((h) => h.severity === "urgent") ? "SG-4U" : "SG-4", i.k, found);
  }
  return hits;
}

/** Open-text items that must never reach the engine: reviewer-only notes and SG-4 matches. */
export function heldItems(hits: SgHit[]): Set<string> {
  return new Set(hits.filter((h) => h.code === "SG-4" || h.code === "SG-4U" || h.code === "RV").map((h) => h.item));
}

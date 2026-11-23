import { allItems, SKIP } from "./forms";
import type { Answers, FormDef, Source } from "./types";

/**
 * Safeguarding: flag, do not screen. PLINTH is not a mental-health screening instrument, but it can no longer
 * claim not to have seen what a child tells it. Every trigger goes to a named person; none is written into
 * the report, and no free text that matches the lexicon is ever interpreted automatically.
 *
 *  SG-1  Student says they rarely or never feel okay in a normal week        → named contact within 48 hours
 *  SG-2  Student has no adult at school they could go to                     → pastoral lead (institutional finding)
 *  SG-3  Sleep under 5 hours, or a marked change in mood or energy reported   → human reviewer judgement before report
 *  SG-4  Open text matching the safeguarding lexicon (any respondent)        → held from the engine; reviewer only
 *  RV    A reviewer-only note was left (parent or teacher)                   → reviewer reads before report
 */
export type SgCode = "SG-1" | "SG-2" | "SG-3" | "SG-4" | "RV";
export type SgHit = { code: SgCode; source: Source; item: string };

export const SG_MEANING: Record<SgCode, string> = {
  "SG-1": "The child said they rarely or never feel okay in a normal week. Contact the named wellbeing person within 48 hours.",
  "SG-2": "The child said there is no adult at school they could go to if something was wrong. Refer to the school’s pastoral lead as an institutional finding.",
  "SG-3": "Very short sleep, or a marked change in mood or energy, was reported. Reviewer judgement is needed before any report is generated.",
  "SG-4": "A written answer contains words that may indicate risk. It is held from the engine; a person must read it.",
  RV: "A parent or teacher left a note for the reviewer only. Read it before generating a report.",
};

/**
 * Starter lexicon (English, Hindi, Hinglish). Over-matching is intended: a false positive costs a reviewer a
 * minute, a miss can cost far more. Review and extend with a safeguarding professional before launch.
 */
const LEXICON: RegExp[] = [
  /\bsuicid/i, /\bkill(ing)? (my ?self|me)\b/i, /\bend (my|it all|my life)\b/i, /\bwant(ed)? to die\b/i, /\bwish i (was|were) dead\b/i,
  /\bbetter off (dead|without me)\b/i, /\bno reason to live\b/i, /\b(hurt|hurting|harm|harming|cut|cutting) (my ?self|myself)\b/i,
  /\bself[- ]?harm/i, /\bdon'?t want to (live|be alive)\b/i, /\bnobody (cares|would care)\b/i, /\bno one (cares|would care)\b/i,
  /\b(hits|beats|slaps|kicks) me\b/i, /\b(hit|beat|slapped|kicked) me\b/i, /\babus(e|ed|ing|ive)\b/i, /\bmolest/i,
  /\btouch(es|ed)? me\b/i, /\b(scared|afraid|frightened) (to go|of going) home\b/i, /\brun away from home\b/i, /\bhate my life\b/i,
  /\bbull(y|ied|ying) me\b/i, /\bthreaten/i,
  /आत्महत्या/, /खुदकुशी/, /मर जाना/, /मरना चाहत/, /जीना नहीं चाहत/, /जान दे/, /खुद को (चोट|नुकसान)/, /मुझे मारत/, /मारते हैं/, /पीटत/, /पिटाई/,
  /गलत (तरीके|ढंग) से छू/, /छूता है/, /छूते हैं/, /घर जाने से डर/, /घर से भाग/, /कोई परवाह नहीं/, /धमकी/, /परेशान करत/,
  /\bmar(na)? (jana|jaun|chahta|chahti)\b/i, /\bkhudkushi\b/i, /\bmaarte? hai\b/i, /\bpitai\b/i,
];

export function lexiconMatch(text: string): boolean {
  return LEXICON.some((re) => re.test(text));
}

export function safeguardingHits(def: FormDef, a: Answers): SgHit[] {
  const src = def.source;
  const hits: SgHit[] = [];
  const add = (code: SgCode, item: string) => hits.push({ code, source: src, item });

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
    if (i.kind === "open" && lexiconMatch(v)) add("SG-4", i.k);
  }
  return hits;
}

/** Open-text items that must never reach the engine: reviewer-only notes and SG-4 matches. */
export function heldItems(hits: SgHit[]): Set<string> {
  return new Set(hits.filter((h) => h.code === "SG-4" || h.code === "RV").map((h) => h.item));
}

/**
 * PLINTH HDI instrument — shared types.
 *
 * Built on "HDI Instrument Architecture v2.0" (pre-pilot specification, September 2026), with the item wording
 * that specification left unwritten (parent and teacher anchors, Band B rewordings, Band A additions) authored
 * for the portal. Every item carries a permanent key. Keys never change meaning; a retired item keeps its key
 * and is marked deprecated, and a new item takes a new key. That is what lets the longitudinal record compare
 * a child at 11 with the same child at 15.
 */

export type Lang = "en" | "hi";
export type T = { en: string; hi: string };
export type Band = "A" | "B" | "C";
export type Source = "student" | "parent" | "teacher";

/** Answer value as stored: a single option value, several values (multi-select), or free text. */
export type Answer = string | string[];
export type Answers = Record<string, Answer>;

export type Opt = {
  v: string;
  t: T;
  /** Normalised 1–5 value when the option carries an ordinal meaning for a construct. */
  s?: number;
  /** Selecting this option clears the others (e.g. "Nobody" in a multi-select). */
  exclusive?: boolean;
};

/**
 * Item kinds (formats from the specification):
 *  freq   Format A — 5-point frequency scale (Never … Almost always), 1–5.
 *  obs    Format A for adults — frequency scale plus "Not observed" (no value).
 *  a3     Band A — 3-point scale (Not like me · A bit like me · A lot like me), read aloud.
 *  rate   1–5 rating with named anchors (enjoyment, ease, interest, confidence).
 *  choice Format B / D / G — one option; options may carry ordinal values.
 *  multi  several options.
 *  pair   Format E — forced choice between two equally desirable statements (tie-breaker only).
 *  open   Format F — scaffolded open response with a character floor.
 *  text   short text (identity fields; never analysed).
 *  check  a declaration or assent box that must be ticked.
 *  grid   Format C — the dual-axis subject grid (enjoyment × ease), one row per studied subject.
 *  subject single subject chosen from the subjects the student studies.
 */
export type Kind = "freq" | "obs" | "a3" | "rate" | "choice" | "multi" | "pair" | "open" | "text" | "check" | "grid" | "subject";

export type Item = {
  /** Permanent key, e.g. "S2.1", "P3.4", "T4.1", "aS2.3" (Band A student bank). */
  k: string;
  kind: Kind;
  t: T;
  /** Band B wording, where Band B rewords the Band C stem. */
  tB?: T;
  help?: T;
  /** Worked example shown under an open response. */
  ex?: T;
  opts?: Opt[];
  /** Anchor set for "rate" items. */
  anchors?: "enjoy" | "ease" | "interest" | "confidence";
  /** Reverse-coded: the stored value is inverted (6 − v) before scoring. */
  rev?: boolean;
  /** Required. Defaults to true for every kind except open responses marked optional. */
  optional?: boolean;
  /** Student open responses may be skipped explicitly (recorded as skipped, never as blank). */
  skippable?: boolean;
  /** Character floor for open responses (Band C value; Band B uses floorB when set). */
  floor?: number;
  floorB?: number;
  /** Shown only when another item has one of these values. */
  show?: { k: string; in: string[] };
  /** Validity role: attention check (expects `expect`), social-desirability marker, or confidence footer. */
  v?: "attn" | "sd" | "obsconf";
  expect?: string;
  /** Not used by the ledger beyond reviewer reading (identity, admin observation). */
  meta?: boolean;
  /** Routed to the human reviewer only; never into the engine or the export body. */
  reviewerOnly?: boolean;
  /** Stored with a permanent provisional flag (Band B identity items). */
  provisionalB?: boolean;
  /** RIASEC theme (engine-internal; never shown to the respondent). */
  riasec?: "R" | "I" | "A" | "S" | "E" | "C";
  /** Seconds used by the section-timing model: grid micro-item 4 s, discrete 7 s, open 60 s. */
  sec?: number;
};

export type Section = {
  id: string;
  title: T;
  lead?: T;
  items: Item[];
  /** Once the respondent moves past this section they cannot return to it (aspiration calibration). */
  lockOnLeave?: boolean;
};

export type FormDef = {
  source: Source;
  band: Band;
  version: string;
  sections: Section[];
  /** Subjects offered in the subject grid (student forms, Bands B and C). */
  subjects?: { v: string; t: T }[];
  /** Exact age in years at form build, used for the RIASEC gate. */
  age?: number;
};

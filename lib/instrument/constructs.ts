/**
 * Construct layer. The item bank is written against discrete behavioural constructs; each construct maps to
 * the seven HDI report dimensions and the five PIC inference dimensions. One item may feed more than one
 * construct. A source contributes to a construct only when at least two of its items answer it
 * (the specification’s “fewer than two contributing items return null” rule).
 *
 * HDI-7: 1 Cognitive · 2 Emotional · 3 Social · 4 Character · 5 Leadership · 6 Purpose · 7 Wellbeing
 * PIC-5: A Cognitive · B Learning Architecture · C Motivational · D Emotional & Social · E Environmental
 */

export type Construct = {
  id: string;
  label: string;
  cluster: string;
  hdi: number[];
  pic: string[];
  student?: string[];
  /** Band A student items (3-point, read aloud), where Band A self-report is credible for this construct. */
  studentA?: string[];
  parent?: string[];
  teacher?: string[];
  /** Regulation, character, leadership, purpose: Band A accepts adult sources only. */
  adultOnlyInA?: boolean;
  /** Character and leadership constructs are capped Low under an impression-management flag. */
  characterLeadership?: boolean;
  /** Construct-specific values for described-behaviour options that carry no general ordinal value. */
  optionScores?: Record<string, Record<string, number>>;
  /** Frames the engine may use to talk about this construct. */
  frames: string[];
};

export const CONSTRUCTS: Construct[] = [
  /* Cognitive & metacognitive */
  {
    id: "curiosity", label: "Intellectual curiosity", cluster: "Cognitive & metacognitive", hdi: [1], pic: ["A"],
    student: ["S3.4", "S3.5", "S3.6"], studentA: ["aS4.1", "aS4.2", "aS4.4"], parent: ["P2.5", "P2.6"], teacher: ["T2.1", "T2.4"],
    frames: ["strength", "emerging_interest"],
  },
  {
    id: "reasoning_transfer", label: "Reasoning and transfer", cluster: "Cognitive & metacognitive", hdi: [1], pic: ["A"],
    student: ["S2.10", "S3.9", "S2.1"], teacher: ["T2.2", "T2.3", "T2.5"],
    frames: ["strength", "scaffoldable"],
  },
  /* Learning architecture */
  {
    id: "focus_initiation", label: "Focus and getting started", cluster: "Learning architecture", hdi: [1], pic: ["B"],
    student: ["S2.4", "S2.9"], parent: ["P2.4", "P2.2"], teacher: ["T3.1", "T3.3", "T9.6", "T9.7"],
    frames: ["support_condition", "environmental_fit"],
  },
  {
    id: "learning_independence", label: "Learning independence", cluster: "Learning architecture", hdi: [1, 4], pic: ["B"],
    student: ["S2.2", "S2.1"], parent: ["P2.3", "P2.1"], teacher: ["T3.3", "T4.1"],
    frames: ["scaffoldable", "support_condition"],
  },
  {
    id: "metacognition", label: "Planning and error review", cluster: "Learning architecture", hdi: [1], pic: ["B"],
    student: ["S2.7", "S2.8"], teacher: ["T4.3", "T3.4"],
    frames: ["scaffoldable", "strength"],
  },
  {
    id: "persistence", label: "Persistence with difficulty", cluster: "Learning architecture", hdi: [1, 4], pic: ["C"],
    student: ["S3.7", "S3.8", "S4.6"], parent: ["P2.2", "P4.2"], teacher: ["T4.4", "T3.2"], adultOnlyInA: true,
    frames: ["strength", "scaffoldable", "context_variability"],
  },
  /* Motivation & effort (self-determination structure) */
  {
    id: "autonomous_motivation", label: "Self-directed motivation", cluster: "Motivation & effort", hdi: [1, 6], pic: ["C"],
    student: ["S4.1", "S4.2", "S4.3", "S2.3"], parent: ["P2.5", "P2.7"],
    frames: ["strength", "environmental_fit"],
  },
  {
    id: "competence_belief", label: "Sense of competence", cluster: "Motivation & effort", hdi: [1], pic: ["C"],
    student: ["S4.4", "S4.5", "S4.6"],
    frames: ["strength", "support_condition"],
  },
  {
    id: "relatedness_drive", label: "Relational motivation", cluster: "Motivation & effort", hdi: [1, 3], pic: ["C"],
    student: ["S4.7", "S4.8"],
    frames: ["support_condition"],
  },
  {
    id: "mastery_orientation", label: "Learning-goal orientation", cluster: "Motivation & effort", hdi: [1], pic: ["C"],
    student: ["S4.9", "S4.10"],
    frames: ["strength", "scaffoldable"],
  },
  {
    id: "growth_belief", label: "Belief that ability grows", cluster: "Motivation & effort", hdi: [1], pic: ["C"],
    student: ["S4.11", "S4.12"],
    frames: ["strength", "scaffoldable"],
  },
  /* Emotional regulation & recovery */
  {
    id: "emotional_awareness", label: "Emotional awareness and expression", cluster: "Emotional regulation & recovery", hdi: [2], pic: ["D"],
    student: ["S5.3", "S5.1"], parent: ["P3.4", "P3.1"], adultOnlyInA: true,
    optionScores: { "S5.1": { a: 5, b: 4, c: 4, d: 1 } },
    frames: ["emotional_safety_variability", "support_condition"],
  },
  {
    id: "regulation_composure", label: "Composure under pressure", cluster: "Emotional regulation & recovery", hdi: [2], pic: ["D"],
    student: ["S5.4", "S5.10"], parent: ["P3.1", "P8.5", "P10.1"], teacher: ["T3.5", "T4.2"], adultOnlyInA: true,
    frames: ["context_variability", "support_condition", "emotional_safety_variability"],
  },
  {
    id: "recovery_resilience", label: "Recovery after setbacks", cluster: "Emotional regulation & recovery", hdi: [2], pic: ["D"],
    student: ["S5.6", "S5.9"], parent: ["P3.2", "P3.3", "P3.6"], teacher: ["T4.4", "T4.2"], adultOnlyInA: true,
    frames: ["strength", "context_variability", "support_condition"],
  },
  {
    id: "evaluative_ease", label: "Ease under evaluation (low worry and self-criticism)", cluster: "Emotional regulation & recovery", hdi: [2, 7], pic: ["D"],
    student: ["S5.5", "S5.8", "S9.6"], adultOnlyInA: true,
    frames: ["emotional_safety_variability", "support_condition"],
  },
  {
    id: "adaptability", label: "Adaptability to change", cluster: "Emotional regulation & recovery", hdi: [2], pic: ["D"],
    student: ["S2.10", "S5.4"], parent: ["P8.1", "P8.2", "P8.3", "P8.4", "P10.4"], teacher: ["T3.5", "T9.5"],
    frames: ["context_variability", "environmental_fit"],
  },
  /* Social & help-seeking */
  {
    id: "peer_connection", label: "Peer connection", cluster: "Social & help-seeking", hdi: [3], pic: ["D"],
    student: ["S6.7", "S6.4"], studentA: ["aS2.2", "aS1.7"], parent: ["P5.2", "P10.5"], teacher: ["T5.1", "T5.2", "T9.2"],
    optionScores: { "P10.5": { joins: 5, watches: 4, adult: 2, avoids: 1 } },
    frames: ["context_variability", "support_condition"],
  },
  {
    id: "voice_assertion", label: "Voice in a group", cluster: "Social & help-seeking", hdi: [3, 5], pic: ["D"],
    student: ["S6.2", "S6.8"], studentA: ["aS2.4"], teacher: ["T5.3", "T6.1", "T6.3"],
    frames: ["context_variability", "emerging_interest"],
  },
  {
    id: "social_awareness_care", label: "Noticing and caring for others", cluster: "Social & help-seeking", hdi: [3, 4], pic: ["D"],
    student: ["S6.3", "S7.9", "S7.10"], parent: ["P5.4"], teacher: ["T5.2", "T6.3"],
    frames: ["strength"],
  },
  {
    id: "help_seeking_adaptive", label: "Adaptive help-seeking", cluster: "Social & help-seeking", hdi: [3], pic: ["D"],
    student: ["S2.1", "S6.5", "S6.6"], parent: ["P2.1", "P2.3"], teacher: ["T4.1", "T6.3"],
    frames: ["context_variability", "emotional_safety_variability", "scaffoldable"],
  },
  {
    id: "school_belonging", label: "Belonging and felt safety at school", cluster: "Social & help-seeking", hdi: [3, 7], pic: ["D", "E"],
    student: ["S6.7", "S9.7"], studentA: ["aS2.1", "aS2.2", "aS2.3", "aS2.6"],
    frames: ["environmental_fit", "emotional_safety_variability"],
  },
  /* Character & leadership */
  {
    id: "reliability", label: "Reliability and follow-through", cluster: "Character & leadership", hdi: [4], pic: ["C"],
    student: ["S7.1", "S7.2", "S7.3"], parent: ["P4.1", "P4.2", "P4.5"], teacher: ["T3.2", "T3.4"],
    adultOnlyInA: true, characterLeadership: true,
    frames: ["strength", "support_condition"],
  },
  {
    id: "integrity_responsibility", label: "Honesty and owning mistakes", cluster: "Character & leadership", hdi: [4], pic: ["D"],
    student: ["S7.4", "S7.5"], parent: ["P4.3", "P4.4"], teacher: ["T6.2", "T4.2"],
    adultOnlyInA: true, characterLeadership: true,
    frames: ["strength", "emotional_safety_variability"],
  },
  {
    id: "initiative_leadership", label: "Initiative and leadership", cluster: "Character & leadership", hdi: [5], pic: ["C", "D"],
    student: ["S7.6", "S7.7", "S7.8"], teacher: ["T6.1", "T6.2", "T5.1"],
    adultOnlyInA: true, characterLeadership: true,
    frames: ["emerging_interest", "context_variability"],
  },
  {
    id: "prosocial_contribution", label: "Contribution to others", cluster: "Character & leadership", hdi: [4, 5], pic: ["D"],
    student: ["S7.9", "S7.10", "S6.8"], parent: ["P5.4"], teacher: ["T6.3", "T5.2"],
    adultOnlyInA: true, characterLeadership: true,
    frames: ["strength"],
  },
  /* Purpose & direction */
  {
    id: "direction_meaning", label: "Direction and meaning", cluster: "Purpose & direction", hdi: [6], pic: ["C"],
    student: ["S8.1", "S8.3", "S8.4", "S8.5"], adultOnlyInA: true,
    frames: ["emerging_interest", "non_determinism"],
  },
  /* Wellbeing */
  {
    id: "rest_energy", label: "Rest and energy", cluster: "Wellbeing", hdi: [7], pic: ["D", "E"],
    student: ["S9.1", "S9.2"], studentA: ["aS5.1"], parent: ["P7.1", "P7.5"],
    optionScores: { "P7.5": { none: 5, little: 4, clear: 2, marked: 1 } },
    frames: ["environmental_fit", "support_condition"],
  },
  /* Environment & ecology */
  {
    id: "study_conditions", label: "Study conditions at home", cluster: "Environment & ecology", hdi: [7], pic: ["E"],
    student: ["S10.1", "S10.2"], studentA: ["aS5.4", "aS5.5"], parent: ["P6.2", "P6.1"],
    frames: ["environmental_fit"],
  },
  {
    id: "home_fit", label: "Expectations and time at home", cluster: "Environment & ecology", hdi: [7], pic: ["E"],
    student: ["S10.6", "S10.7"], parent: ["P6.5", "P6.1"],
    frames: ["environmental_fit", "emotional_safety_variability"],
  },
];

export const SOURCE_WEIGHTS: Record<"A" | "B" | "C", { student: number; parent: number; teacher: number }> = {
  A: { student: 0.15, parent: 0.4, teacher: 0.45 },
  B: { student: 0.4, parent: 0.3, teacher: 0.3 },
  C: { student: 0.5, parent: 0.22, teacher: 0.28 },
};

/** Teacher items that depend on individual attention (down-weighted in classes over 45). */
export const INDIVIDUAL_ATTENTION_ITEMS = new Set(["T3.1", "T3.3", "T4.1", "T9.6", "T9.7"]);

/** Parent block → the visibility rating that weights it. */
export function parentVisibilityKey(itemKey: string): "P1.4" | "P3.c" | "P5.c" {
  const block = Number(itemKey.slice(1).split(".")[0]);
  if (block === 2 || block === 3) return "P3.c";
  if (block === 4 || block === 5) return "P5.c";
  return "P1.4";
}

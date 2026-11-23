import type { Opt, T } from "./types";

/** Format A — frequency anchors (they measurably reduce acquiescence compared with agree/disagree). */
export const FREQ: Opt[] = [
  { v: "1", s: 1, t: { en: "Never", hi: "कभी नहीं" } },
  { v: "2", s: 2, t: { en: "Rarely", hi: "बहुत कम" } },
  { v: "3", s: 3, t: { en: "Sometimes", hi: "कभी-कभी" } },
  { v: "4", s: 4, t: { en: "Often", hi: "अक्सर" } },
  { v: "5", s: 5, t: { en: "Almost always", hi: "लगभग हमेशा" } },
];

/** Adult observation — frequency plus an honest "not observed", which carries no value. */
export const OBS: Opt[] = [...FREQ, { v: "na", t: { en: "Not observed", hi: "देखा नहीं" } }];

/** Band A — three size-graded markers, read aloud. */
export const A3: Opt[] = [
  { v: "1", s: 1, t: { en: "Not like me", hi: "मेरे जैसा नहीं" } },
  { v: "2", s: 3, t: { en: "A bit like me", hi: "थोड़ा मेरे जैसा" } },
  { v: "3", s: 5, t: { en: "A lot like me", hi: "बिल्कुल मेरे जैसा" } },
];

export const A3_LIKE: Opt[] = [
  { v: "1", s: 1, t: { en: "Not much", hi: "ज़्यादा नहीं" } },
  { v: "2", s: 3, t: { en: "A bit", hi: "थोड़ा" } },
  { v: "3", s: 5, t: { en: "A lot", hi: "बहुत" } },
];

export const ANCHORS: Record<"enjoy" | "ease" | "interest" | "confidence", { lo: T; hi: T }> = {
  enjoy: { lo: { en: "Not at all", hi: "बिल्कुल नहीं" }, hi: { en: "A great deal", hi: "बहुत ज़्यादा" } },
  ease: { lo: { en: "Very hard", hi: "बहुत कठिन" }, hi: { en: "Very easy", hi: "बहुत आसान" } },
  interest: { lo: { en: "Would dislike it", hi: "बिल्कुल पसंद नहीं" }, hi: { en: "Would enjoy it", hi: "बहुत पसंद आएगा" } },
  confidence: { lo: { en: "Not very", hi: "ज़्यादा नहीं" }, hi: { en: "Very", hi: "पूरी तरह" } },
};

export const RATE: Opt[] = ["1", "2", "3", "4", "5"].map((v) => ({ v, s: Number(v), t: { en: v, hi: v } }));

export const NA_SEEN: Opt = { v: "na", t: { en: "I haven’t had a chance to see this", hi: "मुझे यह देखने का अवसर नहीं मिला" } };

/** Sleep on a normal school night. Values are hours; scored for rest (7–9 h ideal for school-age children). */
export const SLEEP: Opt[] = [
  { v: "4", s: 1, t: { en: "Under 5 hours", hi: "5 घंटे से कम" } },
  { v: "5", s: 1, t: { en: "About 5", hi: "लगभग 5" } },
  { v: "6", s: 2, t: { en: "About 6", hi: "लगभग 6" } },
  { v: "7", s: 3, t: { en: "About 7", hi: "लगभग 7" } },
  { v: "8", s: 4, t: { en: "About 8", hi: "लगभग 8" } },
  { v: "9", s: 5, t: { en: "About 9", hi: "लगभग 9" } },
  { v: "10", s: 5, t: { en: "10 or more", hi: "10 या अधिक" } },
];

export const DAYS: Opt[] = ["0", "1", "2", "3", "4", "5", "6", "7"].map((v) => ({ v, t: { en: v, hi: v } }));

export const SCREEN_HOURS: Opt[] = [
  { v: "lt1", t: { en: "Under 1 hour", hi: "1 घंटे से कम" } },
  { v: "1-2", t: { en: "1–2 hours", hi: "1–2 घंटे" } },
  { v: "2-4", t: { en: "2–4 hours", hi: "2–4 घंटे" } },
  { v: "4-6", t: { en: "4–6 hours", hi: "4–6 घंटे" } },
  { v: "6+", t: { en: "6 hours or more", hi: "6 घंटे या अधिक" } },
];

export const TUITION: Opt[] = [
  { v: "0", t: { en: "None", hi: "बिल्कुल नहीं" } },
  { v: "1-3", t: { en: "1–3 hours", hi: "1–3 घंटे" } },
  { v: "4-7", t: { en: "4–7 hours", hi: "4–7 घंटे" } },
  { v: "8-12", t: { en: "8–12 hours", hi: "8–12 घंटे" } },
  { v: "12+", t: { en: "More than 12 hours", hi: "12 घंटे से अधिक" } },
];

export const HOME_LANGUAGES: Opt[] = [
  { v: "hindi", t: { en: "Hindi", hi: "हिंदी" } },
  { v: "english", t: { en: "English", hi: "अंग्रेज़ी" } },
  { v: "chhattisgarhi", t: { en: "Chhattisgarhi", hi: "छत्तीसगढ़ी" } },
  { v: "halbi", t: { en: "Halbi", hi: "हल्बी" } },
  { v: "gondi", t: { en: "Gondi", hi: "गोंडी" } },
  { v: "bengali", t: { en: "Bengali", hi: "बांग्ला" } },
  { v: "odia", t: { en: "Odia", hi: "ओड़िया" } },
  { v: "marathi", t: { en: "Marathi", hi: "मराठी" } },
  { v: "telugu", t: { en: "Telugu", hi: "तेलुगु" } },
  { v: "other", t: { en: "Another language", hi: "कोई अन्य भाषा" } },
];

export const INSTRUCTION_LANGUAGES: Opt[] = [
  { v: "english", t: { en: "English", hi: "अंग्रेज़ी" } },
  { v: "hindi", t: { en: "Hindi", hi: "हिंदी" } },
  { v: "mixed", t: { en: "A mix of English and Hindi", hi: "अंग्रेज़ी और हिंदी दोनों" } },
  { v: "other", t: { en: "Another language", hi: "कोई अन्य भाषा" } },
];

/** Subjects for Classes VI–X (Band B and younger Band C). */
export const SUBJECTS_SECONDARY = [
  { v: "math", t: { en: "Mathematics", hi: "गणित" } },
  { v: "science", t: { en: "Science", hi: "विज्ञान" } },
  { v: "english", t: { en: "English", hi: "अंग्रेज़ी" } },
  { v: "lang2", t: { en: "Hindi / second language", hi: "हिंदी / दूसरी भाषा" } },
  { v: "social", t: { en: "Social Science", hi: "सामाजिक विज्ञान" } },
  { v: "computer", t: { en: "Computer Science / IT", hi: "कंप्यूटर / आईटी" } },
  { v: "art", t: { en: "Art", hi: "कला" } },
  { v: "music", t: { en: "Music", hi: "संगीत" } },
  { v: "pe", t: { en: "Physical Education", hi: "शारीरिक शिक्षा" } },
];

/** Subjects for Classes XI–XII, where streams differ; the student first marks which they study. */
export const SUBJECTS_SENIOR = [
  { v: "english", t: { en: "English", hi: "अंग्रेज़ी" } },
  { v: "lang2", t: { en: "Hindi / second language", hi: "हिंदी / दूसरी भाषा" } },
  { v: "math", t: { en: "Mathematics", hi: "गणित" } },
  { v: "physics", t: { en: "Physics", hi: "भौतिकी" } },
  { v: "chemistry", t: { en: "Chemistry", hi: "रसायन विज्ञान" } },
  { v: "biology", t: { en: "Biology", hi: "जीव विज्ञान" } },
  { v: "accountancy", t: { en: "Accountancy", hi: "लेखाशास्त्र" } },
  { v: "business", t: { en: "Business Studies", hi: "व्यवसाय अध्ययन" } },
  { v: "economics", t: { en: "Economics", hi: "अर्थशास्त्र" } },
  { v: "history", t: { en: "History", hi: "इतिहास" } },
  { v: "polsci", t: { en: "Political Science", hi: "राजनीति विज्ञान" } },
  { v: "geography", t: { en: "Geography", hi: "भूगोल" } },
  { v: "psychology", t: { en: "Psychology", hi: "मनोविज्ञान" } },
  { v: "computer", t: { en: "Computer Science / IP", hi: "कंप्यूटर विज्ञान / आईपी" } },
  { v: "pe", t: { en: "Physical Education", hi: "शारीरिक शिक्षा" } },
  { v: "art", t: { en: "Fine Arts / Painting", hi: "ललित कला / चित्रकला" } },
];

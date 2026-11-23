import { tx } from "./build";
import { parentSections } from "./parent";
import { A3, FREQ, OBS, RATE, SUBJECTS_SECONDARY, SUBJECTS_SENIOR } from "./scales";
import { BAND_A_STUDENT, studentSectionsBC } from "./student";
import { teacherSections } from "./teacher";
import type { Band, FormDef, Item, Section, Source } from "./types";

export const INSTRUMENT_VERSION = "hdi-v2.0-portal-2026-11-23";

/* ------------------------------------------------------------------ age and band */

/** Exact age in years on a given date (default: now). */
export function exactAge(dob: string, on: Date = new Date()): number {
  const d = new Date(dob + "T00:00:00Z");
  return (on.getTime() - d.getTime()) / (365.2425 * 24 * 3600 * 1000);
}

/** Band by chronological age — never by class. Null outside 6–18. */
export function bandForAge(age: number): Band | null {
  if (age < 6 || age >= 19) return null;
  if (age < 11) return "A";
  if (age < 15) return "B";
  return "C";
}

const CLASS_NUM: Record<string, number> = {
  "Class I": 1, "Class II": 2, "Class III": 3, "Class IV": 4, "Class V": 5, "Class VI": 6,
  "Class VII": 7, "Class VIII": 8, "Class IX": 9, "Class X": 10, "Class XI": 11, "Class XII": 12,
};
export const CLASS_OPTIONS = Object.keys(CLASS_NUM);

/**
 * Age–class divergence. A child in Class N is typically N + 5 to N + 6 years old (modal age N + 5.5).
 * More than ±18 months from that is passed to the engine as an environmental signal, not a data error.
 */
export function ageClassDivergence(age: number, klass: string): number | null {
  const n = CLASS_NUM[klass];
  if (!n) return null;
  return age - (n + 5.5);
}

export function subjectsFor(klass: string) {
  const n = CLASS_NUM[klass] ?? 0;
  return n >= 11 ? SUBJECTS_SENIOR : SUBJECTS_SECONDARY;
}

/* ------------------------------------------------------------------ gates */

const STUDENT_GATE: Section = {
  id: "s0",
  title: tx("Before you start", "शुरू करने से पहले"),
  items: [
    {
      k: "S0.alone",
      kind: "choice",
      meta: true,
      t: tx("Right now, is anyone with you?", "इस समय क्या कोई तुम्हारे साथ है?"),
      opts: [
        { v: "alone", t: tx("I’m on my own", "मैं अकेला/अकेली हूँ") },
        { v: "nearby", t: tx("Someone is nearby but can’t see my screen", "कोई पास में है, पर मेरी स्क्रीन नहीं देख सकता") },
        { v: "watching", t: tx("Someone can see my screen", "कोई मेरी स्क्रीन देख सकता है") },
      ],
    },
    {
      k: "S0.assent",
      kind: "check",
      meta: true,
      t: tx("I understand, and I’m happy to answer.", "मैं समझ गया/गई, और मैं उत्तर देने के लिए तैयार हूँ।"),
    },
  ],
};

const BAND_A_GATE: Section = {
  id: "a0",
  title: tx("For the adult reading the questions", "प्रश्न पढ़ने वाले वयस्क के लिए"),
  items: [
    { k: "aS0.name", kind: "text", meta: true, t: tx("Your name", "आपका नाम") },
    {
      k: "aS0.role",
      kind: "choice",
      meta: true,
      t: tx("Your role", "आपकी भूमिका"),
      opts: [
        { v: "plinth", t: tx("PLINTH reviewer", "PLINTH समीक्षक") },
        { v: "counsellor", t: tx("School counsellor", "स्कूल परामर्शदाता") },
        { v: "teacher", t: tx("Teacher (not this form’s teacher respondent)", "शिक्षक (इस फ़ॉर्म के शिक्षक-उत्तरदाता नहीं)") },
        { v: "other", t: tx("Another trained adult", "कोई अन्य प्रशिक्षित वयस्क") },
      ],
    },
    {
      k: "aS0.mode",
      kind: "choice",
      meta: true,
      t: tx("How is the session happening?", "सत्र कैसे हो रहा है?"),
      opts: [
        { v: "person", t: tx("In person", "आमने-सामने") },
        { v: "video", t: tx("Video call", "वीडियो कॉल") },
      ],
    },
    {
      k: "aS0.notparent",
      kind: "check",
      meta: true,
      t: tx(
        "I am not this child’s parent or guardian, and no parent is in the room while the child answers.",
        "मैं इस बच्चे का माता-पिता या अभिभावक नहीं हूँ, और बच्चे के उत्तर देते समय कोई अभिभावक कमरे में नहीं है।",
      ),
    },
    {
      k: "aS0.assent",
      kind: "check",
      meta: true,
      t: tx(
        "I explained to the child in simple words that this is not a test, that they can stop at any time, and they agreed to answer.",
        "मैंने बच्चे को सरल शब्दों में बताया कि यह परीक्षा नहीं है, वह कभी भी रुक सकता/सकती है, और वह उत्तर देने के लिए तैयार है।",
      ),
    },
  ],
};

/* ------------------------------------------------------------------ build */

export type BuildContext = { band: Band; age: number; klass: string };

export function buildForm(source: Source, ctx: BuildContext): FormDef {
  if (source === "parent") return finish({ source, band: ctx.band, version: INSTRUMENT_VERSION, sections: parentSections(ctx.band) });
  if (source === "teacher") return finish({ source, band: ctx.band, version: INSTRUMENT_VERSION, sections: teacherSections(ctx.band) });
  if (ctx.band === "A") return finish({ source, band: "A", version: INSTRUMENT_VERSION, sections: [BAND_A_GATE, ...BAND_A_STUDENT], age: ctx.age });
  const subjects = subjectsFor(ctx.klass);
  const sections = studentSectionsBC(ctx.band, ctx.age).map((s) =>
    s.id !== "s1"
      ? s
      : {
          ...s,
          items: s.items.map((i) =>
            i.k === "S1.0"
              ? { ...i, opts: subjects.map((x) => ({ v: x.v, t: x.t })) }
              : i,
          ),
        },
  );
  return finish({ source, band: ctx.band, version: INSTRUMENT_VERSION, sections: [STUDENT_GATE, ...sections], subjects, age: ctx.age });
}

const DEFAULT_OPTS = { freq: FREQ, obs: OBS, a3: A3, rate: RATE } as const;

function finish(def: FormDef): FormDef {
  // Default answer scales, then Band B wording and floors, so the renderer and the validator see one definition.
  def.sections = def.sections.map((s) => ({
    ...s,
    items: s.items.map((i) =>
      i.opts || !(i.kind in DEFAULT_OPTS) ? i : { ...i, opts: DEFAULT_OPTS[i.kind as keyof typeof DEFAULT_OPTS] },
    ),
  }));
  if (def.band === "B") {
    def.sections = def.sections.map((s) => ({
      ...s,
      items: s.items.map((i) => ({ ...i, t: i.tB ?? i.t, floor: i.floorB ?? (i.floor ? Math.min(i.floor, 150) : i.floor) })),
    }));
  }
  return def;
}

export function allItems(def: FormDef): Item[] {
  return def.sections.flatMap((s) => s.items);
}

export { SKIP, chosenSubjects, gridKeys, isVisible, textLength, validateSection, validateItem, optionsFor, type Problem } from "./validate";

import type { Lang } from "./types";

/** Interface text for the instrument forms (English and Hindi; Hindi pending native review). */
const U = {
  next: { en: "Continue", hi: "आगे बढ़ें" },
  back: { en: "Back", hi: "पीछे" },
  submit: { en: "Submit", hi: "जमा करें" },
  sending: { en: "Sending…", hi: "भेजा जा रहा है…" },
  saving: { en: "Saving…", hi: "सहेजा जा रहा है…" },
  savedDraft: { en: "Saved on this device", hi: "इस डिवाइस पर सहेजा गया" },
  section: { en: "Part", hi: "भाग" },
  of: { en: "of", hi: "में से" },
  required: { en: "Please answer this one.", hi: "कृपया इसका उत्तर दें।" },
  requiredGrid: { en: "Please rate both columns for every subject you study.", hi: "अपने हर विषय के लिए दोनों कॉलम भरें।" },
  invalid: { en: "Please choose one of the options.", hi: "कृपया दिए गए विकल्पों में से एक चुनें।" },
  floor: { en: "Please write a little more — at least {n} characters. You have {m}.", hi: "कृपया थोड़ा और लिखें — कम से कम {n} अक्षर। अभी {m} हैं।" },
  fixBelow: { en: "A few answers on this page still need attention.", hi: "इस पन्ने के कुछ उत्तरों पर अभी ध्यान देना है।" },
  chars: { en: "{m} / {n} characters", hi: "{m} / {n} अक्षर" },
  charsFree: { en: "{m} characters", hi: "{m} अक्षर" },
  example: { en: "Example of the kind of detail that helps", hi: "किस तरह का विवरण मदद करता है, उसका उदाहरण" },
  skip: { en: "I’d rather not answer this one", hi: "मैं इसका उत्तर नहीं देना चाहता/चाहती" },
  skipped: { en: "Skipped. Changed your mind?", hi: "छोड़ दिया गया। मन बदल गया?" },
  unskip: { en: "Answer it", hi: "उत्तर दें" },
  enjoy: { en: "How much do you enjoy it?", hi: "कितना पसंद है?" },
  ease: { en: "How easy does it feel?", hi: "कितना आसान लगता है?" },
  pickSubjectsFirst: { en: "Choose your subjects above first.", hi: "पहले ऊपर अपने विषय चुनें।" },
  lockedBehind: { en: "Earlier answers are now locked, as explained.", hi: "जैसा बताया गया था, पिछले उत्तर अब बंद हो गए हैं।" },
  errLink: { en: "This link is not valid any more.", hi: "यह लिंक अब मान्य नहीं है।" },
  errLocked: { en: "This profile is being prepared, so the forms are closed.", hi: "यह प्रोफ़ाइल तैयार की जा रही है, इसलिए फ़ॉर्म बंद हैं।" },
  errDone: { en: "This form has already been submitted.", hi: "यह फ़ॉर्म पहले ही जमा हो चुका है।" },
  errSession: { en: "Your session has ended. Please sign in again — your answers are saved on this device.", hi: "आपका सत्र समाप्त हो गया है। कृपया फिर से साइन इन करें — आपके उत्तर इस डिवाइस पर सहेजे गए हैं।" },
  errNetwork: { en: "Could not reach PLINTH. Check your connection and try again — nothing is lost.", hi: "PLINTH से संपर्क नहीं हो सका। इंटरनेट जाँचकर फिर कोशिश करें — कुछ भी खोया नहीं है।" },
  resumeNote: { en: "You can stop and come back on this device; your answers are saved as you go.", hi: "आप रुककर इसी डिवाइस पर वापस आ सकते हैं; उत्तर साथ-साथ सहेजे जाते हैं।" },
  noneRight: { en: "There are no right or wrong answers.", hi: "कोई उत्तर सही या गलत नहीं है।" },
} as const;

export type UKey = keyof typeof U;

export function u(lang: Lang, k: UKey, vars?: Record<string, string | number>): string {
  let s: string = U[k][lang];
  if (vars) for (const [a, b] of Object.entries(vars)) s = s.replaceAll(`{${a}}`, String(b));
  return s;
}

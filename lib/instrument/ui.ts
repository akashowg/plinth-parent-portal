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
  pinTitle: { en: "Choose a secret 4-digit code", hi: "एक गुप्त 4 अंकों का कोड चुनो" },
  pinLead: {
    en: "Your answers are saved as you go, locked with this code. If you stop and come back — on this device or another — you will need it, so nobody else can see your answers. Pick one your parents don’t know.",
    hi: "तुम्हारे उत्तर साथ-साथ इस कोड से बंद करके सहेजे जाते हैं। अगर तुम रुककर वापस आओ — इसी फ़ोन पर या किसी दूसरे पर — तो यह कोड चाहिए होगा, ताकि कोई और तुम्हारे उत्तर न देख सके। ऐसा कोड चुनो जो तुम्हारे माता-पिता न जानते हों।",
  },
  pinLeadA: {
    en: "Set a 4-digit code for this session. The child’s answers are saved under it; if the session is interrupted you will need it to continue. Do not share it with the parent.",
    hi: "इस सत्र के लिए 4 अंकों का कोड बनाएँ। बच्चे के उत्तर इसी से सहेजे जाते हैं; सत्र रुक जाए तो आगे बढ़ने के लिए यह चाहिए होगा। इसे अभिभावक को न बताएँ।",
  },
  pinLabel: { en: "Code", hi: "कोड" },
  pinAgain: { en: "Type it again", hi: "फिर से लिखो" },
  pinInvalid: { en: "The code must be exactly 4 digits.", hi: "कोड में ठीक 4 अंक होने चाहिए।" },
  pinMismatch: { en: "The two codes don’t match.", hi: "दोनों कोड एक जैसे नहीं हैं।" },
  pinSimple: { en: "Please choose a less obvious code than 0000, 1234 or a repeated digit.", hi: "कृपया 0000, 1234 या एक ही अंक दोहराने से अलग कोड चुनो।" },
  unlockTitle: { en: "Welcome back", hi: "फिर से स्वागत है" },
  unlockLead: { en: "Your answers so far are locked. Enter your 4-digit code to continue.", hi: "अब तक के तुम्हारे उत्तर बंद हैं। आगे बढ़ने के लिए अपना 4 अंकों का कोड लिखो।" },
  unlockBtn: { en: "Unlock", hi: "खोलो" },
  wrongPin: { en: "That code is not right. {left} tries left.", hi: "यह कोड सही नहीं है। {left} कोशिशें बाकी हैं।" },
  resetDone: {
    en: "Too many wrong codes, so the saved answers were deleted to keep them private. You can start again.",
    hi: "कई बार गलत कोड डाला गया, इसलिए गोपनीयता के लिए सहेजे गए उत्तर हटा दिए गए। तुम फिर से शुरू कर सकते हो।",
  },
  startAgain: { en: "Forgot the code? Start again", hi: "कोड भूल गए? फिर से शुरू करो" },
  startAgainConfirm: {
    en: "This deletes the answers saved so far. Start again?",
    hi: "इससे अब तक सहेजे गए उत्तर हट जाएँगे। फिर से शुरू करें?",
  },
  pausedTitle: { en: "Paused to keep your answers private", hi: "तुम्हारे उत्तर निजी रखने के लिए रोका गया" },
  pausedLead: {
    en: "This page locks itself when it is left alone. Enter your code to carry on.",
    hi: "अकेला छोड़ने पर यह पेज अपने-आप बंद हो जाता है। आगे बढ़ने के लिए अपना कोड लिखो।",
  },
  wrongLocal: { en: "That code is not right.", hi: "यह कोड सही नहीं है।" },
  noneRight: { en: "There are no right or wrong answers.", hi: "कोई उत्तर सही या गलत नहीं है।" },
} as const;

export type UKey = keyof typeof U;

export function u(lang: Lang, k: UKey, vars?: Record<string, string | number>): string {
  let s: string = U[k][lang];
  if (vars) for (const [a, b] of Object.entries(vars)) s = s.replaceAll(`{${a}}`, String(b));
  return s;
}

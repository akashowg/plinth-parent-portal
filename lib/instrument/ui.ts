import type { Lang } from "./types";

/** Interface text for the instrument forms (English and Hindi; Hindi pending native review). */
export const U = {
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
  vSpeak: { en: "Speak your answer", hi: "बोलकर उत्तर दें" },
  vVideo: { en: "Speak on video", hi: "वीडियो पर बोलें" },
  vNoticeTitle: { en: "Before you speak", hi: "बोलने से पहले" },
  vNotice: {
    en: "Your browser’s speech service turns your words into text (Google on Android and Chrome, Apple on iPhone and Mac). PLINTH never receives or keeps a recording. Only the text you check and confirm is saved.",
    hi: "आपके ब्राउज़र की वाक् सेवा आपके शब्दों को लिखित रूप में बदलती है (Android और Chrome पर Google, iPhone और Mac पर Apple)। PLINTH को कोई रिकॉर्डिंग नहीं मिलती और न ही रखी जाती है। केवल वही लिखित उत्तर सहेजा जाता है जिसे आप जाँचकर पुष्टि करते हैं।",
  },
  vNoticeVideo: {
    en: "The camera only shows you to yourself while you speak. The video is not recorded or sent anywhere.",
    hi: "बोलते समय कैमरा केवल आपको आपकी छवि दिखाता है। वीडियो न रिकॉर्ड होता है, न कहीं भेजा जाता है।",
  },
  vStart: { en: "Start speaking", hi: "बोलना शुरू करें" },
  vCancel: { en: "Cancel", hi: "रद्द करें" },
  vLangLabel: { en: "Language you will speak", hi: "आप किस भाषा में बोलेंगे" },
  vListening: { en: "Listening. Speak naturally, then press Stop.", hi: "सुन रहे हैं। सहज रूप से बोलें, फिर रोकें दबाएँ।" },
  vStop: { en: "Stop", hi: "रोकें" },
  vMirror: { en: "Only you can see this. Nothing is recorded.", hi: "इसे केवल आप देख सकते हैं। कुछ भी रिकॉर्ड नहीं होता।" },
  vReviewTitle: { en: "Check what we heard", hi: "जाँचें कि हमने क्या सुना" },
  vReviewHelp: {
    en: "Correct any word that is wrong. Nothing is added until you press “Add to my answer”.",
    hi: "जो शब्द गलत हो उसे ठीक करें। “मेरे उत्तर में जोड़ें” दबाने तक कुछ नहीं जुड़ता।",
  },
  vAdd: { en: "Add to my answer", hi: "मेरे उत्तर में जोड़ें" },
  vRetry: { en: "Speak again", hi: "फिर से बोलें" },
  vDiscard: { en: "Discard", hi: "हटा दें" },
  vAdded: { en: "Added to your answer. You can still edit it above.", hi: "आपके उत्तर में जोड़ दिया गया। आप ऊपर अब भी इसे बदल सकते हैं।" },
  vEmpty: { en: "We did not catch any words. Try again a little closer to the microphone.", hi: "हमें कोई शब्द सुनाई नहीं दिया। माइक्रोफ़ोन के थोड़ा पास आकर फिर प्रयास करें।" },
  vDenied: {
    en: "The microphone is blocked for this page. Allow it in your browser settings, or type your answer.",
    hi: "इस पन्ने के लिए माइक्रोफ़ोन बंद है। ब्राउज़र की सेटिंग में अनुमति दें, या उत्तर टाइप करें।",
  },
  vCamDenied: { en: "The camera is not available, so this will be voice only.", hi: "कैमरा उपलब्ध नहीं है, इसलिए केवल आवाज़ से होगा।" },
  vNetwork: {
    en: "Voice typing needs an internet connection. Please type, or try again when you are online.",
    hi: "बोलकर लिखने के लिए इंटरनेट चाहिए। कृपया टाइप करें, या ऑनलाइन होने पर फिर प्रयास करें।",
  },
  vLangUnsupported: {
    en: "This browser cannot listen in that language. Choose another language, or type your answer.",
    hi: "यह ब्राउज़र उस भाषा में नहीं सुन सकता। दूसरी भाषा चुनें, या उत्तर टाइप करें।",
  },
  vLimit: { en: "Stopped at three minutes. Check the text, then speak again to add more.", hi: "तीन मिनट पर रोक दिया गया। लिखित उत्तर जाँचें, फिर और जोड़ने के लिए दोबारा बोलें।" },
  vUnsupported: {
    en: "To speak instead of typing, use the microphone key on your phone’s keyboard.",
    hi: "टाइप करने के बजाय बोलने के लिए, अपने फ़ोन के कीबोर्ड पर माइक्रोफ़ोन वाला बटन इस्तेमाल करें।",
  },
  vNoticeServer: {
    en: "Your words are turned into text by Sarvam AI, an Indian speech service, while you speak. The audio passes through PLINTH only to be transcribed, and nobody keeps a recording. Only the text you check and confirm is saved.",
    hi: "आप बोलते हैं, उसी समय Sarvam AI, एक भारतीय वाक् सेवा, आपके शब्दों को लिखित रूप में बदलती है। ऑडियो केवल लिखित रूप में बदलने के लिए PLINTH से होकर जाता है, और कोई भी रिकॉर्डिंग नहीं रखता। केवल वही लिखित उत्तर सहेजा जाता है जिसे आप जाँचकर पुष्टि करते हैं।",
  },
  vNoticeFallback: {
    en: "If Sarvam is unavailable, your browser’s speech service (Google or Apple) takes over automatically.",
    hi: "यदि Sarvam उपलब्ध न हो, तो आपके ब्राउज़र की वाक् सेवा (Google या Apple) अपने-आप काम संभाल लेती है।",
  },
  vSwitched: {
    en: "Sarvam is unavailable, so your browser’s speech service has taken over. Keep speaking. If your last sentence is missing, say it again.",
    hi: "Sarvam उपलब्ध नहीं है, इसलिए आपके ब्राउज़र की वाक् सेवा ने काम संभाल लिया है। बोलते रहें। यदि आपका आख़िरी वाक्य छूट गया हो, तो उसे फिर से बोलें।",
  },
  vSwitchedNone: {
    en: "Voice typing is unavailable in this browser right now. Check anything already heard, then type the rest.",
    hi: "इस ब्राउज़र में अभी बोलकर लिखना उपलब्ध नहीं है। जो सुना जा चुका है उसे जाँचें, फिर बाक़ी टाइप करें।",
  },
  vFinishing: { en: "Finishing the last words…", hi: "आख़िरी शब्द पूरे किए जा रहे हैं…" },
  vLimitHour: {
    en: "Voice typing has reached its limit for this hour. Please type, or try again later.",
    hi: "इस घंटे के लिए बोलकर लिखने की सीमा पूरी हो गई है। कृपया टाइप करें, या बाद में फिर प्रयास करें।",
  },
  vExpired: {
    en: "Voice typing is not available on this link right now. Please type your answer.",
    hi: "इस लिंक पर अभी बोलकर लिखना उपलब्ध नहीं है। कृपया उत्तर टाइप करें।",
  },
  vServerBusy: {
    en: "The speech service did not answer. Please try again, or type your answer.",
    hi: "वाक् सेवा से उत्तर नहीं मिला। कृपया फिर प्रयास करें, या उत्तर टाइप करें।",
  },
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

/** dict: the catalog subset for this language (passed from the server), used for languages beyond English and Hindi. */
export function u(lang: Lang, k: UKey, vars?: Record<string, string | number>, dict?: Record<string, string>): string {
  let s: string = lang === "en" || lang === "hi" ? U[k][lang] : (dict?.[U[k].en] ?? U[k].en);
  if (vars) for (const [a, b] of Object.entries(vars)) s = s.replaceAll(`{${a}}`, String(b));
  return s;
}

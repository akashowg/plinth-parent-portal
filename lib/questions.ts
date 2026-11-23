/**
 * PLINTH HDI intake question sets — DRAFT for Akash's approval.
 *
 * Drafted to cover every field the Studio fact sheet extracts (interests and whether self-initiated,
 * subjects enjoyed / found hard, stated aspirations, home environment, parent dynamic, regulation,
 * peers, and one independent educator paragraph). Like the current form, these sets do NOT ask for
 * marks, screen use or any medical / diagnostic information.
 *
 * Changing a question: edit its text here and bump QUESTION_SET_VERSION. Answers are stored with the
 * version they were given under, and the Studio export prints each question's wording beside its answer.
 */

export const QUESTION_SET_VERSION = "hdi-intake-draft-2026-11-23";

export type Lang = "en" | "hi";
export type Text = Record<Lang, string>;

export type Question =
  | { id: string; type: "long" | "short"; label: Text; help?: Text; required?: boolean }
  | { id: string; type: "choice"; label: Text; options: { value: string; label: Text }[]; required?: boolean }
  | { id: string; type: "scale"; label: Text; required?: boolean };

export const SCALE: { value: string; label: Text }[] = [
  { value: "rarely", label: { en: "Rarely", hi: "कभी-कभार" } },
  { value: "sometimes", label: { en: "Sometimes", hi: "कभी-कभी" } },
  { value: "often", label: { en: "Often", hi: "अक्सर" } },
  { value: "almost_always", label: { en: "Almost always", hi: "लगभग हमेशा" } },
  { value: "not_seen", label: { en: "Not observed", hi: "देखा नहीं" } },
];

/* ------------------------------------------------------------------ Parent (about 15 minutes) */
export const PARENT_QUESTIONS: Question[] = [
  {
    id: "p_describe",
    type: "long",
    required: true,
    label: {
      en: "How would you describe your child to someone who has never met them?",
      hi: "जो व्यक्ति आपके बच्चे से कभी नहीं मिला, उसे आप अपने बच्चे के बारे में कैसे बताएँगे?",
    },
  },
  {
    id: "p_free_time",
    type: "long",
    required: true,
    label: {
      en: "What does your child do in free time? Which of these do they start on their own, without being asked?",
      hi: "खाली समय में आपका बच्चा क्या करता है? इनमें से कौन-से काम वह बिना कहे, अपने आप शुरू करता है?",
    },
  },
  {
    id: "p_subjects",
    type: "long",
    required: true,
    label: {
      en: "Which subjects or activities does your child enjoy most, and which do they find hardest?",
      hi: "आपके बच्चे को कौन-से विषय या गतिविधियाँ सबसे अच्छी लगती हैं, और कौन-सी सबसे कठिन लगती हैं?",
    },
  },
  {
    id: "p_difficulty",
    type: "long",
    required: true,
    label: {
      en: "When something goes wrong or feels difficult — a poor result, a disagreement, a task they cannot do — how does your child usually react?",
      hi: "जब कुछ गलत हो जाए या कठिन लगे — जैसे खराब परिणाम, कोई बहस, या ऐसा काम जो न हो पाए — तो आपका बच्चा आमतौर पर कैसी प्रतिक्रिया देता है?",
    },
  },
  {
    id: "p_comfort",
    type: "long",
    required: true,
    label: {
      en: "When your child is worried or upset, what helps them most, and who do they turn to?",
      hi: "जब आपका बच्चा चिंतित या परेशान होता है, तो उसे सबसे अधिक क्या मदद करता है, और वह किसके पास जाता है?",
    },
  },
  {
    id: "p_social",
    type: "long",
    required: true,
    label: {
      en: "How does your child get along with other children, and with adults outside the family?",
      hi: "आपका बच्चा दूसरे बच्चों के साथ, और परिवार के बाहर के बड़ों के साथ कैसे घुलता-मिलता है?",
    },
  },
  {
    id: "p_routine",
    type: "long",
    required: true,
    label: {
      en: "Describe a normal school day at home: study, sleep, meals, play and family time.",
      hi: "घर पर स्कूल वाले एक सामान्य दिन के बारे में बताइए: पढ़ाई, नींद, भोजन, खेल और परिवार के साथ समय।",
    },
  },
  {
    id: "p_support",
    type: "long",
    required: true,
    label: {
      en: "Who helps your child with studies at home, and how? (for example a parent, a sibling, tuition, or no one regularly)",
      hi: "घर पर पढ़ाई में आपके बच्चे की मदद कौन करता है, और कैसे? (जैसे माता-पिता, भाई-बहन, ट्यूशन, या कोई नियमित रूप से नहीं)",
    },
  },
  {
    id: "p_hopes",
    type: "long",
    required: true,
    label: {
      en: "What do you most hope for your child? Has your child, or have you, named any future goals?",
      hi: "आप अपने बच्चे के लिए सबसे अधिक क्या आशा करते हैं? क्या आपके बच्चे ने, या आपने, भविष्य का कोई लक्ष्य बताया है?",
    },
  },
  {
    id: "p_concern",
    type: "long",
    label: {
      en: "Is anything concerning you at the moment? (optional)",
      hi: "क्या इस समय कोई बात आपको चिंतित कर रही है? (वैकल्पिक)",
    },
    help: {
      en: "You do not need to share medical or health details. PLINTH does not diagnose.",
      hi: "चिकित्सा या स्वास्थ्य संबंधी जानकारी देने की आवश्यकता नहीं है। PLINTH कोई निदान नहीं करता।",
    },
  },
  {
    id: "p_changes",
    type: "long",
    label: {
      en: "Have there been any big changes this year that may affect your child — a move, a new school, a new sibling? (optional)",
      hi: "क्या इस वर्ष कोई बड़ा बदलाव हुआ है जो आपके बच्चे पर असर डाल सकता है — घर बदलना, नया स्कूल, नया भाई-बहन? (वैकल्पिक)",
    },
  },
  {
    id: "p_overall",
    type: "long",
    required: true,
    label: {
      en: "In your own words, what else should PLINTH understand about your child?",
      hi: "अपने शब्दों में, PLINTH को आपके बच्चे के बारे में और क्या समझना चाहिए?",
    },
  },
];

/* ------------------------------------------------------------------ Student (about 20 minutes) */
export const STUDENT_QUESTIONS: Question[] = [
  {
    id: "s_enjoy",
    type: "long",
    required: true,
    label: { en: "What are three things you really enjoy doing?", hi: "ऐसी तीन चीज़ें बताओ जो तुम्हें करना सच में अच्छा लगता है।" },
  },
  {
    id: "s_own",
    type: "long",
    required: true,
    label: {
      en: "Which of these do you do on your own, without anyone asking you?",
      hi: "इनमें से कौन-सी चीज़ें तुम अपने आप करते हो, बिना किसी के कहे?",
    },
  },
  {
    id: "s_subject_like",
    type: "long",
    required: true,
    label: { en: "Which school subjects do you enjoy most? Why?", hi: "स्कूल के कौन-से विषय तुम्हें सबसे अच्छे लगते हैं? क्यों?" },
  },
  {
    id: "s_subject_hard",
    type: "long",
    required: true,
    label: {
      en: "Which subject or task feels hardest for you? What makes it hard?",
      hi: "कौन-सा विषय या काम तुम्हें सबसे कठिन लगता है? वह कठिन क्यों लगता है?",
    },
  },
  {
    id: "s_learn_way",
    type: "long",
    required: true,
    label: {
      en: "How do you like to learn something new — reading, watching, doing it with your hands, talking it through, or another way?",
      hi: "तुम्हें कुछ नया सीखना कैसे अच्छा लगता है — पढ़कर, देखकर, हाथ से करके, बात करके, या किसी और तरीके से?",
    },
  },
  {
    id: "s_persist",
    type: "long",
    required: true,
    label: {
      en: "Tell us about a time you kept going at something difficult. What helped you?",
      hi: "कोई ऐसा समय बताओ जब तुमने कठिन काम को छोड़ा नहीं और करते रहे। किस चीज़ ने तुम्हारी मदद की?",
    },
  },
  {
    id: "s_wrong",
    type: "long",
    required: true,
    label: {
      en: "When something goes wrong, what do you usually feel, and what do you do?",
      hi: "जब कुछ गलत हो जाता है, तो तुम्हें आमतौर पर कैसा लगता है, और तुम क्या करते हो?",
    },
  },
  {
    id: "s_help",
    type: "long",
    required: true,
    label: {
      en: "Who do you go to when you need help or feel upset?",
      hi: "जब तुम्हें मदद चाहिए या मन परेशान हो, तो तुम किसके पास जाते हो?",
    },
  },
  {
    id: "s_self",
    type: "long",
    required: true,
    label: {
      en: "What do your friends like about you? What do you like about yourself?",
      hi: "तुम्हारे दोस्तों को तुम्हारी कौन-सी बात अच्छी लगती है? तुम्हें अपनी कौन-सी बात अच्छी लगती है?",
    },
  },
  {
    id: "s_build",
    type: "long",
    required: true,
    label: {
      en: "If you could learn or make anything in the next year, what would it be?",
      hi: "अगर तुम अगले एक साल में कुछ भी सीख या बना सको, तो वह क्या होगा?",
    },
  },
  {
    id: "s_future",
    type: "long",
    required: true,
    label: {
      en: "What would you like to do when you are older? It is fine to say “I don’t know yet.”",
      hi: "बड़े होकर तुम क्या करना चाहोगे? “अभी पता नहीं” कहना भी बिल्कुल ठीक है।",
    },
  },
  {
    id: "s_wish",
    type: "long",
    label: {
      en: "Is there anything you wish the adults around you understood about you? (optional)",
      hi: "क्या कोई ऐसी बात है जो तुम चाहते हो कि तुम्हारे आसपास के बड़े तुम्हारे बारे में समझें? (वैकल्पिक)",
    },
  },
];

/* ------------------------------------------------------------------ Teacher (about 10 minutes) */
export const TEACHER_CONTEXT: Question[] = [
  { id: "t_name", type: "short", required: true, label: { en: "Your name", hi: "आपका नाम" } },
  {
    id: "t_role",
    type: "choice",
    required: true,
    label: { en: "How do you teach this student?", hi: "आप इस विद्यार्थी को किस रूप में पढ़ाते हैं?" },
    options: [
      { value: "class_teacher", label: { en: "Class teacher", hi: "कक्षा शिक्षक" } },
      { value: "subject_teacher", label: { en: "Subject teacher", hi: "विषय शिक्षक" } },
      { value: "cocurricular", label: { en: "Co-curricular, sport or arts", hi: "सह-पाठ्यक्रम, खेल या कला" } },
      { value: "other", label: { en: "Other", hi: "अन्य" } },
    ],
  },
  { id: "t_subject", type: "short", label: { en: "Subject or activity (optional)", hi: "विषय या गतिविधि (वैकल्पिक)" } },
  {
    id: "t_duration",
    type: "choice",
    required: true,
    label: { en: "How long have you taught this student?", hi: "आप इस विद्यार्थी को कितने समय से पढ़ा रहे हैं?" },
    options: [
      { value: "lt6m", label: { en: "Less than 6 months", hi: "6 महीने से कम" } },
      { value: "6to12m", label: { en: "6–12 months", hi: "6–12 महीने" } },
      { value: "1to2y", label: { en: "1–2 years", hi: "1–2 वर्ष" } },
      { value: "gt2y", label: { en: "More than 2 years", hi: "2 वर्ष से अधिक" } },
    ],
  },
];

export const TEACHER_SCALES: Question[] = [
  { id: "t_sc_attention", type: "scale", required: true, label: { en: "Stays focused during lessons", hi: "पाठ के दौरान ध्यान बनाए रखता/रखती है" } },
  { id: "t_sc_questions", type: "scale", required: true, label: { en: "Asks questions or offers ideas", hi: "प्रश्न पूछता/पूछती है या विचार रखता/रखती है" } },
  { id: "t_sc_finish", type: "scale", required: true, label: { en: "Completes work on time", hi: "समय पर काम पूरा करता/करती है" } },
  { id: "t_sc_peers", type: "scale", required: true, label: { en: "Works well with classmates", hi: "सहपाठियों के साथ अच्छे से काम करता/करती है" } },
  { id: "t_sc_recover", type: "scale", required: true, label: { en: "Recovers after a setback", hi: "किसी असफलता के बाद फिर से सँभल जाता/जाती है" } },
  { id: "t_sc_feedback", type: "scale", required: true, label: { en: "Uses feedback to improve", hi: "सुझावों का उपयोग करके सुधार करता/करती है" } },
];

export const TEACHER_QUESTIONS: Question[] = [
  {
    id: "t_engage",
    type: "long",
    required: true,
    label: {
      en: "How does this student engage in your class — attention, questions, participation?",
      hi: "यह विद्यार्थी आपकी कक्षा में कैसे भाग लेता/लेती है — ध्यान, प्रश्न, सहभागिता?",
    },
  },
  {
    id: "t_challenge",
    type: "long",
    required: true,
    label: {
      en: "How does the student approach difficult or unfamiliar work?",
      hi: "यह विद्यार्थी कठिन या नए काम को कैसे करता/करती है?",
    },
  },
  {
    id: "t_strengths",
    type: "long",
    required: true,
    label: {
      en: "What strengths have you noticed, including outside academics?",
      hi: "आपने कौन-सी खूबियाँ देखी हैं, पढ़ाई के बाहर की भी?",
    },
  },
  {
    id: "t_support",
    type: "long",
    required: true,
    label: {
      en: "Where could the student use more support, and what has helped so far?",
      hi: "विद्यार्थी को किन बातों में और सहयोग की ज़रूरत है, और अब तक क्या मददगार रहा है?",
    },
  },
  {
    id: "t_paragraph",
    type: "long",
    required: true,
    label: {
      en: "One honest paragraph, in your own words: what would help someone understand this student?",
      hi: "अपने शब्दों में एक ईमानदार अनुच्छेद: इस विद्यार्थी को समझने में किसी की क्या मदद करेगा?",
    },
    help: {
      en: "Please write this yourself. It is the most valuable part of the profile.",
      hi: "कृपया इसे स्वयं लिखें। यह प्रोफ़ाइल का सबसे मूल्यवान हिस्सा है।",
    },
  },
];

export const CLASS_OPTIONS = [
  "Nursery", "LKG", "UKG", "Class I", "Class II", "Class III", "Class IV", "Class V", "Class VI",
  "Class VII", "Class VIII", "Class IX", "Class X", "Class XI", "Class XII",
];

export function allQuestions(source: "parent" | "student" | "educator"): Question[] {
  if (source === "parent") return PARENT_QUESTIONS;
  if (source === "student") return STUDENT_QUESTIONS;
  return [...TEACHER_CONTEXT, ...TEACHER_SCALES, ...TEACHER_QUESTIONS];
}

export const MAX_ANSWER = 4000;

/** Validate and collect answers from submitted form data. Returns the missing required question ids. */
export function collectAnswers(source: "parent" | "student" | "educator", fd: FormData) {
  const qs = allQuestions(source);
  const answers: Record<string, string> = {};
  const missing: string[] = [];
  for (const q of qs) {
    const raw = String(fd.get(q.id) ?? "").trim().slice(0, MAX_ANSWER);
    if (q.type === "choice") {
      if (raw && !q.options.some((o) => o.value === raw)) continue;
    }
    if (q.type === "scale") {
      if (raw && !SCALE.some((o) => o.value === raw)) continue;
    }
    if (raw) answers[q.id] = raw;
    else if (q.required) missing.push(q.id);
  }
  return { answers, missing };
}

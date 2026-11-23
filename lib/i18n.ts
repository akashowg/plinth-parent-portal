import type { Lang } from "./questions";

/**
 * Interface text in English and Hindi. Hindi drafted for review by a native speaker before launch.
 */
const D = {
  portal: { en: "Parent Portal", hi: "अभिभावक पोर्टल" },
  switchTo: { en: "हिन्दी", hi: "English" },
  footerNote: {
    en: "PLINTH HDI is a developmental reading, not a test, diagnosis or prediction.",
    hi: "PLINTH HDI एक विकासात्मक समझ है — यह कोई परीक्षा, निदान या भविष्यवाणी नहीं है।",
  },
  privacy: { en: "Privacy notice", hi: "गोपनीयता सूचना" },
  initiative: { en: "A PLINTH Network initiative", hi: "PLINTH Network की एक पहल" },
  signIn: { en: "Sign in", hi: "साइन इन" },
  signOut: { en: "Sign out", hi: "साइन आउट" },

  /* landing */
  kicker: { en: "Human Development Intelligence · by PLINTH Network", hi: "मानव विकास इंटेलिजेंस · PLINTH Network द्वारा" },
  heroTitle: {
    en: "Understand how your child is growing — in their words, and yours.",
    hi: "समझिए कि आपका बच्चा कैसे बढ़ रहा है — उसके शब्दों में, और आपके शब्दों में।",
  },
  heroLead: {
    en: "PLINTH brings together three views of your child — your child’s, yours, and one teacher’s — and prepares a developmental dossier with practical steps for home and school. A person at PLINTH reads and approves every dossier before it reaches you.",
    hi: "PLINTH आपके बच्चे को तीन दृष्टियों से देखता है — आपके बच्चे की, आपकी, और एक शिक्षक की — और घर व स्कूल के लिए व्यावहारिक कदमों के साथ एक विकासात्मक डोज़ियर तैयार करता है। हर डोज़ियर आप तक पहुँचने से पहले PLINTH का एक व्यक्ति पढ़ता और स्वीकृत करता है।",
  },
  begin: { en: "Begin", hi: "शुरू करें" },
  alreadyStarted: { en: "Already started? Sign in", hi: "पहले शुरू कर चुके हैं? साइन इन करें" },
  howTitle: { en: "How it works", hi: "यह कैसे काम करता है" },
  how1t: { en: "Give consent", hi: "सहमति दें" },
  how1: {
    en: "Confirm you are the parent or guardian and verify your email. About two minutes.",
    hi: "पुष्टि करें कि आप माता-पिता या अभिभावक हैं और अपना ईमेल सत्यापित करें। लगभग दो मिनट।",
  },
  how2t: { en: "Three short forms", hi: "तीन छोटे फ़ॉर्म" },
  how2: {
    en: "You fill the parent form (about 15 minutes). You get one link for your child and one for a teacher, ready to send on WhatsApp.",
    hi: "आप अभिभावक फ़ॉर्म भरते हैं (लगभग 15 मिनट)। आपको अपने बच्चे के लिए एक लिंक और एक शिक्षक के लिए एक लिंक मिलता है, जिसे WhatsApp पर भेजा जा सकता है।",
  },
  how3t: { en: "Receive your dossier", hi: "अपना डोज़ियर प्राप्त करें" },
  how3: {
    en: "When all three are in, PLINTH prepares the dossier, reviews it, and sends it to you.",
    hi: "तीनों फ़ॉर्म आने के बाद PLINTH डोज़ियर तैयार करता है, उसकी समीक्षा करता है और आपको भेजता है।",
  },
  isTitle: { en: "What HDI is — and is not", hi: "HDI क्या है — और क्या नहीं" },
  isBody: {
    en: "HDI is a strength-first reading of how your child learns, feels, relates and grows, written with honest levels of confidence. It is not a test, a diagnosis, a ranking against other children, or a prediction of your child’s future.",
    hi: "HDI इस बात की ताकत-केंद्रित समझ है कि आपका बच्चा कैसे सीखता है, महसूस करता है, संबंध बनाता है और बढ़ता है — ईमानदार विश्वास-स्तर के साथ। यह कोई परीक्षा, निदान, दूसरे बच्चों से तुलना, या आपके बच्चे के भविष्य की भविष्यवाणी नहीं है।",
  },
  privTitle: { en: "Your family’s privacy", hi: "आपके परिवार की गोपनीयता" },
  privBody: {
    en: "Answers are encrypted and used only by PLINTH to prepare your dossier. They are not shared with your child’s school, and the teacher does not see your answers. You can withdraw consent at any time, and your family’s answers will be deleted.",
    hi: "उत्तर एन्क्रिप्ट किए जाते हैं और केवल PLINTH द्वारा आपका डोज़ियर तैयार करने में उपयोग होते हैं। ये आपके बच्चे के स्कूल के साथ साझा नहीं किए जाते, और शिक्षक आपके उत्तर नहीं देखते। आप कभी भी सहमति वापस ले सकते हैं, और आपके परिवार के उत्तर हटा दिए जाएँगे।",
  },

  /* start */
  startTitle: { en: "Start your child’s profile", hi: "अपने बच्चे की प्रोफ़ाइल शुरू करें" },
  startLead: {
    en: "We need a few details and your consent before anyone answers a question.",
    hi: "किसी भी प्रश्न का उत्तर देने से पहले हमें कुछ जानकारी और आपकी सहमति चाहिए।",
  },
  aboutYou: { en: "About you", hi: "आपके बारे में" },
  parentName: { en: "Your full name", hi: "आपका पूरा नाम" },
  relation: { en: "Your relationship to the child", hi: "बच्चे से आपका संबंध" },
  relMother: { en: "Mother", hi: "माँ" },
  relFather: { en: "Father", hi: "पिता" },
  relGuardian: { en: "Legal guardian", hi: "कानूनी अभिभावक" },
  email: { en: "Email address", hi: "ईमेल पता" },
  emailHelp: { en: "We send a 6-digit code here to verify it is you.", hi: "आपकी पहचान की पुष्टि के लिए हम यहाँ 6 अंकों का कोड भेजेंगे।" },
  whatsapp: { en: "WhatsApp number (optional)", hi: "WhatsApp नंबर (वैकल्पिक)" },
  whatsappHelp: { en: "Only used to send you the finished dossier.", hi: "केवल तैयार डोज़ियर भेजने के लिए उपयोग होगा।" },
  otherParent: { en: "Other parent’s name (optional)", hi: "दूसरे अभिभावक का नाम (वैकल्पिक)" },
  aboutChild: { en: "About your child", hi: "आपके बच्चे के बारे में" },
  childName: { en: "Child’s full name", hi: "बच्चे का पूरा नाम" },
  dob: { en: "Date of birth", hi: "जन्म तिथि" },
  klass: { en: "Current class", hi: "वर्तमान कक्षा" },
  choose: { en: "Choose…", hi: "चुनें…" },
  gender: { en: "How would you describe your child?", hi: "आप अपने बच्चे का वर्णन कैसे करेंगे?" },
  girl: { en: "Girl", hi: "लड़की" },
  boy: { en: "Boy", hi: "लड़का" },
  preferNot: { en: "Prefer not to say", hi: "बताना नहीं चाहते" },
  city: { en: "City or town", hi: "शहर या कस्बा" },
  state: { en: "State", hi: "राज्य" },
  consentTitle: { en: "Your consent", hi: "आपकी सहमति" },
  consentLead: {
    en: "India’s data protection law requires verifiable consent from a parent or guardian before a child’s information is collected. Please read and tick each point.",
    hi: "भारत के डेटा संरक्षण कानून के अनुसार बच्चे की जानकारी एकत्र करने से पहले माता-पिता या अभिभावक की सत्यापन योग्य सहमति आवश्यक है। कृपया हर बिंदु पढ़कर चिह्नित करें।",
  },
  c_guardian: {
    en: "I am this child’s parent or legal guardian, and I am 18 or older.",
    hi: "मैं इस बच्चे का/की माता-पिता या कानूनी अभिभावक हूँ, और मेरी आयु 18 वर्ष या उससे अधिक है।",
  },
  c_purpose: {
    en: "PLINTH may collect my answers, my child’s answers and one teacher’s observations, only to prepare a developmental dossier for my family.",
    hi: "PLINTH मेरे उत्तर, मेरे बच्चे के उत्तर और एक शिक्षक के अवलोकन केवल मेरे परिवार के लिए विकासात्मक डोज़ियर तैयार करने हेतु एकत्र कर सकता है।",
  },
  c_ai: {
    en: "The answers are processed with an AI model (Claude, by Anthropic) to draft the dossier, and a person at PLINTH reviews every dossier before it is sent to me.",
    hi: "डोज़ियर का प्रारूप तैयार करने के लिए उत्तरों को एक AI मॉडल (Anthropic का Claude) से प्रोसेस किया जाता है, और मुझे भेजे जाने से पहले PLINTH का एक व्यक्ति हर डोज़ियर की समीक्षा करता है।",
  },
  c_nature: {
    en: "HDI is not a medical, psychological or diagnostic assessment, and it does not predict my child’s future.",
    hi: "HDI कोई चिकित्सीय, मनोवैज्ञानिक या निदानात्मक मूल्यांकन नहीं है, और यह मेरे बच्चे के भविष्य की भविष्यवाणी नहीं करता।",
  },
  c_withdraw: {
    en: "I can withdraw consent at any time from this portal, and my family’s answers will then be deleted.",
    hi: "मैं इस पोर्टल से कभी भी सहमति वापस ले सकता/सकती हूँ, और तब मेरे परिवार के उत्तर हटा दिए जाएँगे।",
  },
  readNotice: { en: "Read the full privacy notice", hi: "पूरी गोपनीयता सूचना पढ़ें" },
  continueVerify: { en: "Continue and send my code", hi: "आगे बढ़ें और मेरा कोड भेजें" },
  errRequired: { en: "Please fill every required field.", hi: "कृपया सभी आवश्यक जानकारी भरें।" },
  errConsent: { en: "Please tick every consent point to continue.", hi: "आगे बढ़ने के लिए कृपया सहमति के सभी बिंदु चिह्नित करें।" },
  errEmail: { en: "Please enter a valid email address.", hi: "कृपया एक मान्य ईमेल पता दर्ज करें।" },
  errTooMany: { en: "Too many codes requested. Please wait an hour and try again.", hi: "बहुत अधिक कोड माँगे गए। कृपया एक घंटा रुककर फिर प्रयास करें।" },
  errMail: { en: "We could not send the email. Please check the address and try again.", hi: "ईमेल नहीं भेजा जा सका। कृपया पता जाँचकर फिर प्रयास करें।" },
  errGeneric: { en: "Something went wrong. Please try again.", hi: "कुछ गड़बड़ हुई। कृपया फिर प्रयास करें।" },

  /* verify / login */
  verifyTitle: { en: "Check your email", hi: "अपना ईमेल देखें" },
  verifyLead: {
    en: "We sent a 6-digit code to your email. It works for 10 minutes.",
    hi: "हमने आपके ईमेल पर 6 अंकों का कोड भेजा है। यह 10 मिनट तक मान्य है।",
  },
  code: { en: "6-digit code", hi: "6 अंकों का कोड" },
  verify: { en: "Verify", hi: "सत्यापित करें" },
  errCode: { en: "That code is not right or has expired.", hi: "यह कोड सही नहीं है या समाप्त हो चुका है।" },
  devCode: { en: "Development mode — your code is", hi: "डेवलपमेंट मोड — आपका कोड है" },
  loginTitle: { en: "Sign in", hi: "साइन इन करें" },
  loginLead: {
    en: "Enter the email you used when you started. We will send you a code.",
    hi: "वह ईमेल दर्ज करें जिससे आपने शुरुआत की थी। हम आपको एक कोड भेजेंगे।",
  },
  sendCode: { en: "Send code", hi: "कोड भेजें" },
  loginSent: {
    en: "If that email has a profile with us, a code is on its way.",
    hi: "यदि इस ईमेल से हमारे पास कोई प्रोफ़ाइल है, तो कोड भेजा जा रहा है।",
  },

  /* case */
  caseTitle: { en: "Your child’s profile", hi: "आपके बच्चे की प्रोफ़ाइल" },
  reference: { en: "Reference", hi: "संदर्भ" },
  step1: { en: "Your parent form", hi: "आपका अभिभावक फ़ॉर्म" },
  step1Lead: { en: "About 15 minutes. Honest, everyday observations help most.", hi: "लगभग 15 मिनट। ईमानदार, रोज़मर्रा के अवलोकन सबसे अधिक मदद करते हैं।" },
  fillForm: { en: "Fill the parent form", hi: "अभिभावक फ़ॉर्म भरें" },
  editForm: { en: "Review or change my answers", hi: "मेरे उत्तर देखें या बदलें" },
  step2: { en: "Your child’s form", hi: "आपके बच्चे का फ़ॉर्म" },
  step2Lead: {
    en: "Your child can fill it here on this device now, or you can send them the link. Let them answer in their own words; please do not answer for them. For a child under 8, sit beside them and write their words as they say them.",
    hi: "आपका बच्चा इसे अभी इसी फ़ोन या कंप्यूटर पर भर सकता है, या आप उसे लिंक भेज सकते हैं। उन्हें अपने शब्दों में उत्तर देने दें; कृपया उनकी ओर से उत्तर न दें। 8 वर्ष से छोटे बच्चे के साथ बैठें और जैसा वह बोले वैसा ही लिखें।",
  },
  fillHere: { en: "My child will fill it here now", hi: "मेरा बच्चा इसे अभी यहीं भरेगा" },
  orShare: { en: "Or send the link to your child:", hi: "या अपने बच्चे को लिंक भेजें:" },
  parentBack: { en: "Parent: back to your child’s profile", hi: "अभिभावक: बच्चे की प्रोफ़ाइल पर वापस जाएँ" },
  step3: { en: "One teacher’s form", hi: "एक शिक्षक का फ़ॉर्म" },
  step3Lead: {
    en: "Send this link to one teacher who knows your child well — a class teacher, a subject teacher or a coach. The teacher must write it themselves: a teacher’s independent view is what makes the profile reliable.",
    hi: "यह लिंक ऐसे एक शिक्षक को भेजें जो आपके बच्चे को अच्छी तरह जानते हों — कक्षा शिक्षक, विषय शिक्षक या कोच। शिक्षक इसे स्वयं लिखें: शिक्षक की स्वतंत्र राय ही प्रोफ़ाइल को विश्वसनीय बनाती है।",
  },
  copyLink: { en: "Copy link", hi: "लिंक कॉपी करें" },
  copied: { en: "Copied", hi: "कॉपी हो गया" },
  sendWhatsApp: { en: "Send on WhatsApp", hi: "WhatsApp पर भेजें" },
  waStudent: {
    en: "Hi! This is a short reflection form about how you like to learn and what you enjoy. It is not a test and nothing is marked. Please answer in your own words:",
    hi: "नमस्ते! यह एक छोटा फ़ॉर्म है कि तुम्हें कैसे सीखना और क्या करना अच्छा लगता है। यह कोई परीक्षा नहीं है और कोई अंक नहीं मिलते। कृपया अपने शब्दों में उत्तर दो:",
  },
  waTeacher: {
    en: "Dear teacher, I am preparing a PLINTH developmental profile for my child. Your honest classroom observation would help greatly — it takes about 10 minutes, and I will not see your answers:",
    hi: "आदरणीय शिक्षक, मैं अपने बच्चे के लिए PLINTH विकासात्मक प्रोफ़ाइल तैयार कर रहा/रही हूँ। आपके ईमानदार कक्षा-अवलोकन से बहुत मदद मिलेगी — इसमें लगभग 10 मिनट लगते हैं, और मैं आपके उत्तर नहीं देख पाऊँगा/पाऊँगी:",
  },
  received: { en: "Received", hi: "प्राप्त" },
  waiting: { en: "Waiting", hi: "प्रतीक्षा में" },
  allIn: {
    en: "All three forms are in. PLINTH will prepare your child’s dossier, review it, and send it to you. You do not need to do anything else.",
    hi: "तीनों फ़ॉर्म आ गए हैं। PLINTH आपके बच्चे का डोज़ियर तैयार करेगा, उसकी समीक्षा करेगा और आपको भेजेगा। आपको और कुछ करने की आवश्यकता नहीं है।",
  },
  statusInStudio: { en: "Your child’s dossier is being prepared and reviewed.", hi: "आपके बच्चे का डोज़ियर तैयार और समीक्षा किया जा रहा है।" },
  statusDelivered: { en: "Your child’s dossier has been sent to you.", hi: "आपके बच्चे का डोज़ियर आपको भेज दिया गया है।" },
  consentRecord: { en: "Your consent record", hi: "आपकी सहमति का रिकॉर्ड" },
  consentGiven: { en: "Consent given and email verified on", hi: "सहमति दी गई और ईमेल सत्यापित हुआ" },
  withdrawTitle: { en: "Withdraw consent", hi: "सहमति वापस लें" },
  withdrawLead: {
    en: "This stops all processing and permanently deletes every answer from your family. Only a record that consent was given and withdrawn is kept. This cannot be undone.",
    hi: "इससे सारी प्रोसेसिंग रुक जाएगी और आपके परिवार के सभी उत्तर स्थायी रूप से हटा दिए जाएँगे। केवल सहमति देने और वापस लेने का रिकॉर्ड रखा जाएगा। इसे पलटा नहीं जा सकता।",
  },
  withdrawConfirm: { en: "Type WITHDRAW to confirm", hi: "पुष्टि के लिए WITHDRAW लिखें" },
  withdrawButton: { en: "Withdraw and delete answers", hi: "सहमति वापस लें और उत्तर हटाएँ" },
  withdrawnTitle: { en: "Consent withdrawn", hi: "सहमति वापस ले ली गई" },
  withdrawnBody: {
    en: "Your family’s answers have been deleted. Thank you for considering PLINTH.",
    hi: "आपके परिवार के उत्तर हटा दिए गए हैं। PLINTH पर विचार करने के लिए धन्यवाद।",
  },

  /* forms */
  required: { en: "Required", hi: "आवश्यक" },
  submit: { en: "Submit answers", hi: "उत्तर जमा करें" },
  saved: { en: "Thank you — your answers are saved.", hi: "धन्यवाद — आपके उत्तर सहेज लिए गए हैं।" },
  backToProfile: { en: "Back to the profile", hi: "प्रोफ़ाइल पर वापस जाएँ" },
  answerHint: {
    en: "Write as much or as little as feels right. There are no right or wrong answers. You can write in English or Hindi.",
    hi: "जितना ठीक लगे उतना लिखें। कोई उत्तर सही या गलत नहीं है। आप हिन्दी या अंग्रेज़ी में लिख सकते हैं।",
  },
  parentFormTitle: { en: "Parent form", hi: "अभिभावक फ़ॉर्म" },
  aboutChildFor: { en: "About", hi: "के बारे में" },

  studentTitle: { en: "Your reflection", hi: "तुम्हारे विचार" },
  studentHello: {
    en: "This is about you — what you enjoy, how you like to learn, and what matters to you.",
    hi: "यह तुम्हारे बारे में है — तुम्हें क्या अच्छा लगता है, तुम कैसे सीखना पसंद करते हो, और तुम्हारे लिए क्या मायने रखता है।",
  },
  assentTitle: { en: "Before you start", hi: "शुरू करने से पहले" },
  assent1: { en: "This is not a test. Nothing is marked.", hi: "यह कोई परीक्षा नहीं है। कोई अंक नहीं मिलते।" },
  assent2: { en: "There are no right or wrong answers.", hi: "कोई उत्तर सही या गलत नहीं है।" },
  assent3: { en: "You can skip any question you don’t want to answer.", hi: "जिस प्रश्न का उत्तर नहीं देना चाहते, उसे छोड़ सकते हो।" },
  assent4: {
    en: "Your parent has agreed to this. Your answers help the people around you support you better.",
    hi: "तुम्हारे माता-पिता ने इसके लिए सहमति दी है। तुम्हारे उत्तर तुम्हारे आसपास के लोगों को तुम्हारी बेहतर मदद करने में सहायक होंगे।",
  },
  assentAgree: { en: "I’m happy to answer.", hi: "मैं उत्तर देने के लिए तैयार हूँ।" },
  errAssent: { en: "Please tick “I’m happy to answer” to continue.", hi: "आगे बढ़ने के लिए कृपया “मैं उत्तर देने के लिए तैयार हूँ” चिह्नित करो।" },
  studentThanks: {
    en: "Thank you! Your answers are saved. You can close this page now.",
    hi: "धन्यवाद! तुम्हारे उत्तर सहेज लिए गए हैं। अब तुम यह पेज बंद कर सकते हो।",
  },

  teacherTitle: { en: "Teacher observation", hi: "शिक्षक अवलोकन" },
  teacherLead: {
    en: "A parent has asked for your honest observation of their child, as part of a PLINTH developmental profile. About 10 minutes.",
    hi: "एक अभिभावक ने PLINTH विकासात्मक प्रोफ़ाइल के लिए अपने बच्चे के बारे में आपका ईमानदार अवलोकन माँगा है। लगभग 10 मिनट।",
  },
  teacherNotice: {
    en: "Your answers go only to PLINTH. The parent does not see them, and they are not shared with your school. Your name is kept with your answers so PLINTH can weigh your observation correctly.",
    hi: "आपके उत्तर केवल PLINTH को जाते हैं। अभिभावक उन्हें नहीं देखते, और वे आपके स्कूल के साथ साझा नहीं किए जाते। आपका नाम आपके उत्तरों के साथ रखा जाता है ताकि PLINTH आपके अवलोकन को सही ढंग से समझ सके।",
  },
  teacherDeclare: {
    en: "I teach or coach this student, and these are my own observations, written by me.",
    hi: "मैं इस विद्यार्थी को पढ़ाता/पढ़ाती या प्रशिक्षित करता/करती हूँ, और ये मेरे अपने अवलोकन हैं, जो मैंने स्वयं लिखे हैं।",
  },
  errDeclare: { en: "Please confirm the declaration to continue.", hi: "आगे बढ़ने के लिए कृपया घोषणा की पुष्टि करें।" },
  aboutYourRole: { en: "About you", hi: "आपके बारे में" },
  quickRatings: { en: "Quick observations", hi: "संक्षिप्त अवलोकन" },
  quickRatingsLead: { en: "How often do you see this in your class?", hi: "आप अपनी कक्षा में यह कितनी बार देखते हैं?" },
  inYourWords: { en: "In your words", hi: "आपके शब्दों में" },
  teacherThanks: {
    en: "Thank you for your time. Your observation has been received by PLINTH.",
    hi: "आपके समय के लिए धन्यवाद। आपका अवलोकन PLINTH को प्राप्त हो गया है।",
  },
  linkInvalid: {
    en: "This link is not valid any more. Please ask the parent for a new link.",
    hi: "यह लिंक अब मान्य नहीं है। कृपया अभिभावक से नया लिंक माँगें।",
  },
  alreadyAnswered: {
    en: "These answers have already been received. Thank you.",
    hi: "ये उत्तर पहले ही प्राप्त हो चुके हैं। धन्यवाद।",
  },
} satisfies Record<string, Record<Lang, string>>;

export type Key = keyof typeof D;
export const t = (lang: Lang, key: Key) => D[key][lang];

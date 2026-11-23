/**
 * Safeguarding lexicon v2 — what makes a written answer go to a person instead of the engine.
 *
 * Design rules (they matter more than any single phrase):
 *  1. Over-flag, never under-flag. A false alarm costs the reviewer a minute; a miss can cost a child far more.
 *     Context (negation, someone else, a story, the past) is attached as a tag for the reviewer — it never
 *     suppresses a match.
 *  2. Severity is about what a person must do, not about how alarming the words are:
 *       urgent  — possible current risk of harm to the child (self-harm or suicidal thinking, abuse, neglect,
 *                 exploitation, forced marriage). Same-day action.
 *       concern — distress, bullying, fear of going home, substance use. Act within 48 hours.
 *  3. Every portal language. English, Hinglish (Roman-script Hindi), Hindi, and native-script stems for Bengali,
 *     Marathi, Telugu, Tamil, Gujarati, Urdu, Kannada, Odia and Malayalam — all scanned on every answer, because a
 *     child may write in any language whatever the interface is set to. Matched after normalisation (case, nuktas,
 *     chandrabindu, zero-width joiners, Urdu letter variants and diacritics, Malayalam chillu forms, repeated
 *     letters, common digit-for-letter swaps). The nine native lists are a starter set written for review by
 *     native-speaking safeguarding staff; reviewers extend any language from Admin → Safeguarding.
 *  4. Reviewers extend it. Custom phrases and concern-level exceptions are added in Admin → Safeguarding without
 *     a deploy; every outcome is recorded so false alarms and misses can be counted.
 *
 * This is a detection aid for a human reviewer, not a screening instrument and not a risk score.
 */

export type Severity = "urgent" | "concern";
export type Category =
  | "self_harm"
  | "sexual_abuse"
  | "physical_abuse"
  | "emotional_abuse"
  | "neglect"
  | "exploitation"
  | "bullying"
  | "fear_of_home"
  | "substance"
  | "distress"
  | "custom";

export const CATEGORY_LABEL: Record<Category, string> = {
  self_harm: "Self-harm or suicidal thinking",
  sexual_abuse: "Sexual abuse or exploitation",
  physical_abuse: "Physical harm by another person",
  emotional_abuse: "Threats, confinement or humiliation",
  neglect: "Neglect (food, care, being left alone)",
  exploitation: "Child labour, trafficking or forced marriage",
  bullying: "Bullying, ragging or online harassment",
  fear_of_home: "Fear of going home or running away",
  substance: "Alcohol or drug use",
  distress: "Hopelessness or acute distress",
  custom: "Reviewer-added phrase",
};

export const CATEGORY_SEVERITY: Record<Exclude<Category, "custom">, Severity> = {
  self_harm: "urgent",
  sexual_abuse: "urgent",
  physical_abuse: "concern", // escalates to urgent when an adult, a family member or repetition is named
  emotional_abuse: "concern", // escalates the same way
  neglect: "urgent",
  exploitation: "urgent",
  bullying: "concern",
  fear_of_home: "concern",
  substance: "concern",
  distress: "concern",
};

/** Roman-script patterns run on normalised lower-case text with word boundaries. */
const ROMAN: Record<Exclude<Category, "custom">, RegExp[]> = {
  self_harm: [
    /\bsuicid/, /\bkill(?:ing)? (?:my ?self|me ?self)\b/, /\bend(?:ing)? (?:my life|it all|my self|myself|everything)\b/, /\btake my (?:own )?life\b/,
    /\b(?:want|wants|wanted|wish|wishes|going|planning) to die\b/, /\bwanna die\b/, /\bready to die\b/, /\bnot (?:be|being) (?:here|around|alive) any ?more\b/, /\b(?:disappear|vanish) (?:forever|for good|and never come back)\b/, /\b(?:sleep|go to sleep) and never wake up\b/, /\bif i (?:was|were|am) (?:gone|dead|not here)\b/, /\bno point (?:in )?(?:living|being alive|anything|going on)\b/, /\bend my pain\b/, /\bwish i (?:was|were|had been) (?:dead|never born)\b/, /\bbetter off (?:dead|without me)\b/,
    /\bno (?:reason|point) (?:to|in) (?:live|living)\b/, /\b(?:don'?t|do not|dont) want to (?:live|be alive|exist|wake up)\b/,
    /\b(?:cut|cutting|cuts|hurt|hurting|harm|harming|burn|burning|punish|punishing|starve|starving) (?:my ?self|myself)\b/, /\bself[- ]?harm/,
    /\boverdos/, /\bjump (?:off|from) (?:the |a )?(?:roof|terrace|building|bridge|balcony)\b/, /\bhang (?:my ?self|myself)\b/, /\bslit\b/,
    /\b(?:mar|marna|marne|mar ?ja(?:na|unga|ungi|oon|un)) (?:chah?t[aei]|hai|hoon|hu|du|dunga|dungi)\b/, /\bmar ?ja(?:unga|ungi|un|oon)\b/,
    /\bkhud ?kushi\b/, /\bjaan de (?:du|dunga|dungi|doon)\b/, /\bjeena nahi?\b/, /\bjeene ka (?:koi )?(?:matlab|fayda) nahi?\b/, /\bhamesha ke liye so ja/, /\bgayab ho ja(?:un|oon|unga|ungi)\b/, /\bjine ka man nahi?\b/, /\bnas kaat/, /\b(?:zeher|zehar|jahar) kha/,
    /\b(?:phansi|fansi|faasi) laga/, /\bkhud ko (?:khatam|nuksan|nuksaan|chot)\b/,
  ],
  sexual_abuse: [
    /\b(?:touch|touches|touched|touching) (?:me )?(?:in|on|at)? ?(?:my )?(?:private|privates|chest|breast|between|down there|body)\b/,
    /\b(?:touch|touches|touched|touching) me (?:in a |in the )?(?:wrong|bad|inappropriate|weird|dirty) ?(?:way|place|places)?\b/, /\bbad touch\b/, /\b(?:touch|touches|touched|touching) me (?:when|while|at night|alone|and)\b/,
    /\binappropriate(?:ly)? touch/, /\bprivate parts?\b/, /\bmakes? me (?:undress|take off my clothes|touch (?:him|her|them))\b/, /\brape/, /\bmolest/,
    /\bsexual(?:ly)? (?:abus|assault|harass|touch)/, /\b(?:nude|naked|private) (?:photo|photos|pic|pics|picture|pictures|video|videos)\b/,
    /\bsends? me (?:nude|naked|dirty|sexual)/, /\basked (?:me )?for (?:nude|naked|private) /, /\bgroom(?:s|ed|ing) me\b/,
    /\bgalat (?:jagah|tarike se|tareeke se) (?:chhu|chhoo|chu|touch)/, /\bgandi (?:baat|harkat|harkate|cheez)\b/, /\bkapde (?:utar|utaar)/,
  ],
  physical_abuse: [
    /\b(?:hits|slaps|kicks|punches|burns|whips|chokes|strangles|thrashes) me\b/, /\bbeats me\b(?! (?:at|in|to|by)\b)/,
    /\b(?:hit|slapped|kicked|punched|burned|burnt|whipped|choked|thrashed) me\b/, /\bbeat me\b(?! (?:at|in|to|by)\b)/,
    /\b(?:beats|beat|hits|hit) me (?:up|badly|hard|with)\b/, /\b(?:belt|stick|rod|wire|chappal|slipper)s? (?:on|to beat|to hit) me\b/,
    /\bmarks on my (?:body|back|arm|arms|legs?)\b/,
    /\b(?:maar|mar)t[ei] (?:hai|hain|he|thi|the)\b/, /\bmujhe (?:maar|maarte|marte|peet|peet?te|pit(?:a|ai))/, /\bpitai\b/, /\b(?:jala|jalaa) (?:dete|deta|deti)\b/,
  ],
  emotional_abuse: [
    /\bthreaten(?:s|ed|ing)? (?:me|to)\b/, /\b(?:says|said|told me|tells me) (?:to )?(?:don'?t|not to|never to|never) tell\b/, /\bour (?:little )?secret\b/, /\bkisi ko mat (?:batana|bolna)\b/, /\blocks? me (?:in|up|out|inside)\b/, /\blocked me (?:in|up|out|inside)\b/,
    /\b(?:calls?|called) me (?:worthless|useless|a burden|a mistake|a curse)\b/, /\bdhamki/, /\bdarate (?:hai|hain)\b/, /\bband kar (?:dete|deta|deti)\b/,
  ],
  neglect: [
    /\b(?:no|not given|don'?t get|dont get|didn'?t get|without) (?:food|meals|dinner|lunch)\b/, /\b(?:go|goes|went|going) (?:to bed |to sleep |to school )?hungry\b/, /\b(?:don'?t|dont|do not|doesn'?t|never|won'?t) give me (?:food|meals|anything to eat)\b/, /\bstarv(?:e|ed|ing)\b/,
    /\bleft (?:alone|home alone|by myself) (?:for days|overnight|at night|all night|for a week)\b/, /\bnobody (?:feeds|looks after|takes care of) me\b/,
    /\bkhana nahi? (?:dete|deta|deti|milta)\b/, /\bbhukha (?:rakhte|rakhta|rakhti)\b/,
  ],
  exploitation: [
    /\b(?:made|make|makes|forced|forcing|force|forces) (?:me )?(?:to )?work\b(?! (?:hard|harder|on my|on the|out))/, /\bchild labou?r\b/, /\bforced (?:to )?marr/, /\b(?:get|getting) me married\b/,
    /\bmarry me off\b/, /\bmy (?:marriage|engagement|rishta) (?:is )?(?:fixed|being fixed|arranged)\b/, /\bsold me\b/, /\btraffick/,
    /\bshaadi (?:karwa|karva|kara) (?:rahe|denge|di)/, /\brishta (?:pakka|tay)\b/, /\bkaam (?:karwate|karvate|karwata) (?:hai|hain)\b/,
  ],
  bullying: [
    /\bbull(?:y|ies|ied|ying) me\b/, /\bi (?:am|get|got|was) bullied\b/, /\bragging\b/, /\bblackmail/, /\bmorph(?:ed|ing)? (?:my )?(?:photo|pic|picture)/,
    /\b(?:everyone|everybody|they all|all of them) (?:hates?|laughs? at|makes? fun of|ignores?) me\b/, /\bcyber ?bull/,
    /\bthey (?:push|pushed|hit|beat|kick|kicked) me\b/,
  ],
  fear_of_home: [
    /\b(?:scared|afraid|frightened|terrified) (?:to go|of going|to be|of being) (?:back )?home\b/, /\b(?:don'?t|do not|dont) want to go (?:back )?home\b/,
    /\brun(?:ning)? away from home\b/, /\bwant to run away\b/, /\bghar (?:se bhaag|nahi? jaana|jaane se dar)/,
  ],
  substance: [
    /\b(?:drink|drinking|drank|drunk) (?:alcohol|daaru|daru|beer|whisky|liquor)\b/, /\b(?:smoke|smoking) (?:ganja|weed|charas|joints?)\b/,
    /\b(?:take|taking|took|do|doing) drugs\b/, /\bget(?:ting)? high\b(?! (?:marks|score|scores|grades|rank|percentage|numbers|in))/, /\bnasha\b/, /\b(?:ganja|charas|smack|brown sugar|whitener)\b/,
  ],
  distress: [
    /\bno ?(?:one|body) (?:cares|would care|would miss me|loves me|understands me)\b/, /\bhate my life\b/,
    /\bcan'?t (?:take|bear|handle) (?:it|this|anything) any ?more\b/, /\bhopeless\b/, /\bi(?: am|'m) (?:a burden|worthless|useless|nothing)\b/,
    /\b(?:everything|life) is pointless\b/, /\bi feel (?:empty|numb|trapped) all the time\b/, /\bkoi (?:parwah|parwa|parvah|care) nahi?\b/,
    /\bsab khatam\b/, /\bthak gaya hoon jeene se\b/,
  ],
};

/** Devanagari stems, matched as substrings on normalised text (word boundaries do not apply to Devanagari). */
const DEVANAGARI: Record<Exclude<Category, "custom">, string[]> = {
  self_harm: [
    "आत्महत्या", "खुदकुशी", "ख़ुदकुशी", "मर जाना चाह", "मरना चाह", "मर जाऊं", "मर जाऊँ", "मर जाउंगा", "मर जाऊंगा", "मर जाऊंगी", "जीना नहीं चाह",
    "जीने का मन नहीं", "जान दे दूं", "जान दे दूँ", "जान दे दूंगा", "जान दे दूंगी", "खुद को चोट", "खुद को नुकसान", "खुद को खत्म", "अपने आप को खत्म",
    "नस काट", "जहर खा", "फांसी लगा", "फाँसी लगा", "छत से कूद", "हमेशा के लिए सो जा", "गायब हो जाऊं", "गायब हो जाऊँ", "मेरे बिना सब खुश", "जीने का कोई मतलब नहीं",
  ],
  sexual_abuse: [
    "गलत तरीके से छू", "गलत जगह छू", "गंदी बात", "गंदी हरकत", "गंदे तरीके से", "कपड़े उतार", "कपडे उतार", "प्राइवेट पार्ट", "गुप्तांग", "बलात्कार",
    "यौन", "छेड़छाड़", "छेडछाड",
  ],
  physical_abuse: ["मुझे मारत", "मुझे मारते", "मुझे रोज मार", "मुझे बहुत मार", "मुझे पीटत", "मुझे पीटते", "पिटाई करत", "मारते हैं", "मारता है", "मारती है", "पीटते हैं", "जला देत", "बेल्ट से मार", "डंडे से मार"],
  emotional_abuse: ["किसी को मत बताना", "किसी को मत बोलना", "धमकी", "डराते हैं", "डराता है", "बंद कर देत", "कमरे में बंद"],
  neglect: ["खाना नहीं देत", "भूखा रखत", "भूखे रखत", "भूखा सोना", "भूखे सोना", "अकेला छोड़ देत", "अकेले छोड़ देत"],
  exploitation: ["काम करवाते", "मजदूरी करवा", "शादी करवा रहे", "शादी तय कर", "रिश्ता पक्का", "बेच दिया", "बाल विवाह"],
  bullying: ["रैगिंग", "ब्लैकमेल", "सब मेरा मज़ाक", "सब मेरा मजाक", "मुझे तंग करत", "परेशान करते हैं", "मोर्फ"],
  fear_of_home: ["घर से भाग", "घर नहीं जाना", "घर जाने से डर", "घर पर डर लगता"],
  substance: ["शराब पी", "नशा कर", "गांजा", "चरस", "ड्रग्स"],
  distress: ["कोई परवाह नहीं", "कोई प्यार नहीं करता", "किसी को फर्क नहीं", "जिंदगी से नफरत", "ज़िंदगी से नफ़रत", "सब खत्म", "जीने से थक", "बोझ हूं", "बोझ हूँ", "मैं बेकार हूं", "मैं बेकार हूँ"],
};

/** Native-script stems for the other nine portal languages. Substring match on normalised text, like Devanagari. */
type NativeLang = "bn" | "mr" | "te" | "ta" | "gu" | "ur" | "kn" | "or" | "ml";
const NATIVE: Record<NativeLang, Partial<Record<Exclude<Category, "custom">, string[]>>> = {
  bn: {
    self_harm: ["আত্মহত্যা", "মরে যেতে চাই", "মরতে চাই", "মরে যাব", "বাঁচতে চাই না", "বেঁচে থাকতে চাই না", "নিজেকে শেষ করে", "নিজেকে আঘাত", "নিজের ক্ষতি", "হাত কাট", "বিষ খা", "গলায় দড়ি", "আমি না থাকলে সবাই ভালো", "বেঁচে থাকার মানে নেই"],
    sexual_abuse: ["খারাপ ভাবে ছোঁ", "খারাপভাবে ছোঁ", "খারাপভাবে ছুঁ", "গোপন জায়গায়", "খারাপ জায়গায় হাত", "জামা খুল", "কাপড় খুল", "নোংরা কথা", "নোংরা ছবি", "ধর্ষণ", "যৌন", "শ্লীলতাহানি"],
    physical_abuse: ["আমাকে মারে", "আমাকে মারেন", "আমায় মারে", "আমাকে রোজ মারে", "আমাকে খুব মারে", "আমাকে মারধর", "আমাকে পেটা", "বেল্ট দিয়ে মার", "লাঠি দিয়ে মার", "ছ্যাঁকা দে", "মারধর করে"],
    emotional_abuse: ["কাউকে বলবে না", "কাউকে বলিস না", "কাউকে বলবি না", "ভয় দেখায়", "হুমকি", "ঘরে আটকে", "ঘরে বন্ধ করে"],
    neglect: ["খেতে দেয় না", "খেতে দেন না", "না খেয়ে থাক", "খালি পেটে ঘুম", "একা ফেলে রাখ", "একা রেখে চলে যায়"],
    exploitation: ["কাজ করায়", "মজুরি খাট", "বিয়ে ঠিক করে", "বিয়ে দিয়ে দেবে", "বাল্যবিবাহ", "বিক্রি করে দি"],
    bullying: ["র‍্যাগিং", "ব্ল্যাকমেল", "সবাই আমাকে নিয়ে হাসে", "আমাকে খেপায়", "আমাকে উত্যক্ত", "আমাকে বিরক্ত করে"],
    fear_of_home: ["বাড়ি থেকে পালা", "বাড়ি যেতে চাই না", "বাড়ি যেতে ভয়", "বাড়িতে ভয় লাগে"],
    substance: ["মদ খা", "নেশা কর", "গাঁজা", "ড্রাগস", "মাদক"],
    distress: ["কেউ আমাকে ভালোবাসে না", "কারো কিছু যায় আসে না", "জীবনটা অসহ্য", "আমি বোঝা", "আমি অপদার্থ", "বেঁচে থেকে ক্লান্ত"],
  },
  mr: {
    self_harm: ["आत्महत्या", "मरावंसं वाटत", "मरावेसे वाटत", "मरून जावं", "मरून जाईन", "जगायचं नाही", "जगायचे नाही", "जगावंसं वाटत नाही", "स्वतःला संपव", "स्वतःला इजा", "स्वतःला दुखाप", "गळफास", "वरून उडी मार", "माझ्याशिवाय सगळे सुखी"],
    sexual_abuse: ["चुकीच्या पद्धतीने स्पर्श", "चुकीच्या ठिकाणी स्पर्श", "वाईट स्पर्श", "कपडे काढ", "घाणेरडे बोल", "घाणेरडे फोटो", "लैंगिक", "विनयभंग"],
    physical_abuse: ["मला मारतात", "मला मारतो", "मला मारते", "मला रोज मार", "मला खूप मार", "मला बडवतात", "पट्ट्याने मार", "काठीने मार", "चटके देत"],
    emotional_abuse: ["कोणाला सांगू नकोस", "कोणालाही सांगू नको", "धमकावत", "खोलीत कोंड", "डांबून ठेव"],
    neglect: ["जेवायला देत नाहीत", "जेवायला देत नाही", "उपाशी ठेव", "उपाशी झोप", "एकटं सोडून जात", "एकटे सोडून जात"],
    exploitation: ["काम करायला लावतात", "मजुरी करायला", "लग्न ठरवलं", "लग्न लावून देणार", "बालविवाह", "विकून टाक"],
    bullying: ["रॅगिंग", "ब्लॅकमेल", "सगळे माझी चेष्टा", "मला चिडवतात", "माझी टिंगल"],
    fear_of_home: ["घरातून पळून", "घरी जायचं नाही", "घरी जायला भीती", "घरी भीती वाटते"],
    substance: ["दारू पि", "नशा कर", "ड्रग्ज"],
    distress: ["कोणालाच माझी पर्वा नाही", "कोणी प्रेम करत नाही", "आयुष्याचा कंटाळा", "आयुष्य नकोसं", "मी ओझं आहे", "मी नालायक"],
  },
  te: {
    self_harm: ["ఆత్మహత్య", "చనిపోవాలని", "చచ్చిపోవాలని", "చచ్చిపోతాను", "చనిపోతాను", "బతకాలని లేదు", "బ్రతకాలని లేదు", "నన్ను నేను చంపుకో", "నన్ను నేను గాయపరచుకో", "చేయి కోసుకో", "విషం తాగ", "ఉరి వేసుకో", "నేను లేకపోతే అందరూ సంతోషంగా"],
    sexual_abuse: ["తప్పుగా తాక", "తప్పుడు చోట తాక", "చెడుగా తాక", "బట్టలు విప్ప", "బూతు మాటలు", "అసభ్య", "అత్యాచారం", "లైంగిక"],
    physical_abuse: ["నన్ను కొడతా", "నన్ను కొడుతు", "నన్ను కొడతారు", "బెల్టుతో కొ", "కర్రతో కొ", "వాతలు పెడ", "చితకబాద"],
    emotional_abuse: ["ఎవరికీ చెప్పకు", "ఎవరికీ చెప్పొద్దు", "బెదిరిస్త", "బెదిరింపు", "గదిలో బంధి", "గదిలో పెట్టి తాళం"],
    neglect: ["తిండి పెట్టరు", "అన్నం పెట్టరు", "ఆకలితో పడుకో", "పస్తులు", "ఒంటరిగా వదిలేస్త"],
    exploitation: ["పని చేయిస్త", "కూలి పని", "పెళ్లి చేసేస్త", "పెళ్లి నిశ్చయం", "బాల్య వివాహం", "అమ్మేశ"],
    bullying: ["ర్యాగింగ్", "బ్లాక్‌మెయిల్", "అందరూ నన్ను ఎగతాళి", "నన్ను ఏడిపిస్త", "నన్ను వేధిస్త"],
    fear_of_home: ["ఇంటి నుంచి పారిపో", "ఇంటికి వెళ్లాలని లేదు", "ఇంటికి వెళ్ళాలంటే భయం", "ఇంట్లో భయంగా"],
    substance: ["మద్యం తాగ", "గంజాయి", "డ్రగ్స్", "మత్తు పదార్థ"],
    distress: ["నన్ను ఎవరూ పట్టించుకోరు", "నన్ను ఎవరూ ప్రేమించరు", "జీవితం మీద విరక్తి", "అంతా అయిపోయింది", "నేను భారం", "నేను పనికిరాని"],
  },
  ta: {
    self_harm: ["தற்கொலை", "சாக வேண்டும்", "செத்துவிட", "சாகப் போகிறேன்", "வாழ விருப்பமில்லை", "வாழப் பிடிக்கவில்லை", "என்னை நானே காயப்படுத்", "என்னை நானே முடித்து", "கையை அறுத்து", "விஷம் குடி", "தூக்கு போட", "நான் இல்லாவிட்டால் எல்லோரும் மகிழ்ச்சி"],
    sexual_abuse: ["தவறாகத் தொட", "தவறாக தொட", "தவறான இடத்தில் தொட", "கெட்ட தொடுதல்", "ஆடையைக் கழற்ற", "உடையைக் கழற்ற", "ஆபாச", "பாலியல்", "கற்பழிப்பு"],
    physical_abuse: ["என்னை அடிக்கிறா", "என்னை அடிப்பா", "பெல்டால் அடி", "கம்பால் அடி", "சூடு வை", "அடித்து உதை"],
    emotional_abuse: ["யாரிடமும் சொல்லாதே", "யாரிடமும் சொல்லக்கூடாது", "மிரட்டு", "அறையில் பூட்டி"],
    neglect: ["சாப்பாடு கொடுப்பதில்லை", "சாப்பாடு தருவதில்லை", "பட்டினி", "பசியோடு தூங்", "தனியாக விட்டுவிட்டு"],
    exploitation: ["வேலை செய்ய வைக்", "கூலி வேலை", "கல்யாணம் செய்து வைக்க", "திருமணம் நிச்சயம்", "குழந்தைத் திருமணம்", "விற்றுவிட"],
    bullying: ["ராகிங்", "பிளாக்மெயில்", "என்னைக் கேலி", "என்னை கேலி", "என்னைக் கிண்டல்", "என்னை கிண்டல்", "என்னைத் தொல்லை"],
    fear_of_home: ["வீட்டை விட்டு ஓட", "வீட்டுக்குப் போக விருப்பமில்லை", "வீட்டுக்குப் போகப் பயம்", "வீட்டில் பயமா"],
    substance: ["மது குடி", "சாராயம்", "கஞ்சா", "போதை"],
    distress: ["யாரும் என்னைக் கவனிப்பதில்லை", "யாரும் என்னை நேசிப்பதில்லை", "வாழ்க்கை வெறுத்து", "எல்லாம் முடிந்துவிட்டது", "நான் ஒரு சுமை", "நான் உதவாக்கரை"],
  },
  gu: {
    self_harm: ["આત્મહત્યા", "મરી જવું છે", "મરી જવાનું મન", "મરી જઈશ", "જીવવું નથી", "જીવવાનું મન નથી", "પોતાને ખતમ", "પોતાને નુકસાન", "પોતાને ઈજા", "હાથ કાપ", "ઝેર પી", "ફાંસો ખા", "મારા વગર બધા ખુશ"],
    sexual_abuse: ["ખોટી રીતે અડ", "ખોટી જગ્યાએ અડ", "ખરાબ સ્પર્શ", "કપડાં ઉતાર", "ગંદી વાત", "ગંદા ફોટા", "બળાત્કાર", "જાતીય", "છેડતી"],
    physical_abuse: ["મને મારે", "મને રોજ માર", "મને બહુ માર", "મને ફટકાર", "પટ્ટાથી માર", "લાકડીથી માર", "ડામ દે"],
    emotional_abuse: ["કોઈને કહેતો નહીં", "કોઈને કહેતી નહીં", "કોઈને કહેવાનું નહીં", "ધમકી", "ધમકાવ", "રૂમમાં પૂરી"],
    neglect: ["ખાવાનું નથી આપતા", "જમવાનું નથી આપતા", "ભૂખ્યો રાખ", "ભૂખી રાખ", "ભૂખ્યા સૂ", "એકલો છોડી", "એકલી છોડી"],
    exploitation: ["કામ કરાવે છે", "મજૂરી કરાવ", "લગ્ન નક્કી કર", "લગ્ન કરાવી દેવાના", "બાળલગ્ન", "વેચી દી"],
    bullying: ["રેગિંગ", "બ્લેકમેલ", "બધા મારી મજાક", "મને ચીડવે", "મને હેરાન કરે"],
    fear_of_home: ["ઘરેથી ભાગી", "ઘરે નથી જવું", "ઘરે જવાનો ડર", "ઘરે ડર લાગે"],
    substance: ["દારૂ પી", "નશો કર", "ગાંજો", "ડ્રગ્સ"],
    distress: ["કોઈને મારી પરવા નથી", "કોઈ મને પ્રેમ નથી કરતું", "જિંદગીથી કંટાળ", "હું બોજ છું", "હું નકામો", "હું નકામી"],
  },
  ur: {
    self_harm: ["خودکشی", "خود کشی", "مر جانا چاہتا", "مر جانا چاہتی", "مرنا چاہتا", "مرنا چاہتی", "مر جاؤں", "جینا نہیں چاہتا", "جینا نہیں چاہتی", "جینے کا دل نہیں", "خود کو ختم", "خود کو نقصان", "خود کو چوٹ", "کلائی کاٹ", "نس کاٹ", "زہر کھا", "پھندا", "میرے بغیر سب خوش"],
    sexual_abuse: ["غلط طریقے سے چھو", "غلط جگہ چھو", "گندی بات", "گندی حرکت", "کپڑے اتار", "جنسی زیادتی", "عصمت دری", "جنسی", "چھیڑ چھاڑ"],
    physical_abuse: ["مجھے مارتے", "مجھے مارتا", "مجھے مارتی", "مجھے روز مار", "مجھے بہت مار", "مجھے پیٹتے", "بیلٹ سے مار", "ڈنڈے سے مار", "جلا دیت"],
    emotional_abuse: ["کسی کو مت بتانا", "کسی کو نہ بتانا", "دھمکی", "ڈراتے ہیں", "کمرے میں بند"],
    neglect: ["کھانا نہیں دیت", "بھوکا رکھ", "بھوکی رکھ", "بھوکا سونا", "بھوکے سونا", "اکیلا چھوڑ", "اکیلی چھوڑ"],
    exploitation: ["کام کرواتے", "مزدوری کروا", "شادی کروا رہے", "شادی طے کر", "کم عمری کی شادی", "بیچ دیا"],
    bullying: ["ریگنگ", "بلیک میل", "سب میرا مذاق", "مجھے تنگ کرت", "پریشان کرتے ہیں"],
    fear_of_home: ["گھر سے بھاگ", "گھر نہیں جانا", "گھر جانے سے ڈر", "گھر پر ڈر لگتا"],
    substance: ["شراب پی", "نشہ کر", "چرس", "گانجا", "ڈرگز"],
    distress: ["کسی کو پروا نہیں", "کوئی پیار نہیں کرتا", "زندگی سے نفرت", "میں بوجھ ہوں", "میں بیکار ہوں"],
  },
  kn: {
    self_harm: ["ಆತ್ಮಹತ್ಯೆ", "ಸಾಯಬೇಕು", "ಸಾಯಬೇಕೆನಿಸ", "ಸತ್ತುಹೋಗ", "ಸಾಯುತ್ತೇನೆ", "ಬದುಕಲು ಇಷ್ಟವಿಲ್ಲ", "ಬದುಕಬೇಕೆನಿಸುವುದಿಲ್ಲ", "ನನ್ನನ್ನು ನಾನೇ ಕೊಲ್ಲ", "ನನ್ನನ್ನು ನಾನೇ ಗಾಯ", "ಕೈ ಕೊಯ್ದು", "ವಿಷ ಕುಡಿ", "ನೇಣು ಹಾಕಿ", "ನಾನಿಲ್ಲದಿದ್ದರೆ ಎಲ್ಲರೂ ಖುಷಿ"],
    sexual_abuse: ["ತಪ್ಪಾಗಿ ಮುಟ್ಟ", "ತಪ್ಪು ಜಾಗದಲ್ಲಿ ಮುಟ್ಟ", "ಕೆಟ್ಟ ಸ್ಪರ್ಶ", "ಬಟ್ಟೆ ಬಿಚ್ಚ", "ಅಶ್ಲೀಲ", "ಅತ್ಯಾಚಾರ", "ಲೈಂಗಿಕ"],
    physical_abuse: ["ನನಗೆ ಹೊಡೆಯುತ್ತಾ", "ನನ್ನನ್ನು ಹೊಡೆ", "ಬೆಲ್ಟ್‌ನಿಂದ ಹೊಡೆ", "ಕೋಲಿನಿಂದ ಹೊಡೆ", "ಬರೆ ಹಾಕ"],
    emotional_abuse: ["ಯಾರಿಗೂ ಹೇಳಬೇಡ", "ಬೆದರಿಕೆ", "ಬೆದರಿಸು", "ಕೋಣೆಯಲ್ಲಿ ಕೂಡಿಹಾಕ"],
    neglect: ["ಊಟ ಕೊಡುವುದಿಲ್ಲ", "ಊಟ ಕೊಡಲ್ಲ", "ಉಪವಾಸ ಇಡ", "ಹಸಿವಿನಿಂದ ಮಲಗ", "ಒಂಟಿಯಾಗಿ ಬಿಟ್ಟು ಹೋಗ"],
    exploitation: ["ಕೆಲಸ ಮಾಡಿಸುತ್ತಾರೆ", "ಕೂಲಿ ಕೆಲಸ", "ಮದುವೆ ಮಾಡಿಸ", "ಮದುವೆ ನಿಶ್ಚಯ", "ಬಾಲ್ಯ ವಿವಾಹ", "ಮಾರಿಬಿಟ್ಟ"],
    bullying: ["ರ‍್ಯಾಗಿಂಗ್", "ಬ್ಲ್ಯಾಕ್‌ಮೇಲ್", "ಎಲ್ಲರೂ ನನ್ನನ್ನು ಗೇಲಿ", "ನನ್ನನ್ನು ರೇಗಿಸ", "ನನಗೆ ಕಿರುಕುಳ"],
    fear_of_home: ["ಮನೆಯಿಂದ ಓಡಿಹೋಗ", "ಮನೆಗೆ ಹೋಗಲು ಇಷ್ಟವಿಲ್ಲ", "ಮನೆಗೆ ಹೋಗಲು ಭಯ", "ಮನೆಯಲ್ಲಿ ಭಯ"],
    substance: ["ಮದ್ಯ ಕುಡಿ", "ಸಾರಾಯಿ", "ಗಾಂಜಾ", "ಡ್ರಗ್ಸ್", "ಅಮಲು"],
    distress: ["ಯಾರೂ ನನ್ನನ್ನು ಕೇರ್", "ಯಾರೂ ನನ್ನನ್ನು ಪ್ರೀತಿಸುವುದಿಲ್ಲ", "ಜೀವನವೇ ಬೇಸರ", "ಎಲ್ಲಾ ಮುಗಿದುಹೋಯಿತು", "ನಾನು ಹೊರೆ", "ನಾನು ಪ್ರಯೋಜನವಿಲ್ಲ"],
  },
  or: {
    self_harm: ["ଆତ୍ମହତ୍ୟା", "ମରିଯିବାକୁ ଚାହେଁ", "ମରିବାକୁ ଚାହେଁ", "ମରିଯିବି", "ବଞ୍ଚିବାକୁ ଚାହୁଁନାହିଁ", "ବଞ୍ଚିବାକୁ ଇଚ୍ଛା ନାହିଁ", "ନିଜକୁ ଶେଷ କରି", "ନିଜକୁ ଆଘାତ", "ନିଜର କ୍ଷତି", "ହାତ କାଟି", "ବିଷ ଖାଇ", "ଫାଶୀ", "ମୁଁ ନଥିଲେ ସମସ୍ତେ ଖୁସି"],
    sexual_abuse: ["ଖରାପ ଭାବେ ଛୁଇଁ", "ଭୁଲ ଜାଗାରେ ଛୁଇଁ", "ଖରାପ ସ୍ପର୍ଶ", "ପୋଷାକ ଖୋଲ", "ଲୁଗା ଖୋଲ", "ଅଶ୍ଳୀଳ", "ବଳାତ୍କାର", "ଯୌନ"],
    physical_abuse: ["ମୋତେ ମାରନ୍ତି", "ମୋତେ ମାରେ", "ମୋତେ ରୋଜ ମାର", "ମୋତେ ବହୁତ ମାର", "ମୋତେ ପିଟନ୍ତି", "ବେଲ୍ଟରେ ମାର", "ବାଡ଼ିରେ ମାର", "ଛେଙ୍କା ଦିଅ"],
    emotional_abuse: ["କାହାକୁ କହିବୁ ନାହିଁ", "କାହାକୁ କହିବ ନାହିଁ", "ଧମକ", "ଡରାନ୍ତି", "ଘରେ ବନ୍ଦ କରି"],
    neglect: ["ଖାଇବାକୁ ଦିଅନ୍ତି ନାହିଁ", "ଭୋକିଲା ରଖ", "ଭୋକରେ ଶୋଇ", "ଏକୁଟିଆ ଛାଡ଼ି ଚାଲିଯାଆନ୍ତି"],
    exploitation: ["କାମ କରାନ୍ତି", "ମଜୁରି କରା", "ବାହାଘର ଠିକ୍ କରି", "ବାହା ଦେଇଦେବେ", "ବାଲ୍ୟ ବିବାହ", "ବିକି ଦେଲେ"],
    bullying: ["ର‍୍ୟାଗିଂ", "ବ୍ଲାକମେଲ", "ସମସ୍ତେ ମୋତେ ପରିହାସ", "ମୋତେ ଚିଡ଼ାନ୍ତି", "ମୋତେ ହଇରାଣ"],
    fear_of_home: ["ଘରୁ ପଳାଇ", "ଘରକୁ ଯିବାକୁ ଚାହୁଁନାହିଁ", "ଘରକୁ ଯିବାକୁ ଡର", "ଘରେ ଡର ଲାଗେ"],
    substance: ["ମଦ ପି", "ନିଶା କର", "ଗଞ୍ଜେଇ", "ଡ୍ରଗ୍ସ"],
    distress: ["ମୋ ପାଇଁ କାହାର ଚିନ୍ତା ନାହିଁ", "ମୋତେ କେହି ଭଲ ପାଆନ୍ତି ନାହିଁ", "ଜୀବନ ପ୍ରତି ଘୃଣା", "ମୁଁ ବୋଝ", "ମୁଁ ଅକାମୀ"],
  },
  ml: {
    self_harm: ["ആത്മഹത്യ", "മരിക്കണം", "മരിക്കാൻ തോന്നു", "ചത്തുപോക", "ചാകണം", "ജീവിക്കാൻ തോന്നുന്നില്ല", "ജീവിക്കണ്ട", "സ്വയം മുറിവേൽപ്പി", "സ്വയം അവസാനിപ്പി", "കൈ മുറിച്ച", "വിഷം കഴിച്ച", "തൂങ്ങിമരി", "ഞാനില്ലെങ്കിൽ എല്ലാവർക്കും സന്തോഷം"],
    sexual_abuse: ["മോശമായി തൊട", "തെറ്റായ സ്ഥലത്ത് തൊട", "മോശം സ്പർശ", "വസ്ത്രം അഴിച്ച", "വസ്ത്രം അഴിക്ക", "അശ്ലീല", "ബലാത്സംഗ", "ലൈംഗിക", "പീഡന"],
    physical_abuse: ["എന്നെ അടിക്കു", "എന്നെ തല്ലു", "ബെൽറ്റ് കൊണ്ട് അടി", "വടി കൊണ്ട് അടി", "പൊള്ളിക്ക"],
    emotional_abuse: ["ആരോടും പറയരുത്", "ഭീഷണി", "പേടിപ്പിക്കു", "മുറിയിൽ പൂട്ടി"],
    neglect: ["ഭക്ഷണം തരില്ല", "ഭക്ഷണം തരുന്നില്ല", "പട്ടിണി", "വിശന്ന് ഉറങ്ങ", "ഒറ്റയ്ക്ക് വിട്ടിട്ട് പോക"],
    exploitation: ["ജോലി ചെയ്യിക്കു", "കൂലിപ്പണി", "കല്യാണം കഴിപ്പിക്ക", "കല്യാണം ഉറപ്പിച്ച", "ശൈശവ വിവാഹ", "എന്നെ വിറ്റു"],
    bullying: ["റാഗിംഗ്", "ബ്ലാക്ക്മെയിൽ", "എന്നെ കളിയാക്കു", "എന്നെ ശല്യപ്പെടുത്തു"],
    fear_of_home: ["വീട്ടിൽ നിന്ന് ഓടിപ്പോക", "വീട്ടിൽ പോകണ്ട", "വീട്ടിൽ പോകാൻ പേടി", "വീട്ടിൽ പേടിയാണ്"],
    substance: ["മദ്യം കഴിക്കു", "കള്ള് കുടി", "കഞ്ചാവ്", "ലഹരി", "ഡ്രഗ്സ്"],
    distress: ["ആർക്കും എന്നെ വേണ്ട", "ആരും എന്നെ സ്നേഹിക്കുന്നില്ല", "ജീവിതം മടുത്തു", "ഞാൻ ഒരു ഭാരം", "ഞാൻ ഒന്നിനും കൊള്ളില്ല"],
  },
};

/** Words that name an adult, a carer or repetition in the nine languages — must start a word (so মা does not fire inside আমাকে). */
const ESCALATE_NATIVE = [
  "বাবা", "মাকে", "মায়ের", "কাকা", "মামা", "জেঠু", "শিক্ষক", "স্যার", "ম্যাডাম", "প্রতিবেশী", "রোজ", "প্রতিদিন", "সবসময়",
  "बाबा", "आईने", "आईला", "काका", "शेजारी", "दररोज", "नेहमी", "मॅडम",
  "నాన్న", "అమ్మ", "బాబాయ్", "మామయ్య", "టీచర్", "సార్", "మేడమ్", "పక్కింటి", "రోజూ", "ప్రతిరోజూ", "ఎప్పుడూ",
  "அப்பா", "அம்மா", "சித்தப்பா", "மாமா", "ஆசிரியர்", "சார்", "டீச்சர்", "பக்கத்து வீட்டு", "தினமும்", "எப்போதும்",
  "પપ્પા", "મમ્મી", "પિતા", "માતા", "કાકા", "મામા", "શિક્ષક", "મેડમ", "પાડોશી", "રોજ", "હંમેશા",
  "ابو", "امی", "والد", "چچا", "ماموں", "استاد", "میڈم", "پڑوسی", "ہمیشہ",
  "ಅಪ್ಪ", "ಅಮ್ಮ", "ಚಿಕ್ಕಪ್ಪ", "ಮಾವ", "ಶಿಕ್ಷಕ", "ಸರ್", "ಮೇಡಂ", "ಪಕ್ಕದ ಮನೆ", "ಪ್ರತಿದಿನ", "ಯಾವಾಗಲೂ",
  "ବାପା", "ଦାଦା", "ମାମୁଁ", "ଶିକ୍ଷକ", "ସାର୍", "ମାଡାମ", "ପଡ଼ୋଶୀ", "ପ୍ରତିଦିନ", "ରୋଜ", "ସବୁବେଳେ",
  "അച്ഛൻ", "അമ്മ", "അമ്മാവൻ", "ചിറ്റപ്പൻ", "ടീച്ചർ", "സാർ", "അധ്യാപക", "അയൽ", "എന്നും", "ദിവസവും", "എപ്പോഴും",
];
/** Short words that also begin unrelated words (মা in মারে, आई in आईस्क्रीम, سر in سردی): whole-word match only. */
const ESCALATE_NATIVE_EXACT = ["মা", "आई", "સર", "سر", "روز", "ದಿನಾ", "ମା"];
const STORY_NATIVE = [
  "গল্প", "সিনেমা", "বই", "অধ্যায়", "খবর", "गोष्ट", "चित्रपट", "पुस्तक", "धडा", "बातमी", "కథ", "సినిమా", "పుస్తకం", "పాఠం", "వార్త",
  "கதை", "திரைப்பட", "சினிமா", "புத்தக", "பாடம்", "செய்தி", "વાર્તા", "ફિલ્મ", "પુસ્તક", "પાઠ", "સમાચાર", "کہانی", "فلم", "کتاب", "سبق", "خبر",
  "ಕಥೆ", "ಸಿನಿಮಾ", "ಪುಸ್ತಕ", "ಪಾಠ", "ಸುದ್ದಿ", "ଗପ", "କାହାଣୀ", "ସିନେମା", "ବହି", "ପାଠ", "ଖବର", "കഥ", "സിനിമ", "പുസ്തക", "പാഠ", "വാർത്ത",
];
const OTHER_NATIVE = [
  "বন্ধু", "ভাই", "বোন", "मित्र", "मैत्रीण", "भाऊ", "बहीण", "స్నేహితు", "తమ్ముడు", "చెల్లి", "நண்பன்", "நண்பி", "தோழி", "அண்ணன்", "தம்பி", "தங்கை",
  "મિત્ર", "ભાઈ", "બહેન", "دوست", "بھائی", "بہن", "ಸ್ನೇಹಿತ", "ಅಣ್ಣ", "ತಂಗಿ", "ସାଙ୍ଗ", "ଭାଇ", "ଭଉଣୀ", "കൂട്ടുകാര", "സുഹൃത്ത്", "ചേട്ടൻ", "അനിയൻ", "ചേച്ചി", "അനിയത്തി",
];

/** Physical and emotional harm escalate to urgent when an adult, family member, carer or repetition is named. */
const ESCALATE_CATS = new Set<Category>(["physical_abuse", "emotional_abuse"]);
const ESCALATE =
  /\b(?:papa|pappa|mummy|mumma|mom|mother|dad|daddy|father|uncle|aunty|aunt|step ?(?:father|mother|dad|mom)|teacher|sir|madam|ma'?am|tutor|coach|warden|driver|neighbou?r|parents?|bhaiya|bhaiyya|didi|chacha|mama|mausa|fufa|cousin|every ?day|daily|always|again and again|every night|roz|hamesha)\b|पापा|मम्मी|पिता|माँ|मां|चाचा|मामा|शिक्षक|सर |मैडम|पड़ोसी|पडोसी|रोज|हमेशा/;

const CONTEXT = {
  negated: /\b(?:not|never|no longer|don'?t|do not|didn'?t|did not|wouldn'?t|nahi|nahin|kabhi nahi)\b|नहीं|कभी नहीं/,
  someone_else: /\b(?:my (?:friend|cousin|sister|brother|classmate)|a (?:friend|classmate|girl|boy) in my class|someone (?:i know|in my class)|he|she|they)\b|दोस्त|सहेली|भाई|बहन/,
  story_or_study: /\b(?:story|film|movie|series|show|book|novel|chapter|lesson|project|news|character|poem|drama|play|essay|topic|studied|we (?:learnt|learned|read about))\b|कहानी|फिल्म|किताब|पाठ|समाचार/,
  past: /\b(?:used to|when i was (?:little|small|younger)|last year|years ago|before|earlier|in the past)\b|पहले|बचपन में/,
};

export type CustomTerm = { phrase: string; category: Category; severity: Severity; kind: "match" | "except" };
export type LexiconHit = { category: Category; severity: Severity; phrase: string; tags: string[] };

/** Normalise for matching: lower-case, NFKC, strip nukta / chandrabindu / zero-width, collapse letter runs, undo digit swaps. */
export function normalise(text: string): string {
  let t = text.normalize("NFKC").toLowerCase();
  t = t.replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/[\u093C\u09BC\u0A3C\u0ABC\u0B3C]/g, "").replace(/ँ/g, "ं");
  // Urdu: Arabic letter variants → Urdu forms, strip diacritics and tatweel.
  t = t.replace(/[\u064A\u0649]/g, "\u06CC").replace(/\u0643/g, "\u06A9").replace(/\u0647/g, "\u06C1").replace(/[\u064B-\u065F\u0670\u0640]/g, "");
  // Malayalam: atomic chillu letters → base consonant + virama (the form left after a ZWJ is stripped).
  t = t.replace(/\u0D7A/g, "\u0D23\u0D4D").replace(/\u0D7B/g, "\u0D28\u0D4D").replace(/\u0D7C/g, "\u0D30\u0D4D").replace(/\u0D7D/g, "\u0D32\u0D4D").replace(/\u0D7E/g, "\u0D33\u0D4D");
  t = t.replace(/[’‘`´]/g, "'").replace(/[“”]/g, '"');
  t = t.replace(/([a-z])\1{2,}/g, "$1"); // "dieeee" → "die"
  t = t.replace(/\s+/g, " ");
  return t;
}
function unleet(t: string): string {
  return t.replace(/(?<=[a-z])[0]|[0](?=[a-z])/g, "o").replace(/(?<=[a-z])1|1(?=[a-z])/g, "i").replace(/(?<=[a-z])3|3(?=[a-z])/g, "e").replace(/@/g, "a").replace(/\$/g, "s");
}

const STOPS = [".", "!", "?", "।", "۔", "؟", "\n"];
function sentenceAround(t: string, index: number): string {
  const start = Math.max(...STOPS.map((c) => t.lastIndexOf(c, index))) + 1;
  const ends = STOPS.map((c) => t.indexOf(c, index)).filter((x) => x >= 0);
  const end = ends.length ? Math.min(...ends) : t.length;
  return t.slice(start, end).trim();
}

/** Matches any of the words when it starts a word (start of text, after a space or punctuation). Case suffixes may follow. */
function wordStartRe(words: string[], whole = false): RegExp {
  const esc = [...new Set(words.map((w) => normalise(w)))].sort((a, b) => b.length - a.length).map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return new RegExp(`(?:^|[\\s\\p{P}])(?:${esc.join("|")})${whole ? "(?=$|[\\s\\p{P}])" : ""}`, "u");
}
let nativeRes: { escalate: RegExp; escalateExact: RegExp; story: RegExp; other: RegExp } | null = null;
function nativeContext() {
  if (!nativeRes)
    nativeRes = {
      escalate: wordStartRe(ESCALATE_NATIVE),
      escalateExact: wordStartRe(ESCALATE_NATIVE_EXACT, true),
      story: wordStartRe(STORY_NATIVE),
      other: wordStartRe(OTHER_NATIVE),
    };
  return nativeRes;
}

function tagsFor(sentence: string, phrase: string): string[] {
  const before = sentence.slice(0, Math.max(0, sentence.indexOf(phrase))).split(" ").slice(-4).join(" ");
  const tags: string[] = [];
  if (CONTEXT.negated.test(before)) tags.push("negated");
  if (CONTEXT.someone_else.test(sentence) || nativeContext().other.test(sentence)) tags.push("possibly about someone else");
  if (CONTEXT.story_or_study.test(sentence) || nativeContext().story.test(sentence)) tags.push("possibly a story or school topic");
  if (CONTEXT.past.test(sentence)) tags.push("possibly in the past");
  return tags;
}

export function scanText(text: string, custom: CustomTerm[] = []): LexiconHit[] {
  if (!text || !text.trim()) return [];
  const base = normalise(text);
  const variants = [base, unleet(base)];
  const hits: LexiconHit[] = [];
  const seen = new Set<string>();
  const push = (category: Category, severity: Severity, t: string, index: number, phrase: string) => {
    const key = `${category}:${phrase}`;
    if (seen.has(key)) return;
    seen.add(key);
    const sentence = sentenceAround(t, index);
    const tags = tagsFor(sentence, phrase);
    let sev: Severity = ESCALATE_CATS.has(category) && (ESCALATE.test(sentence) || nativeContext().escalate.test(sentence) || nativeContext().escalateExact.test(sentence)) ? "urgent" : severity;
    // A school topic or story lowers urgency for everything except self-harm and sexual abuse, which stay urgent.
    if (tags.includes("possibly a story or school topic") && category !== "self_harm" && category !== "sexual_abuse") sev = "concern";
    hits.push({ category, severity: sev, phrase, tags });
  };
  for (const t of variants) {
    for (const [cat, list] of Object.entries(ROMAN) as [Exclude<Category, "custom">, RegExp[]][]) {
      for (const re of list) {
        const m = re.exec(t);
        if (m) push(cat, CATEGORY_SEVERITY[cat], t, m.index, m[0]);
      }
    }
  }
  for (const [cat, list] of Object.entries(DEVANAGARI) as [Exclude<Category, "custom">, string[]][]) {
    for (const stem of list) {
      const s = normalise(stem);
      const i = base.indexOf(s);
      if (i >= 0) push(cat, CATEGORY_SEVERITY[cat], base, i, s);
    }
  }
  for (const lists of Object.values(NATIVE)) {
    for (const [cat, list] of Object.entries(lists) as [Exclude<Category, "custom">, string[]][]) {
      for (const stem of list) {
        const st = normalise(stem);
        const i = base.indexOf(st);
        if (i >= 0) push(cat, CATEGORY_SEVERITY[cat], base, i, st);
      }
    }
  }
  for (const c of custom.filter((x) => x.kind === "match")) {
    const s = normalise(c.phrase).trim();
    if (!s) continue;
    const i = base.indexOf(s);
    if (i >= 0) push(c.category === "custom" ? "custom" : c.category, c.severity, base, i, s);
  }
  // Reviewer exceptions may only quiet concern-level matches, never urgent ones.
  const exceptions = custom.filter((x) => x.kind === "except").map((x) => normalise(x.phrase).trim()).filter(Boolean);
  return hits.filter((h) => h.severity === "urgent" || !exceptions.some((e) => base.includes(e) && e.includes(h.phrase)));
}

export const LEXICON_VERSION = "sg-lexicon-v3-2026-11-24";
export const LEXICON_SIZE =
  Object.values(ROMAN).reduce((n, l) => n + l.length, 0) +
  Object.values(DEVANAGARI).reduce((n, l) => n + l.length, 0) +
  Object.values(NATIVE).reduce((n, lists) => n + Object.values(lists).reduce((m, l) => m + (l?.length ?? 0), 0), 0);
/** Languages with native-script coverage, for the admin page. */
export const LEXICON_LANGUAGES = ["English", "Hinglish", "Hindi", "Bengali", "Marathi", "Telugu", "Tamil", "Gujarati", "Urdu", "Kannada", "Odia", "Malayalam"];

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
 *  3. Three scripts. English, Hindi (Devanagari) and Hinglish (Roman-script Hindi), matched after normalisation
 *     (case, nukta, chandrabindu, zero-width characters, repeated letters, common digit-for-letter swaps).
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
  physical_abuse: ["मुझे मारत", "मुझे मारते", "मुझे पीटत", "मुझे पीटते", "पिटाई करत", "मारते हैं", "मारता है", "मारती है", "पीटते हैं", "जला देत", "बेल्ट से मार", "डंडे से मार"],
  emotional_abuse: ["किसी को मत बताना", "किसी को मत बोलना", "धमकी", "डराते हैं", "डराता है", "बंद कर देत", "कमरे में बंद"],
  neglect: ["खाना नहीं देत", "भूखा रखत", "भूखे रखत", "भूखा सोना", "भूखे सोना", "अकेला छोड़ देत", "अकेले छोड़ देत"],
  exploitation: ["काम करवाते", "मजदूरी करवा", "शादी करवा रहे", "शादी तय कर", "रिश्ता पक्का", "बेच दिया", "बाल विवाह"],
  bullying: ["रैगिंग", "ब्लैकमेल", "सब मेरा मज़ाक", "सब मेरा मजाक", "मुझे तंग करत", "परेशान करते हैं", "मोर्फ"],
  fear_of_home: ["घर से भाग", "घर नहीं जाना", "घर जाने से डर", "घर पर डर लगता"],
  substance: ["शराब पी", "नशा कर", "गांजा", "चरस", "ड्रग्स"],
  distress: ["कोई परवाह नहीं", "कोई प्यार नहीं करता", "किसी को फर्क नहीं", "जिंदगी से नफरत", "ज़िंदगी से नफ़रत", "सब खत्म", "जीने से थक", "बोझ हूं", "बोझ हूँ", "मैं बेकार हूं", "मैं बेकार हूँ"],
};

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
  t = t.replace(/[​-‍﻿]/g, "").replace(/़/g, "").replace(/ँ/g, "ं");
  t = t.replace(/[’‘`´]/g, "'").replace(/[“”]/g, '"');
  t = t.replace(/([a-z])\1{2,}/g, "$1"); // "dieeee" → "die"
  t = t.replace(/\s+/g, " ");
  return t;
}
function unleet(t: string): string {
  return t.replace(/(?<=[a-z])[0]|[0](?=[a-z])/g, "o").replace(/(?<=[a-z])1|1(?=[a-z])/g, "i").replace(/(?<=[a-z])3|3(?=[a-z])/g, "e").replace(/@/g, "a").replace(/\$/g, "s");
}

function sentenceAround(t: string, index: number): string {
  const start = Math.max(t.lastIndexOf(".", index), t.lastIndexOf("!", index), t.lastIndexOf("?", index), t.lastIndexOf("।", index), t.lastIndexOf("\n", index)) + 1;
  const ends = [".", "!", "?", "।", "\n"].map((c) => t.indexOf(c, index)).filter((x) => x >= 0);
  const end = ends.length ? Math.min(...ends) : t.length;
  return t.slice(start, end).trim();
}

function tagsFor(sentence: string, phrase: string): string[] {
  const before = sentence.slice(0, Math.max(0, sentence.indexOf(phrase))).split(" ").slice(-4).join(" ");
  const tags: string[] = [];
  if (CONTEXT.negated.test(before)) tags.push("negated");
  if (CONTEXT.someone_else.test(sentence)) tags.push("possibly about someone else");
  if (CONTEXT.story_or_study.test(sentence)) tags.push("possibly a story or school topic");
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
    let sev: Severity = ESCALATE_CATS.has(category) && ESCALATE.test(sentence) ? "urgent" : severity;
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

export const LEXICON_VERSION = "sg-lexicon-v2-2026-11-23";
export const LEXICON_SIZE = Object.values(ROMAN).reduce((n, l) => n + l.length, 0) + Object.values(DEVANAGARI).reduce((n, l) => n + l.length, 0);

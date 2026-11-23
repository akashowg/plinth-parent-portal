import { choice, freq, multi, open, tx, type Row } from "./build";
import { HOME_LANGUAGES, INSTRUCTION_LANGUAGES, NA_SEEN, RATE, SCREEN_HOURS, SLEEP, DAYS, TUITION } from "./scales";
import type { Item, Opt, Section } from "./types";

/* =====================================================================================================
 * Parent form · all bands. Separate session; the parent never sees the child’s or teacher’s answers.
 * Observation blocks use behaviourally described options (Format B) with an honest middle and negative
 * option and a “haven’t had a chance to see this” option, which carries no value. Wording is deliberately
 * unlike the student items so neither form can be reconstructed from the other.
 * ===================================================================================================*/

/** Behaviourally anchored observation item: four described behaviours (scored 5/4/2/1) plus “not seen”. */
const ob = (k: string, en: string, hi: string, rows: [string, string][]): Item => {
  const scores = [5, 4, 2, 1];
  const o: Opt[] = rows.map(([e, h], i) => ({ v: "abcd"[i], s: scores[i], t: tx(e, h) }));
  return { k, kind: "choice", t: tx(en, hi), opts: [...o, NA_SEEN] };
};

const CONF = (k: string): Item => ({
  k,
  kind: "rate",
  anchors: "confidence",
  opts: RATE,
  v: "obsconf",
  t: tx(
    "How confident are you that you see this side of your child?",
    "आपको कितना भरोसा है कि आप अपने बच्चे का यह पहलू देख पाते हैं?",
  ),
});

const P1: Section = {
  id: "p1",
  title: tx("How you see your child", "आप अपने बच्चे को कितना देख पाते हैं"),
  lead: tx(
    "These questions tell us how much of your child’s day you see. Honest answers about limited time are useful — they help us weigh everything else correctly.",
    "ये प्रश्न बताते हैं कि आप अपने बच्चे के दिन का कितना हिस्सा देख पाते हैं। कम समय के बारे में ईमानदार उत्तर भी उपयोगी हैं — इनसे हम बाकी सब बातों को सही महत्व दे पाते हैं।",
  ),
  items: [
    choice("P1.1", "On a normal weekday, roughly how many waking hours do you spend with your child?", "एक सामान्य कार्यदिवस पर, आप अपने बच्चे के साथ लगभग कितने जागते घंटे बिताते हैं?", [
      ["lt1", "Under 1 hour", "1 घंटे से कम"],
      ["1-2", "1–2 hours", "1–2 घंटे"],
      ["2-4", "2–4 hours", "2–4 घंटे"],
      ["4+", "More than 4 hours", "4 घंटे से अधिक"],
    ]),
    multi("P1.2", "In which of these do you regularly see your child? Choose all that apply.", "इनमें से किन स्थितियों में आप अपने बच्चे को नियमित रूप से देखते हैं? जो सही हों, सब चुनें।", [
      ["studying", "Studying", "पढ़ाई करते हुए"],
      ["friends", "With friends", "दोस्तों के साथ"],
      ["pressure", "Under pressure (exams, deadlines)", "दबाव में (परीक्षा, समय-सीमा)"],
      ["free", "Unstructured free time", "खाली, बिना योजना वाले समय में"],
      ["disappointment", "Handling disappointment", "निराशा संभालते हुए"],
      ["younger", "With younger children", "छोटे बच्चों के साथ"],
    ]),
    choice("P1.3", "Who is completing this form?", "यह फ़ॉर्म कौन भर रहा है?", [
      ["mother", "Mother", "माँ"],
      ["father", "Father", "पिता"],
      ["guardian", "Guardian", "अभिभावक"],
      ["joint", "Completed jointly", "मिलकर भर रहे हैं"],
    ]),
    { ...CONF("P1.4"), t: tx("Overall, how confident are you that you see the side of your child these questions ask about?", "कुल मिलाकर, आपको कितना भरोसा है कि ये प्रश्न आपके बच्चे के जिस पहलू के बारे में पूछते हैं, उसे आप देख पाते हैं?") },
    choice("P1.5", "Which language is your child mainly taught in at school?", "स्कूल में आपके बच्चे को मुख्य रूप से किस भाषा में पढ़ाया जाता है?", INSTRUCTION_LANGUAGES),
    choice("P1.6", "Which language does your family mostly speak at home?", "आपका परिवार घर पर ज़्यादातर कौन-सी भाषा बोलता है?", HOME_LANGUAGES),
  ],
};

const P2: Section = {
  id: "p2",
  title: tx("Learning at home", "घर पर सीखना"),
  lead: tx("Choose the description closest to what you usually see — not what you hope for.", "वह विवरण चुनें जो आप आमतौर पर देखते हैं — वह नहीं जिसकी आप उम्मीद करते हैं।"),
  items: [
    ob("P2.1", "When my child meets schoolwork they haven’t seen before, they usually…", "जब मेरे बच्चे के सामने ऐसा पढ़ाई का काम आता है जो पहले नहीं देखा, तो वह आमतौर पर…", [
      ["try a few different ways on their own before asking anyone", "किसी से पूछने से पहले खुद कुछ अलग-अलग तरीके आज़माता/आज़माती है"],
      ["try once or twice, then ask for help", "एक-दो बार कोशिश करता/करती है, फिर मदद माँगता/माँगती है"],
      ["ask for help or look up the answer almost straight away", "लगभग तुरंत मदद माँगता/माँगती है या उत्तर देख लेता/लेती है"],
      ["put it aside or avoid it", "उसे टाल देता/देती है या उससे बचता/बचती है"],
    ]),
    ob("P2.2", "When a piece of homework takes much longer than expected, my child…", "जब कोई गृहकार्य उम्मीद से बहुत ज़्यादा समय लेता है, तो मेरा बच्चा…", [
      ["keeps going until it is done, with little reminding", "बिना ज़्यादा याद दिलाए, पूरा होने तक लगा रहता/रहती है"],
      ["keeps going with an occasional reminder", "कभी-कभार याद दिलाने पर लगा रहता/रहती है"],
      ["needs regular reminders to keep going", "लगे रहने के लिए बार-बार याद दिलाना पड़ता है"],
      ["usually stops before it is finished", "आमतौर पर पूरा होने से पहले रुक जाता/जाती है"],
    ]),
    ob("P2.3", "On a normal school evening, my child’s homework…", "स्कूल वाले एक सामान्य दिन की शाम, मेरे बच्चे का गृहकार्य…", [
      ["gets started and done without me needing to be involved", "मेरी भागीदारी के बिना शुरू होता है और पूरा हो जाता है"],
      ["gets done with me checking now and then", "मेरे बीच-बीच में देखने से पूरा हो जाता है"],
      ["needs me to sit nearby or guide most steps", "मुझे पास बैठना पड़ता है या ज़्यादातर कदम बताने पड़ते हैं"],
      ["depends on me, a tutor or someone else doing much of it with them", "मुझ पर, ट्यूटर पर या किसी और पर निर्भर रहता है जो उसका बड़ा हिस्सा साथ में करे"],
    ]),
    ob("P2.4", "While studying, my child’s attention…", "पढ़ाई करते समय मेरे बच्चे का ध्यान…", [
      ["stays on the work for long stretches", "लंबे समय तक काम पर टिका रहता है"],
      ["drifts sometimes but comes back on its own", "कभी-कभी भटकता है पर अपने-आप लौट आता है"],
      ["drifts often and needs bringing back", "अक्सर भटकता है और वापस लाना पड़ता है"],
      ["is hard to hold for more than a few minutes", "कुछ मिनट से ज़्यादा टिकाना मुश्किल होता है"],
    ]),
    ob("P2.5", "Outside schoolwork, my child looks things up, asks about or tries out new things…", "पढ़ाई के बाहर, मेरा बच्चा नई चीज़ें खोजता है, उनके बारे में पूछता है या आज़माता है…", [
      ["most days, without anyone suggesting it", "ज़्यादातर दिन, बिना किसी के कहे"],
      ["now and then, on their own", "कभी-कभी, अपने-आप"],
      ["mostly when someone else suggests it", "ज़्यादातर तब, जब कोई और सुझाता है"],
      ["rarely", "बहुत कम"],
    ]),
    ob("P2.6", "My child asks “why” or “how does that work” about everyday things…", "मेरा बच्चा रोज़मर्रा की चीज़ों के बारे में “क्यों” या “यह कैसे काम करता है” पूछता है…", [
      ["many times most days", "ज़्यादातर दिनों में कई बार"],
      ["most days", "ज़्यादातर दिन"],
      ["now and then", "कभी-कभी"],
      ["rarely", "बहुत कम"],
    ]),
    choice(
      "P2.7",
      "When my child has nothing planned and feels bored, they usually…",
      "जब मेरे बच्चे के पास कुछ करने को नहीं होता और वह ऊब जाता/जाती है, तो आमतौर पर…",
      [
        ["self", "find or invent something to do on their own", "खुद कुछ करने को ढूँढ लेता/लेती है या बना लेता/लेती है", 5],
        ["company", "look for someone to be with", "किसी के साथ रहने की तलाश करता/करती है", 3],
        ["screen", "reach for a phone, TV or game", "फ़ोन, टीवी या गेम की ओर जाता/जाती है", 2],
        ["wait", "complain, or wait for someone to suggest something", "शिकायत करता/करती है, या किसी के सुझाने का इंतज़ार करता/करती है", 1],
        [NA_SEEN.v, NA_SEEN.t.en, NA_SEEN.t.hi],
      ],
    ),
  ],
};

const P3: Section = {
  id: "p3",
  title: tx("Feelings and recovery", "भावनाएँ और संभलना"),
  items: [
    ob("P3.1", "When my child is very upset or angry, what usually happens?", "जब मेरा बच्चा बहुत परेशान या गुस्से में होता है, तो आमतौर पर क्या होता है?", [
      ["they can say what is wrong and calm themselves fairly soon", "वह बता पाता/पाती है कि क्या गलत है और जल्दी खुद को शांत कर लेता/लेती है"],
      ["they get loud or tearful but settle once given some space", "ज़ोर से बोलता/बोलती है या रोता/रोती है, पर थोड़ी जगह मिलने पर शांत हो जाता/जाती है"],
      ["they need an adult to help them settle", "शांत होने के लिए किसी बड़े की मदद चाहिए होती है"],
      ["it builds and takes a long time to settle, even with help", "यह बढ़ता जाता है और मदद के बाद भी शांत होने में बहुत समय लगता है"],
    ]),
    ob("P3.2", "After a bad day or an upset, my child is back to their usual self…", "किसी बुरे दिन या परेशानी के बाद, मेरा बच्चा अपने सामान्य रूप में लौट आता है…", [
      ["within the hour", "एक घंटे के भीतर"],
      ["by the evening", "शाम तक"],
      ["by the next day", "अगले दिन तक"],
      ["often only after several days", "अक्सर कई दिनों बाद ही"],
    ]),
    ob("P3.3", "When something doesn’t go their way — a poor result, not being picked — my child…", "जब कुछ उसके मन का नहीं होता — कम अंक, चुना न जाना — तो मेरा बच्चा…", [
      ["is disappointed briefly, then thinks about what to do next", "थोड़ी देर निराश रहता/रहती है, फिर सोचता/सोचती है कि आगे क्या करना है"],
      ["is upset for a while, then moves on", "कुछ समय परेशान रहता/रहती है, फिर आगे बढ़ जाता/जाती है"],
      ["loses interest in that activity or subject", "उस गतिविधि या विषय में रुचि खो देता/देती है"],
      ["blames themselves or others for a long time", "लंबे समय तक खुद को या दूसरों को दोष देता/देती है"],
    ]),
    ob("P3.4", "When something is worrying my child…", "जब कोई बात मेरे बच्चे को परेशान कर रही होती है…", [
      ["they tell us fairly soon", "वह हमें जल्दी बता देता/देती है"],
      ["they tell us if we ask", "पूछने पर बता देता/देती है"],
      ["we usually find out from their behaviour, not their words", "हमें आमतौर पर उसके व्यवहार से पता चलता है, शब्दों से नहीं"],
      ["they keep it to themselves, and we often never find out", "वह अपने तक रखता/रखती है, और अक्सर हमें कभी पता नहीं चलता"],
    ]),
    choice("P3.5", "My child’s confidence…", "मेरे बच्चे का आत्मविश्वास…", [
      ["steady", "is steady across most situations", "ज़्यादातर स्थितियों में एक-सा रहता है"],
      ["home", "is strong at home but drops in unfamiliar places or with new people", "घर पर मज़बूत होता है, पर नई जगहों या नए लोगों के बीच कम हो जाता है"],
      ["domain", "is strong in some activities and low in others", "कुछ गतिविधियों में मज़बूत और कुछ में कम होता है"],
      ["shifting", "changes a lot from day to day", "दिन-प्रतिदिन बहुत बदलता रहता है"],
      [NA_SEEN.v, NA_SEEN.t.en, NA_SEEN.t.hi],
    ] as Row[]),
    ob("P3.6", "When a teacher or I correct my child’s work or behaviour, they usually…", "जब कोई शिक्षक या मैं मेरे बच्चे के काम या व्यवहार को सुधारते हैं, तो वह आमतौर पर…", [
      ["listen and use it", "सुनता/सुनती है और उसे अपनाता/अपनाती है"],
      ["get defensive at first, then use it later", "पहले बचाव करता/करती है, फिर बाद में अपनाता/अपनाती है"],
      ["feel hurt and go quiet", "आहत महसूस करता/करती है और चुप हो जाता/जाती है"],
      ["argue or reject it", "बहस करता/करती है या उसे नकार देता/देती है"],
    ]),
    CONF("P3.c"),
  ],
};

const P4: Section = {
  id: "p4",
  title: tx("Character", "चरित्र"),
  items: [
    ob("P4.1", "When my child says they will do something at home, it gets done…", "जब मेरा बच्चा घर पर कुछ करने का वादा करता है, तो वह काम…", [
      ["almost always, without reminding", "लगभग हमेशा, बिना याद दिलाए हो जाता है"],
      ["usually, sometimes with a reminder", "आमतौर पर, कभी-कभी याद दिलाने पर हो जाता है"],
      ["only with repeated reminders", "बार-बार याद दिलाने पर ही होता है"],
      ["often not at all", "अक्सर होता ही नहीं"],
    ]),
    ob("P4.2", "Projects, hobbies or activities my child starts…", "मेरा बच्चा जो प्रोजेक्ट, शौक या गतिविधियाँ शुरू करता है, वे…", [
      ["are usually seen through", "आमतौर पर पूरी होती हैं"],
      ["are often finished, though some are dropped", "अक्सर पूरी होती हैं, हालाँकि कुछ छूट जाती हैं"],
      ["are often dropped once the first excitement fades", "शुरुआती उत्साह खत्म होते ही अक्सर छूट जाती हैं"],
      ["are rarely finished", "बहुत कम पूरी होती हैं"],
    ]),
    ob("P4.3", "If my child breaks something small, or makes a mistake no one would notice, they usually…", "अगर मेरे बच्चे से कोई छोटी चीज़ टूट जाए, या ऐसी गलती हो जिस पर किसी का ध्यान न जाए, तो वह आमतौर पर…", [
      ["tell us on their own", "खुद ही हमें बता देता/देती है"],
      ["admit it if asked", "पूछने पर मान लेता/लेती है"],
      ["admit it only when there is clear proof", "साफ़ सबूत होने पर ही मानता/मानती है"],
      ["hide it or blame something else", "छिपा लेता/लेती है या किसी और चीज़ पर दोष डाल देता/देती है"],
    ]),
    ob("P4.4", "When my child turns out to be wrong in a disagreement, they…", "जब किसी असहमति में मेरा बच्चा गलत साबित होता है, तो वह…", [
      ["accept it fairly easily", "आसानी से मान लेता/लेती है"],
      ["accept it after a while", "कुछ समय बाद मान लेता/लेती है"],
      ["find it very hard to accept", "मानना बहुत मुश्किल पाता/पाती है"],
      ["rarely accept it", "बहुत कम मानता/मानती है"],
    ]),
    ob("P4.5", "My child’s daily routine — waking, homework, getting ready — runs…", "मेरे बच्चे की दिनचर्या — उठना, गृहकार्य, तैयार होना — चलती है…", [
      ["mostly on their own", "ज़्यादातर अपने-आप"],
      ["with a few reminders", "कुछ बार याद दिलाने से"],
      ["only with constant reminders", "लगातार याद दिलाने पर ही"],
      ["mostly organised by adults for them", "ज़्यादातर बड़े उनके लिए व्यवस्थित करते हैं"],
    ]),
  ],
};

const P5: Section = {
  id: "p5",
  title: tx("Friends and others", "दोस्त और दूसरे लोग"),
  items: [
    choice("P5.1", "My child’s friendships right now are mostly…", "इस समय मेरे बच्चे की दोस्ती ज़्यादातर…", [
      ["close", "one or two very close friends", "एक-दो बहुत करीबी दोस्तों के साथ"],
      ["group", "a small, steady group", "एक छोटे, स्थिर समूह के साथ"],
      ["wide", "many friends, none especially close", "कई दोस्त, पर कोई खास करीबी नहीं"],
      ["few", "few or no friends at the moment", "अभी बहुत कम या कोई दोस्त नहीं"],
      [NA_SEEN.v, NA_SEEN.t.en, NA_SEEN.t.hi],
    ] as Row[]),
    ob("P5.2", "When my child disagrees or falls out with a friend…", "जब मेरे बच्चे की किसी दोस्त से असहमति या अनबन होती है…", [
      ["they talk it through and sort it out", "वे बात करके सुलझा लेते हैं"],
      ["it blows over by itself after a while", "कुछ समय बाद अपने-आप ठीक हो जाता है"],
      ["they need an adult to help sort it out", "सुलझाने के लिए किसी बड़े की मदद चाहिए होती है"],
      ["the friendship often ends", "अक्सर दोस्ती टूट जाती है"],
    ]),
    choice("P5.3", "In a group of children they don’t know, my child usually…", "अनजान बच्चों के समूह में, मेरा बच्चा आमतौर पर…", [
      ["joins", "joins in quickly", "जल्दी शामिल हो जाता/जाती है"],
      ["watches", "watches first, then joins in", "पहले देखता/देखती है, फिर शामिल होता/होती है"],
      ["stays", "stays close to someone they know", "किसी जान-पहचान वाले के पास रहता/रहती है"],
      ["holds", "holds back for most of the time", "ज़्यादातर समय पीछे रहता/रहती है"],
      [NA_SEEN.v, NA_SEEN.t.en, NA_SEEN.t.hi],
    ] as Row[]),
    ob("P5.4", "When another child — or a younger sibling — is upset or left out, my child…", "जब कोई दूसरा बच्चा — या छोटा भाई-बहन — परेशान हो या अलग-थलग हो, तो मेरा बच्चा…", [
      ["notices and does something to help", "ध्यान देता/देती है और मदद के लिए कुछ करता/करती है"],
      ["notices but usually leaves it to others", "ध्यान देता/देती है, पर आमतौर पर दूसरों पर छोड़ देता/देती है"],
      ["notices only if it is pointed out", "बताए जाने पर ही ध्यान देता/देती है"],
      ["doesn’t seem to notice", "ध्यान देता/देती नहीं लगता/लगती"],
    ]),
    CONF("P5.c"),
  ],
};

const P6: Section = {
  id: "p6",
  title: tx("Home and routine", "घर और दिनचर्या"),
  items: [
    ob("P6.1", "How well do our home routines and support currently match what my child seems to need?", "हमारे घर की दिनचर्या और सहयोग इस समय मेरे बच्चे की ज़रूरतों से कितना मेल खाते हैं?", [
      ["Well matched", "अच्छी तरह मेल खाते हैं"],
      ["Mostly matched, with some gaps", "ज़्यादातर मेल खाते हैं, कुछ कमियों के साथ"],
      ["Matched in some areas, mismatched in others", "कुछ बातों में मेल खाते हैं, कुछ में नहीं"],
      ["Quite mismatched right now", "इस समय काफ़ी मेल नहीं खाते"],
    ]),
    choice("P6.2", "Where does your child usually study at home?", "घर पर आपका बच्चा आमतौर पर कहाँ पढ़ता है?", [
      ["a", "A quiet space of their own", "अपनी एक शांत जगह पर", 5],
      ["b", "A shared space that is usually quiet", "एक साझा जगह जो आमतौर पर शांत रहती है", 4],
      ["c", "A shared space that is usually noisy", "एक साझा जगह जहाँ आमतौर पर शोर रहता है", 2],
      ["d", "It varies — nowhere consistent", "बदलता रहता है — कोई तय जगह नहीं", 1],
    ]),
    multi("P6.3", "When your child is stuck on schoolwork at home, who can actually help? Choose all that apply.", "जब आपका बच्चा घर पर पढ़ाई में अटकता है, तो असल में कौन मदद कर पाता है? जो सही हों, सब चुनें।", [
      ["parent", "A parent", "माता या पिता"],
      ["relative", "A sibling or relative", "भाई-बहन या कोई रिश्तेदार"],
      ["tutor", "A tutor or coaching teacher", "ट्यूशन या कोचिंग के शिक्षक"],
      ["online", "Videos or the internet", "वीडियो या इंटरनेट"],
      ["nobody", "Nobody, at the moment", "इस समय कोई नहीं", undefined, true],
    ]),
    choice("P6.4", "How many hours a week does your child spend in tuition or coaching outside school?", "स्कूल के बाहर आपका बच्चा हफ़्ते में कितने घंटे ट्यूशन या कोचिंग में बिताता है?", TUITION),
    ob("P6.5", "The expectations at home for my child’s studies and future…", "घर पर मेरे बच्चे की पढ़ाई और भविष्य को लेकर जो उम्मीदें हैं, वे…", [
      ["seem comfortably achievable for my child", "मेरे बच्चे के लिए आराम से पूरी करने लायक लगती हैं"],
      ["are mostly achievable, sometimes stretching", "ज़्यादातर पूरी करने लायक हैं, कभी-कभी थोड़ी कठिन"],
      ["are often more than my child can comfortably manage", "अक्सर मेरे बच्चे की आराम से संभालने की क्षमता से ज़्यादा होती हैं"],
      ["may be more than my child can meet", "शायद मेरे बच्चे की पहुँच से ज़्यादा हैं"],
    ]),
  ],
};

const P7: Section = {
  id: "p7",
  title: tx("Sleep, energy and screens", "नींद, ऊर्जा और स्क्रीन"),
  items: [
    choice("P7.1", "On a normal school night, roughly how many hours does your child sleep?", "स्कूल वाले एक सामान्य दिन की रात, आपका बच्चा लगभग कितने घंटे सोता है?", SLEEP),
    choice("P7.2", "In a normal week, on how many days is your child physically active for thirty minutes or more?", "एक सामान्य हफ़्ते में, कितने दिन आपका बच्चा तीस मिनट या उससे ज़्यादा शारीरिक रूप से सक्रिय रहता है?", DAYS),
    choice("P7.3", "Outside schoolwork, roughly how many hours a day is your child on a screen?", "पढ़ाई के अलावा, आपका बच्चा दिन में लगभग कितने घंटे स्क्रीन पर रहता है?", SCREEN_HOURS),
    freq("P7.4", "Screen time takes up time my child had meant to spend on something else.", "स्क्रीन पर बिताया समय वह समय ले लेता है जो मेरे बच्चे ने किसी और काम के लिए सोचा था।"),
    choice("P7.5", "Over the last term, has your child’s energy or appetite changed noticeably?", "पिछले सत्र में, क्या आपके बच्चे की ऊर्जा या भूख में कोई खास बदलाव आया है?", [
      ["none", "No real change", "कोई खास बदलाव नहीं"],
      ["little", "A little change", "थोड़ा बदलाव"],
      ["clear", "A clear change", "साफ़ बदलाव"],
      ["marked", "A marked change that worries me", "बड़ा बदलाव, जो मुझे चिंतित करता है"],
    ]),
    choice("P7.6", "Over the last term, has your child’s mood changed noticeably?", "पिछले सत्र में, क्या आपके बच्चे के मन-मिज़ाज में कोई खास बदलाव आया है?", [
      ["none", "No real change", "कोई खास बदलाव नहीं"],
      ["usual", "Some ups and downs, nothing unusual", "कुछ उतार-चढ़ाव, कुछ असामान्य नहीं"],
      ["clear", "A clear change", "साफ़ बदलाव"],
      ["marked", "A marked change that worries me", "बड़ा बदलाव, जो मुझे चिंतित करता है"],
    ]),
  ],
};

const P8: Section = {
  id: "p8",
  title: tx("Change and new situations", "बदलाव और नई स्थितियाँ"),
  items: [
    ob("P8.1", "When plans change suddenly — a trip cancelled, a new timetable — my child…", "जब योजना अचानक बदलती है — कोई यात्रा रद्द हो जाए, नई समय-सारणी आ जाए — तो मेरा बच्चा…", [
      ["adjusts quickly", "जल्दी ढल जाता/जाती है"],
      ["is unsettled briefly, then adjusts", "थोड़ी देर बेचैन रहता/रहती है, फिर ढल जाता/जाती है"],
      ["stays upset for a good while", "काफ़ी समय तक परेशान रहता/रहती है"],
      ["finds it very hard and may refuse", "बहुत मुश्किल पाता/पाती है और मना भी कर सकता/सकती है"],
    ]),
    ob("P8.2", "In a new situation — a new class, a new place — my child settles in…", "किसी नई स्थिति में — नई कक्षा, नई जगह — मेरा बच्चा घुल-मिल जाता है…", [
      ["within days", "कुछ ही दिनों में"],
      ["within a few weeks", "कुछ हफ़्तों में"],
      ["only after a long time", "काफ़ी लंबे समय बाद"],
      ["with real difficulty", "बहुत कठिनाई से"],
    ]),
    ob("P8.3", "When meeting new adults — a new teacher, relatives they don’t know — my child…", "नए बड़ों से मिलने पर — नए शिक्षक, अनजान रिश्तेदार — मेरा बच्चा…", [
      ["is at ease", "सहज रहता/रहती है"],
      ["is shy at first, then comfortable", "पहले शर्माता/शर्माती है, फिर सहज हो जाता/जाती है"],
      ["stays uneasy for a long time", "लंबे समय तक असहज रहता/रहती है"],
      ["avoids them", "उनसे बचता/बचती है"],
    ]),
    ob("P8.4", "After a disruption to routine — illness, travel, holidays — my child is back in their normal routine…", "दिनचर्या में रुकावट के बाद — बीमारी, यात्रा, छुट्टियाँ — मेरा बच्चा अपनी सामान्य दिनचर्या में लौट आता है…", [
      ["within a day or two", "एक-दो दिन में"],
      ["within a week", "एक हफ़्ते में"],
      ["after a few weeks", "कुछ हफ़्तों बाद"],
      ["only with real difficulty", "बहुत कठिनाई से ही"],
    ]),
    ob("P8.5", "When my child doesn’t know what is going to happen — results, a decision still to be made — they…", "जब मेरे बच्चे को पता नहीं होता कि आगे क्या होगा — परिणाम, कोई फ़ैसला जो अभी होना है — तो वह…", [
      ["carry on as normal", "सामान्य रूप से अपना काम करता/करती रहता/रहती है"],
      ["think about it but stay settled", "उसके बारे में सोचता/सोचती है, पर शांत रहता/रहती है"],
      ["ask about it again and again", "बार-बार उसके बारे में पूछता/पूछती है"],
      ["become very anxious about it", "उसे लेकर बहुत घबरा जाता/जाती है"],
    ]),
  ],
};

const P9A: Section = {
  id: "p9a",
  title: tx("Your hopes", "आपकी आशाएँ"),
  lockOnLeave: true,
  lead: tx("Once you continue, you won’t be able to come back to this answer. That is deliberate — the next question works only if this one stays as you first wrote it.", "आगे बढ़ने के बाद आप इस उत्तर पर वापस नहीं आ पाएँगे। ऐसा जान-बूझकर है — अगला प्रश्न तभी काम करता है जब यह उत्तर वैसा ही रहे जैसा आपने पहली बार लिखा।"),
  items: [
    open("P9.1", "What do you hope your child’s life looks like ten years from now?", "आप उम्मीद करते हैं कि आज से दस साल बाद आपके बच्चे का जीवन कैसा हो?", 150, {
      ex: tx(
        "“I hope she is working in something that uses her drawing — maybe architecture or design — living somewhere she chose, and still close to her brother.”",
        "“मैं चाहती हूँ कि वह ऐसे काम में हो जिसमें उसकी चित्रकारी काम आए — शायद आर्किटेक्चर या डिज़ाइन — अपनी चुनी हुई जगह पर रहे, और अपने भाई के करीब बनी रहे।”",
      ),
    }),
  ],
};

const P9B: Section = {
  id: "p9b",
  title: tx("Your child’s hopes, as you see them", "आपकी नज़र में आपके बच्चे की आशाएँ"),
  items: [
    open("P9.2", "What do you think your child hopes their life looks like ten years from now?", "आपको क्या लगता है, आपका बच्चा उम्मीद करता है कि दस साल बाद उसका जीवन कैसा हो?", 150),
    open(
      "P9.3",
      "Describe one specific occasion in the last year when your child handled something better than you expected. What happened?",
      "पिछले एक साल का कोई एक खास मौका बताइए जब आपके बच्चे ने किसी स्थिति को आपकी उम्मीद से बेहतर संभाला। क्या हुआ था?",
      150,
      {
        ex: tx(
          "“At his cousin’s wedding the music system failed. He quietly fixed the speaker connection with an uncle and then went back to dancing — he didn’t mention it to anyone.”",
          "“उसके चचेरे भाई की शादी में म्यूज़िक सिस्टम बंद हो गया। उसने चुपचाप एक चाचा के साथ स्पीकर का कनेक्शन ठीक किया और फिर नाचने लौट गया — किसी से कुछ कहा भी नहीं।”",
        ),
      },
    ),
  ],
};

/** Band A additions — the parent is the primary source for 6–10, and the only credible reporter of these. */
const P10: Section = {
  id: "p10",
  title: tx("Everyday patterns", "रोज़मर्रा के पैटर्न"),
  items: [
    choice("P10.1", "How long does it typically take your child to settle after being upset?", "परेशान होने के बाद आपके बच्चे को शांत होने में आमतौर पर कितना समय लगता है?", [
      ["lt5", "Under 5 minutes", "5 मिनट से कम", 5],
      ["5-20", "5–20 minutes", "5–20 मिनट", 4],
      ["20-60", "20–60 minutes", "20–60 मिनट", 2],
      ["longer", "Longer, or needs help to settle", "इससे ज़्यादा, या शांत होने के लिए मदद चाहिए", 1],
    ]),
    choice("P10.2", "How does your child play when left entirely to themselves?", "जब आपके बच्चे को पूरी तरह अकेला छोड़ दिया जाए, तो वह कैसे खेलता है?", [
      ["absorbed", "Becomes absorbed in one thing for a long time", "किसी एक चीज़ में लंबे समय तक डूबा रहता/रहती है"],
      ["moves", "Moves quickly between activities", "एक गतिविधि से दूसरी पर जल्दी-जल्दी जाता/जाती है"],
      ["company", "Looks for company quickly", "जल्दी किसी का साथ ढूँढता/ढूँढती है"],
      ["screen", "Looks for a screen", "स्क्रीन ढूँढता/ढूँढती है"],
    ]),
    multi("P10.3", "Which everyday self-care tasks does your child manage without reminding?", "रोज़ के कौन-से अपने काम आपका बच्चा बिना याद दिलाए कर लेता है?", [
      ["dress", "Getting dressed", "कपड़े पहनना"],
      ["wash", "Washing and brushing teeth", "हाथ-मुँह धोना और दाँत साफ़ करना"],
      ["eat", "Eating without help", "बिना मदद के खाना"],
      ["bag", "Packing their school bag", "स्कूल बैग तैयार करना"],
      ["tidy", "Putting away their things", "अपना सामान सँभालकर रखना"],
      ["none", "None of these yet", "अभी इनमें से कोई नहीं", undefined, true],
    ]),
    ob("P10.4", "When a plan changes — a visit called off, a different route to school — my child…", "जब कोई योजना बदलती है — कहीं जाना रद्द हो जाए, स्कूल का रास्ता बदल जाए — तो मेरा बच्चा…", [
      ["goes along with it easily", "आसानी से मान जाता/जाती है"],
      ["protests briefly, then goes along", "थोड़ी देर विरोध करता/करती है, फिर मान जाता/जाती है"],
      ["stays upset for a while", "कुछ देर तक परेशान रहता/रहती है"],
      ["finds it very hard, with tears or refusal", "बहुत कठिन पाता/पाती है, रोता/रोती है या मना कर देता/देती है"],
    ]),
    choice("P10.5", "How does your child behave around children they do not know?", "अनजान बच्चों के बीच आपका बच्चा कैसा व्यवहार करता है?", [
      ["joins", "Joins in straight away", "तुरंत शामिल हो जाता/जाती है"],
      ["watches", "Watches, then joins", "देखता/देखती है, फिर शामिल होता/होती है"],
      ["adult", "Stays near an adult they know", "किसी परिचित बड़े के पास रहता/रहती है"],
      ["avoids", "Keeps away", "दूर रहता/रहती है"],
    ]),
    open("P10.6", "What does your child return to again and again without being encouraged?", "आपका बच्चा बिना किसी के कहे बार-बार किस चीज़ की ओर लौटता है?", 100, {
      ex: tx("“Taking apart old torches and remotes to see what is inside.”", "“पुरानी टॉर्च और रिमोट खोलकर देखना कि अंदर क्या है।”"),
    }),
    choice("P10.7", "On a school day, how much of your child’s day is unstructured — no school, no class, no screen?", "स्कूल वाले दिन, आपके बच्चे के दिन का कितना हिस्सा खाली होता है — न स्कूल, न क्लास, न स्क्रीन?", [
      ["lt30", "Under 30 minutes", "30 मिनट से कम"],
      ["30-60", "30–60 minutes", "30–60 मिनट"],
      ["1-2", "1–2 hours", "1–2 घंटे"],
      ["2+", "More than 2 hours", "2 घंटे से अधिक"],
    ]),
    open(
      "P10.9",
      "Is there anything about your child’s development you have wondered about but not raised with anyone? (Optional — this goes only to the PLINTH reviewer, never into the dossier text.)",
      "क्या आपके बच्चे के विकास के बारे में कोई ऐसी बात है जिसके बारे में आपने सोचा हो पर किसी से कहा न हो? (वैकल्पिक — यह केवल PLINTH समीक्षक तक जाता है, डोज़ियर के पाठ में कभी नहीं।)",
      0,
      { optional: true, reviewerOnly: true },
    ),
  ],
};

export function parentSections(band: "A" | "B" | "C"): Section[] {
  const s = [P1, P2, P3, P4, P5, P6, P7, P8];
  if (band === "A") s.push(P10);
  s.push(P9A, P9B);
  return s;
}

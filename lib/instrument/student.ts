import { a3, choice, freq, multi, open, tx } from "./build";
import { A3_LIKE, DAYS, HOME_LANGUAGES, RATE, SCREEN_HOURS, SLEEP, TUITION } from "./scales";
import type { Item, Section } from "./types";

/* =====================================================================================================
 * Student form · Bands C (15–18) and B (11–14).
 * Band B is Band C with reading level lowered (tB), scenarios made school-concrete, forced-choice pairs and
 * S8.7 removed, identity items provisional, and the interest section gated by exact age.
 * ===================================================================================================*/

const ATTN = (k: string): Item =>
  freq(k, "For this one, please choose “Rarely”.", "इस प्रश्न के लिए कृपया “बहुत कम” चुनें।", { v: "attn", expect: "2" });

const S1: Section = {
  id: "s1",
  title: tx("Your subjects", "तुम्हारे विषय"),
  lead: tx(
    "Rate each subject twice: how much you enjoy it, and how easy it feels. These are two different things — a subject can be enjoyable and hard.",
    "हर विषय को दो बार आँको: वह तुम्हें कितना पसंद है, और वह कितना आसान लगता है। ये दो अलग बातें हैं — कोई विषय पसंद भी हो सकता है और कठिन भी।",
  ),
  items: [
    { k: "S1.0", kind: "multi", t: tx("Which of these subjects do you study this year?", "इस साल तुम इनमें से कौन-कौन से विषय पढ़ते हो?"), sec: 10 },
    { k: "S1.grid", kind: "grid", t: tx("For each subject you study:", "अपने हर विषय के लिए:"), sec: 0 },
    {
      k: "S1.19",
      kind: "subject",
      t: tx("Which subject is hardest for you right now?", "इस समय तुम्हारे लिए सबसे कठिन विषय कौन-सा है?"),
    },
    multi(
      "S1.20",
      "What makes it hard? Choose everything that applies.",
      "वह कठिन क्यों लगता है? जो-जो सही हो, सब चुनो।",
      [
        ["pace", "The pace is too fast for me", "पढ़ाई की गति मेरे लिए बहुत तेज़ है"],
        ["basics", "I never properly understood the basics from earlier years", "पिछली कक्षाओं की बुनियादी बातें मुझे कभी ठीक से समझ नहीं आईं"],
        ["method", "The way it’s taught doesn’t work for the way I learn", "जिस तरह से पढ़ाया जाता है, वह मेरे सीखने के तरीके से मेल नहीं खाता"],
        ["boring", "I find the content genuinely boring", "मुझे इसकी विषय-वस्तु सच में उबाऊ लगती है"],
        ["fear", "I’m afraid of getting it wrong in front of others", "मुझे दूसरों के सामने गलत होने का डर लगता है"],
        ["language", "The language it’s taught in makes it harder", "जिस भाषा में यह पढ़ाया जाता है, उससे यह और कठिन हो जाता है"],
        ["nohelp", "I don’t get help when I’m stuck", "अटकने पर मुझे मदद नहीं मिलती"],
        ["other", "Something else", "कुछ और"],
      ],
      { sec: 12 },
    ),
    choice("S1.21", "Is there a subject where your marks are lower than your interest in it?", "क्या कोई ऐसा विषय है जिसमें तुम्हारे अंक तुम्हारी रुचि से कम आते हैं?", [
      ["yes", "Yes", "हाँ"],
      ["no", "No", "नहीं"],
    ]),
    { k: "S1.21s", kind: "subject", t: tx("Which subject?", "कौन-सा विषय?"), show: { k: "S1.21", in: ["yes"] } },
    open("S1.21o", "What do you think causes that gap?", "तुम्हें क्या लगता है, यह अंतर किस वजह से है?", 150, {
      floorB: 120,
      show: { k: "S1.21", in: ["yes"] },
      skippable: true,
      ex: tx(
        "“I understand chemistry in class, but in exams I run out of time on the long numericals because I check every step twice.”",
        "“कक्षा में रसायन समझ आता है, पर परीक्षा में लंबे सवालों पर समय खत्म हो जाता है क्योंकि मैं हर कदम दो बार जाँचता हूँ।”",
      ),
    }),
  ],
};

const S2: Section = {
  id: "s2",
  title: tx("How you learn", "तुम कैसे सीखते हो"),
  lead: tx("Choose how often each one is true for you.", "चुनो कि हर बात तुम्हारे लिए कितनी बार सच होती है।"),
  items: [
    freq("S2.1", "When I don’t understand something, I try a different way of working it out before asking for help.", "जब कुछ समझ नहीं आता, तो मदद माँगने से पहले मैं उसे किसी दूसरे तरीके से हल करने की कोशिश करता/करती हूँ।"),
    freq("S2.2", "I prefer being told exactly what to do rather than working out the steps myself.", "मुझे खुद कदम सोचने की बजाय यह बताया जाना पसंद है कि ठीक-ठीक क्या करना है।", {
      rev: true,
      tB: tx("I like being told exactly what to do more than working out the steps myself.", "मुझे खुद कदम सोचने से ज़्यादा यह पसंद है कि कोई बता दे कि ठीक-ठीक क्या करना है।"),
    }),
    freq("S2.3", "I lose track of time when I’m working on something that interests me.", "जब मैं किसी दिलचस्प काम में लगा/लगी होता/होती हूँ, तो समय का पता ही नहीं चलता।", {
      tB: tx("When something interests me, I forget about the time.", "जब कोई चीज़ मुझे दिलचस्प लगती है, तो मैं समय भूल जाता/जाती हूँ।"),
    }),
    freq("S2.4", "I can stay focused on schoolwork for thirty minutes without checking my phone.", "मैं फ़ोन देखे बिना तीस मिनट तक पढ़ाई पर ध्यान लगाए रख सकता/सकती हूँ।"),
    freq("S2.5", "I understand things better when I can see them drawn, diagrammed or built.", "जब कोई चीज़ चित्र, आरेख या मॉडल के रूप में दिखती है, तो मैं उसे बेहतर समझता/समझती हूँ।"),
    freq("S2.6", "I understand things better when I can talk them through with someone.", "जब मैं किसी के साथ बात करके समझता/समझती हूँ, तो चीज़ें बेहतर समझ आती हैं।"),
    freq("S2.7", "I go back over things I got wrong to work out why.", "जो गलत हुआ, उसे दोबारा देखकर मैं समझने की कोशिश करता/करती हूँ कि गलती क्यों हुई।"),
    freq("S2.8", "I plan how I’ll approach a task before I start it.", "कोई काम शुरू करने से पहले मैं सोच लेता/लेती हूँ कि उसे कैसे करूँगा/करूँगी।"),
    freq("S2.9", "I find it hard to start work even when I know I should.", "जानते हुए भी कि काम शुरू करना चाहिए, मुझे शुरू करना मुश्किल लगता है।", { rev: true }),
    freq("S2.10", "When one method isn’t working, I switch to another.", "जब एक तरीका काम नहीं करता, तो मैं दूसरा तरीका अपनाता/अपनाती हूँ।"),
  ],
};

const S3: Section = {
  id: "s3",
  title: tx("Thinking", "सोचने का तरीका"),
  lead: tx("For the situations, pick what you would actually do — not what sounds best. None of them is the right answer.", "स्थितियों में वही चुनो जो तुम सच में करते — जो सबसे अच्छा लगे वह नहीं। इनमें से कोई भी ‘सही उत्तर’ नहीं है।"),
  items: [
    choice(
      "S3.1",
      "You’re given a problem in class that nobody has been taught how to solve. What are you most likely to actually do?",
      "कक्षा में तुम्हें एक ऐसा सवाल दिया जाता है जिसे हल करना किसी को सिखाया नहीं गया। तुम असल में सबसे ज़्यादा क्या करोगे?",
      [
        ["a", "Wait for the teacher to explain the method", "शिक्षक के तरीका समझाने का इंतज़ार करूँगा/करूँगी"],
        ["b", "Try things until something works, even if it takes a while", "तब तक कोशिश करूँगा/करूँगी जब तक कुछ काम न करे, चाहे समय लगे"],
        ["c", "Look for a similar problem I’ve solved before and adapt it", "पहले हल किया हुआ कोई मिलता-जुलता सवाल ढूँढकर उसे बदलकर लगाऊँगा/लगाऊँगी"],
        ["d", "Ask someone who’s usually good at this kind of thing", "ऐसे किसी से पूछूँगा/पूछूँगी जो इस तरह के सवालों में अच्छा है"],
      ],
      { tB: tx("Your teacher gives the class a sum that nobody has been taught how to do. What do you most likely do?", "शिक्षक कक्षा को ऐसा सवाल देते हैं जो किसी को सिखाया नहीं गया। तुम सबसे ज़्यादा क्या करोगे?") },
    ),
    choice(
      "S3.2",
      "You submit a piece of work, then realise there was a better way to do it. What happens next?",
      "तुम कोई काम जमा कर देते हो, फिर समझ आता है कि उसे करने का बेहतर तरीका था। आगे क्या होता है?",
      [
        ["a", "I move on — it’s done", "मैं आगे बढ़ जाता/जाती हूँ — काम तो हो गया"],
        ["b", "I note the better method for next time", "अगली बार के लिए बेहतर तरीका याद रख लेता/लेती हूँ"],
        ["c", "I ask whether I can redo it", "पूछता/पूछती हूँ कि क्या मैं इसे दोबारा कर सकता/सकती हूँ"],
        ["d", "It stays on my mind for a while", "यह बात कुछ समय तक मेरे दिमाग में घूमती रहती है"],
      ],
      { tB: tx("You hand in your homework and then see a better way to do it. What happens next?", "तुम गृहकार्य जमा कर देते हो, फिर उसे करने का बेहतर तरीका दिखता है। आगे क्या होता है?") },
    ),
    choice(
      "S3.3",
      "Something you were sure about turns out to be wrong. What happens?",
      "जिस बात पर तुम्हें पूरा भरोसा था, वह गलत निकलती है। तब क्या होता है?",
      [
        ["a", "I want to know exactly where my thinking went wrong", "मैं जानना चाहता/चाहती हूँ कि मेरी सोच में गलती ठीक कहाँ हुई"],
        ["b", "I accept it and move on", "मैं मान लेता/लेती हूँ और आगे बढ़ जाता/जाती हूँ"],
        ["c", "I first check whether the new information is actually right", "पहले जाँचता/जाँचती हूँ कि नई जानकारी सच में सही है या नहीं"],
        ["d", "It bothers me more than it probably should", "यह मुझे शायद ज़रूरत से ज़्यादा परेशान करता है"],
      ],
      { tB: tx("You argue with a classmate about an answer and it turns out they were right. What happens?", "किसी उत्तर पर तुम्हारी सहपाठी से बहस होती है और पता चलता है कि वह सही था। तब क्या होता है?") },
    ),
    freq("S3.4", "I notice patterns or connections that other people miss.", "मैं ऐसे पैटर्न या संबंध देख लेता/लेती हूँ जो दूसरों से छूट जाते हैं।", {
      tB: tx("I notice links between things that other people don’t spot.", "मैं चीज़ों के बीच ऐसे संबंध देख लेता/लेती हूँ जो दूसरों को नहीं दिखते।"),
    }),
    freq("S3.5", "I ask questions about things that aren’t part of the syllabus.", "मैं ऐसी बातों पर भी सवाल पूछता/पूछती हूँ जो पाठ्यक्रम में नहीं हैं।"),
    freq("S3.6", "I’d rather understand why something works than just learn how to do it.", "मुझे सिर्फ़ कैसे करना है यह सीखने से ज़्यादा यह समझना पसंद है कि कोई चीज़ क्यों काम करती है।", {
      tB: tx("I want to know why something works, not just how to do it.", "मैं जानना चाहता/चाहती हूँ कि कोई चीज़ क्यों काम करती है, सिर्फ़ कैसे करना है यह नहीं।"),
    }),
    freq("S3.7", "I find it satisfying to stay with something difficult for a long time.", "किसी कठिन चीज़ पर लंबे समय तक टिके रहना मुझे संतोष देता है।"),
    freq("S3.8", "I give up on hard problems fairly quickly.", "कठिन सवालों को मैं काफ़ी जल्दी छोड़ देता/देती हूँ।", { rev: true }),
    freq("S3.9", "I can explain my reasoning clearly when someone asks how I got an answer.", "जब कोई पूछता है कि उत्तर कैसे निकाला, तो मैं अपना तर्क साफ़-साफ़ समझा सकता/सकती हूँ।"),
  ],
};

const S4: Section = {
  id: "s4",
  title: tx("What drives you", "तुम्हें क्या प्रेरित करता है"),
  items: [
    freq("S4.1", "I do schoolwork mainly because I want to understand things, not because I have to.", "मैं पढ़ाई मुख्य रूप से इसलिए करता/करती हूँ क्योंकि मैं चीज़ें समझना चाहता/चाहती हूँ, मजबूरी में नहीं।", {
      tB: tx("I do my schoolwork because I want to understand it, not only because I have to.", "मैं पढ़ाई इसलिए करता/करती हूँ क्योंकि उसे समझना चाहता/चाहती हूँ, सिर्फ़ इसलिए नहीं कि करनी पड़ती है।"),
    }),
    freq("S4.2", "I mostly work hard in order to avoid getting into trouble.", "मैं ज़्यादातर इसलिए मेहनत करता/करती हूँ ताकि डाँट या मुसीबत से बच सकूँ।", {
      rev: true,
      tB: tx("I mostly work hard so that I don’t get into trouble.", "मैं ज़्यादातर इसलिए मेहनत करता/करती हूँ ताकि डाँट न पड़े।"),
    }),
    freq("S4.3", "I choose how I spend my free time based on what genuinely interests me.", "अपना खाली समय कैसे बिताना है, यह मैं इस आधार पर चुनता/चुनती हूँ कि मुझे सच में क्या दिलचस्प लगता है।"),
    freq("S4.4", "I feel capable in most of my subjects.", "अपने ज़्यादातर विषयों में मैं खुद को सक्षम महसूस करता/करती हूँ।"),
    freq("S4.5", "I set goals for myself that nobody asked me to set.", "मैं अपने लिए ऐसे लक्ष्य बनाता/बनाती हूँ जो किसी ने मुझसे बनाने को नहीं कहा।"),
    freq("S4.6", "I keep going with things I’ve started even after they stop being enjoyable.", "जो काम शुरू किया है, उसमें मज़ा न रहने पर भी मैं उसे जारी रखता/रखती हूँ।"),
    ATTN("S4.att"),
    freq("S4.7", "I work harder when someone I respect believes I can do it.", "जब कोई जिसकी मैं इज़्ज़त करता/करती हूँ, मुझ पर भरोसा करता है, तो मैं और मेहनत करता/करती हूँ।"),
    freq("S4.8", "I’d keep working on something I care about even if nobody ever noticed.", "जिस चीज़ की मुझे परवाह है, उस पर मैं तब भी काम करता रहूँगा/करती रहूँगी जब किसी का ध्यान न जाए।"),
    freq("S4.9", "I’d rather get a high mark on something easy than learn a lot from something hard.", "कठिन चीज़ से बहुत कुछ सीखने की बजाय मुझे आसान चीज़ में अच्छे अंक लाना ज़्यादा पसंद है।", {
      rev: true,
      tB: tx("I’d rather get full marks on something easy than learn a lot from something hard.", "कठिन चीज़ से बहुत सीखने की बजाय मुझे आसान चीज़ में पूरे अंक लाना ज़्यादा पसंद है।"),
    }),
    freq("S4.10", "Being better than others matters more to me than being better than I was.", "पहले से बेहतर होने से ज़्यादा मेरे लिए दूसरों से बेहतर होना मायने रखता है।", {
      rev: true,
      tB: tx("Beating other people matters more to me than doing better than I did before.", "पहले से अच्छा करने से ज़्यादा मेरे लिए दूसरों को पीछे छोड़ना मायने रखता है।"),
    }),
    freq("S4.11", "How good you are at a subject is mostly something you’re born with.", "किसी विषय में कोई कितना अच्छा है, यह ज़्यादातर जन्म से तय होता है।", {
      rev: true,
      tB: tx("Some people are just naturally good at maths and some aren’t.", "कुछ लोग जन्म से ही गणित में अच्छे होते हैं और कुछ नहीं।"),
    }),
    freq("S4.12", "When I put in more effort, I usually improve.", "जब मैं ज़्यादा मेहनत करता/करती हूँ, तो आमतौर पर मुझमें सुधार होता है।"),
  ],
};

const S5: Section = {
  id: "s5",
  title: tx("Feelings", "भावनाएँ"),
  lead: tx("Answer these on your own. Pick what is actually true for you.", "इन्हें अकेले में भरो। वही चुनो जो तुम्हारे लिए सच में सही है।"),
  items: [
    choice(
      "S5.1",
      "When something goes badly — a test, a mistake, a disagreement — what usually happens for you?",
      "जब कुछ बुरा होता है — कोई परीक्षा, कोई गलती, कोई बहस — तो तुम्हारे साथ आमतौर पर क्या होता है?",
      [
        ["a", "I notice what I’m feeling and it settles fairly quickly on its own", "मैं समझ जाता/जाती हूँ कि मुझे कैसा लग रहा है, और वह अपने-आप जल्दी शांत हो जाता है"],
        ["b", "I feel it strongly and need time alone before I’m okay", "मुझे बहुत गहराई से महसूस होता है और ठीक होने से पहले कुछ समय अकेले रहना पड़ता है"],
        ["c", "I need to talk to someone before it settles", "शांत होने से पहले मुझे किसी से बात करनी पड़ती है"],
        ["d", "I push it down and carry on, and it comes back later", "मैं उसे दबाकर आगे बढ़ जाता/जाती हूँ, और वह बाद में फिर लौट आता है"],
      ],
      { tB: tx("When something goes badly — a test, a mistake, a fight with a friend — what usually happens?", "जब कुछ बुरा होता है — कोई परीक्षा, कोई गलती, किसी दोस्त से झगड़ा — तो आमतौर पर क्या होता है?") },
    ),
    choice("S5.2", "When you make a mistake, what is the first thing you feel?", "जब तुमसे कोई गलती होती है, तो सबसे पहले क्या महसूस होता है?", [
      ["a", "Curiosity about what went wrong", "जिज्ञासा कि क्या गलत हुआ"],
      ["b", "Frustration that passes", "झुँझलाहट, जो जल्दी चली जाती है"],
      ["c", "Embarrassment about what others will think", "शर्मिंदगी कि दूसरे क्या सोचेंगे"],
      ["d", "Guilt that stays with me for a while", "अपराध-बोध, जो कुछ समय तक बना रहता है"],
    ]),
    freq("S5.3", "I can usually name what I’m feeling.", "मैं आमतौर पर बता सकता/सकती हूँ कि मुझे क्या महसूस हो रहा है।"),
    freq("S5.4", "I stay calm when things don’t go to plan.", "जब चीज़ें योजना के मुताबिक नहीं होतीं, तब भी मैं शांत रहता/रहती हूँ।"),
    freq("S5.5", "I worry about things going wrong before they happen.", "कुछ गलत होने से पहले ही मैं उसकी चिंता करने लगता/लगती हूँ।", { rev: true }),
    freq("S5.6", "I bounce back quickly after a disappointment.", "निराशा के बाद मैं जल्दी संभल जाता/जाती हूँ।"),
    freq("S5.7", "I feel confident in some situations and much less confident in others.", "कुछ स्थितियों में मैं आत्मविश्वासी महसूस करता/करती हूँ और कुछ में बहुत कम।", {
      tB: tx("I feel confident in some places, like at home, and much less confident in others.", "कुछ जगहों पर, जैसे घर पर, मुझे आत्मविश्वास लगता है और कुछ जगहों पर बहुत कम।"),
    }),
    freq("S5.sd1", "I have never put off work I found boring.", "मैंने उबाऊ लगने वाले काम को कभी नहीं टाला।", { v: "sd" }),
    freq("S5.8", "I am hard on myself when I don’t do well.", "जब मेरा प्रदर्शन अच्छा नहीं होता, तो मैं खुद के साथ बहुत सख़्ती करता/करती हूँ।", { rev: true }),
    choice(
      "S5.9",
      "You prepared properly for something and it still went badly. A week later, what’s true?",
      "तुमने किसी चीज़ की ठीक से तैयारी की और फिर भी वह खराब गई। एक हफ़्ते बाद क्या सच है?",
      [
        ["a", "I’ve worked out what I’d change", "मैंने सोच लिया है कि अगली बार क्या बदलूँगा/बदलूँगी", 5],
        ["b", "I’ve mostly stopped thinking about it", "मैंने उसके बारे में सोचना लगभग छोड़ दिया है", 4],
        ["c", "I’m still replaying it", "मैं अब भी उसे बार-बार याद करता/करती रहता/रहती हूँ", 2],
        ["d", "I’ve started avoiding that kind of thing", "मैं उस तरह की चीज़ों से बचने लगा/लगी हूँ", 1],
      ],
      { tB: tx("You practised properly for something and it still went badly. A week later, what’s true?", "तुमने किसी चीज़ का ठीक से अभ्यास किया और फिर भी वह खराब गई। एक हफ़्ते बाद क्या सच है?") },
    ),
    freq("S5.10", "I can carry on with my day even when I’m upset about something.", "किसी बात से परेशान होने पर भी मैं अपना दिन ठीक से चला लेता/लेती हूँ।"),
  ],
};

const S6: Section = {
  id: "s6",
  title: tx("People", "लोग"),
  items: [
    freq("S6.1", "I learn more when I work with others than when I work alone.", "अकेले काम करने की बजाय दूसरों के साथ काम करने पर मैं ज़्यादा सीखता/सीखती हूँ।"),
    freq("S6.2", "I find it easy to say what I think in a group.", "समूह में अपनी बात कहना मुझे आसान लगता है।"),
    freq("S6.3", "I notice when someone in my class is being left out.", "जब कक्षा में किसी को अलग-थलग छोड़ा जाता है, तो मेरा ध्यान जाता है।"),
    freq("S6.sd2", "I have never said something unkind about a friend behind their back.", "मैंने किसी दोस्त की पीठ पीछे कभी कोई बुरी बात नहीं कही।", { v: "sd" }),
    freq("S6.4", "I can disagree with a friend without it becoming a problem.", "मैं किसी दोस्त से असहमत हो सकता/सकती हूँ, बिना उसे झगड़ा बनाए।"),
    freq("S6.5", "When I’m stuck, I ask for help early.", "जब मैं अटकता/अटकती हूँ, तो जल्दी मदद माँग लेता/लेती हूँ।"),
    freq("S6.6", "I rely on other people to get me through things I find difficult.", "जो चीज़ें कठिन लगती हैं, उन्हें पार करने के लिए मैं दूसरों पर निर्भर रहता/रहती हूँ।", { rev: true }),
    freq("S6.7", "There are people at school I feel genuinely comfortable with.", "स्कूल में कुछ लोग हैं जिनके साथ मैं सच में सहज महसूस करता/करती हूँ।"),
    freq("S6.sd3", "I have never been annoyed with a teacher.", "मुझे किसी शिक्षक पर कभी झुँझलाहट नहीं हुई।", { v: "sd" }),
    freq("S6.8", "I would speak up if I saw someone being treated unfairly.", "अगर मैं किसी के साथ अन्याय होते देखूँ, तो मैं आवाज़ उठाऊँगा/उठाऊँगी।"),
  ],
};

const S7_ITEMS: Item[] = [
  freq("S7.1", "I do what I said I would do, even when it becomes inconvenient.", "जो करने को कहा है, वह मैं करता/करती हूँ, चाहे बाद में असुविधा हो।"),
  freq("S7.2", "I finish things I start.", "जो शुरू करता/करती हूँ, उसे पूरा करता/करती हूँ।"),
  freq("S7.3", "I keep to a routine without being reminded.", "बिना याद दिलाए मैं अपनी दिनचर्या का पालन करता/करती हूँ।"),
  freq("S7.4", "If I were given credit for something I didn’t do, I would correct it.", "अगर मुझे ऐसे काम का श्रेय मिले जो मैंने नहीं किया, तो मैं सच बता दूँगा/दूँगी।", {
    tB: tx("If I got praise for something I didn’t do, I would tell the truth.", "अगर मुझे ऐसे काम की तारीफ़ मिले जो मैंने नहीं किया, तो मैं सच बता दूँगा/दूँगी।"),
  }),
  freq("S7.5", "When something goes wrong, I take responsibility rather than explaining why it wasn’t my fault.", "जब कुछ गलत होता है, तो मैं यह समझाने के बजाय कि गलती मेरी नहीं थी, अपनी ज़िम्मेदारी लेता/लेती हूँ।", {
    tB: tx("When something goes wrong, I own up to my part instead of making excuses.", "जब कुछ गलत होता है, तो मैं बहाने बनाने के बजाय अपनी गलती मान लेता/लेती हूँ।"),
  }),
  freq("S7.sd4", "I always tell the truth, even when it costs me.", "मैं हमेशा सच बोलता/बोलती हूँ, चाहे उसका नुकसान मुझे ही हो।", { v: "sd" }),
  freq("S7.6", "I start things without waiting to be asked.", "कहे जाने का इंतज़ार किए बिना मैं काम शुरू कर देता/देती हूँ।"),
  freq("S7.7", "I’d rather someone else took charge of a group task.", "समूह के काम में मुझे अच्छा लगता है कि कोई और नेतृत्व संभाले।", { rev: true }),
  freq("S7.8", "People in my class listen when I say something.", "जब मैं कुछ कहता/कहती हूँ, तो कक्षा के लोग ध्यान से सुनते हैं।"),
  freq("S7.9", "I have helped someone with no expectation of getting anything back.", "मैंने बिना कुछ वापस पाने की उम्मीद के किसी की मदद की है।"),
  freq("S7.10", "I look for ways to make things better for the people around me.", "मैं अपने आसपास के लोगों के लिए चीज़ें बेहतर बनाने के तरीके ढूँढता/ढूँढती हूँ।"),
];

/** Format E — four forced-choice pairs, Band C only, scored as tie-breakers, never as scales. */
const PAIRS: Item[] = [
  ["S7.E1", "I’d rather come up with the plan.", "मुझे योजना बनाना ज़्यादा पसंद है।", "I’d rather make sure the plan actually gets done.", "मुझे यह पक्का करना ज़्यादा पसंद है कि योजना सच में पूरी हो।"],
  ["S7.E2", "I’d rather be known for being fair.", "मैं चाहूँगा/चाहूँगी कि लोग मुझे निष्पक्ष होने के लिए जानें।", "I’d rather be known for being kind.", "मैं चाहूँगा/चाहूँगी कि लोग मुझे दयालु होने के लिए जानें।"],
  ["S7.E3", "I’d rather go deep into one thing.", "मुझे किसी एक चीज़ में गहराई तक जाना ज़्यादा पसंद है।", "I’d rather try many different things.", "मुझे कई अलग-अलग चीज़ें आज़माना ज़्यादा पसंद है।"],
  ["S7.E4", "I’d rather help one person a great deal.", "मुझे किसी एक व्यक्ति की बहुत ज़्यादा मदद करना पसंद है।", "I’d rather improve something a little for many people.", "मुझे बहुत से लोगों के लिए किसी चीज़ को थोड़ा बेहतर बनाना पसंद है।"],
].map(([k, aEn, aHi, bEn, bHi]) =>
  ({
    k,
    kind: "pair",
    t: tx("Which is more like you?", "इनमें से कौन-सा तुम्हारे ज़्यादा जैसा है?"),
    opts: [
      { v: "a", t: tx(aEn, aHi) },
      { v: "b", t: tx(bEn, bHi) },
    ],
  }) as Item,
);

const S8: Section = {
  id: "s8",
  title: tx("Direction and meaning", "दिशा और अर्थ"),
  items: [
    choice("S8.1", "When you think about life after school, which is closest to true?", "जब तुम स्कूल के बाद की ज़िंदगी के बारे में सोचते हो, तो कौन-सी बात सबसे सही है?", [
      ["a", "I have a clear picture and I roughly know how to get there", "मेरे मन में साफ़ तस्वीर है और मुझे मोटे तौर पर पता है कि वहाँ कैसे पहुँचना है", 5],
      ["b", "I have a clear picture but no idea how to get there", "मेरे मन में साफ़ तस्वीर है, पर पता नहीं कि वहाँ कैसे पहुँचूँ", 4],
      ["c", "I have a few possible directions, none of them settled", "मेरे पास कुछ संभावित दिशाएँ हैं, पर कोई तय नहीं", 3],
      ["d", "I haven’t really thought about it yet", "मैंने अभी इस बारे में ठीक से सोचा नहीं है", 2],
    ]),
    choice("S8.2", "Where does that picture mostly come from?", "यह तस्वीर ज़्यादातर कहाँ से आती है?", [
      ["own", "My own interests", "मेरी अपनी रुचियों से"],
      ["family", "What my family expects or hopes for", "मेरा परिवार जो चाहता या उम्मीद करता है, उससे"],
      ["secure", "What seems practical and secure", "जो व्यावहारिक और सुरक्षित लगता है, उससे"],
      ["peers", "What people around me are doing", "मेरे आसपास के लोग जो कर रहे हैं, उससे"],
    ]),
    freq("S8.3", "I know what matters to me, even when others disagree.", "मुझे पता है कि मेरे लिए क्या मायने रखता है, चाहे दूसरे असहमत हों।", {
      provisionalB: true,
      tB: tx("I know what is important to me, even when others think differently.", "मुझे पता है कि मेरे लिए क्या ज़रूरी है, चाहे दूसरे अलग सोचें।"),
    }),
    freq("S8.4", "I think about the kind of person I want to become, not only what I want to do.", "मैं सिर्फ़ यह नहीं सोचता/सोचती कि मुझे क्या करना है, बल्कि यह भी कि मैं कैसा इंसान बनना चाहता/चाहती हूँ।", {
      provisionalB: true,
      tB: tx("I think about what kind of person I want to be, not just what job I want.", "मैं सोचता/सोचती हूँ कि मैं कैसा इंसान बनना चाहता/चाहती हूँ, सिर्फ़ कौन-सी नौकरी नहीं।"),
    }),
    freq("S8.5", "What I’m learning now connects to something I care about.", "मैं अभी जो सीख रहा/रही हूँ, वह किसी ऐसी चीज़ से जुड़ता है जिसकी मुझे परवाह है।"),
    open(
      "S8.6",
      "Describe something you did in the last year that you’re genuinely proud of — not because someone praised you, but because of how it felt to you. What was it, and what made it matter?",
      "पिछले एक साल में तुमने ऐसा क्या किया जिस पर तुम्हें सच में गर्व है — इसलिए नहीं कि किसी ने तारीफ़ की, बल्कि इसलिए कि तुम्हें खुद कैसा लगा? वह क्या था, और वह तुम्हारे लिए क्यों मायने रखता है?",
      250,
      {
        floorB: 150,
        skippable: true,
        ex: tx(
          "“I rebuilt my cycle’s gear system myself after three failed attempts. Nobody asked me to and nobody saw it. It mattered because I’d always assumed I wasn’t a practical person.”",
          "“तीन बार असफल होने के बाद मैंने अपनी साइकिल के गियर खुद ठीक किए। किसी ने नहीं कहा था और किसी ने देखा भी नहीं। यह इसलिए मायने रखता है क्योंकि मैं हमेशा मानता था कि मैं हाथ के काम में अच्छा नहीं हूँ।”",
        ),
      },
    ),
    open(
      "S8.7",
      "If you could change one thing about how you learn — not about your school, about you — what would it be, and why hasn’t it changed yet?",
      "अगर तुम अपने सीखने के तरीके में एक चीज़ बदल सकते — स्कूल के बारे में नहीं, अपने बारे में — तो वह क्या होती, और वह अब तक क्यों नहीं बदली?",
      200,
      {
        skippable: true,
        ex: tx(
          "“I’d start revising earlier. It hasn’t changed because I only start when I’m already anxious, and then I rush.”",
          "“मैं दोहराई पहले शुरू करूँगी। यह अब तक नहीं बदला क्योंकि मैं तभी शुरू करती हूँ जब घबराहट हो चुकी होती है, और फिर जल्दबाज़ी करती हूँ।”",
        ),
      },
    ),
  ],
};

const S9: Section = {
  id: "s9",
  title: tx("Sleep, energy and screens", "नींद, ऊर्जा और स्क्रीन"),
  items: [
    choice("S9.1", "On a normal school night, roughly how many hours do you sleep?", "स्कूल वाले एक सामान्य दिन की रात तुम लगभग कितने घंटे सोते हो?", SLEEP),
    freq("S9.2", "I wake up feeling rested.", "सुबह उठकर मैं तरोताज़ा महसूस करता/करती हूँ।"),
    choice(
      "S9.3",
      "In a normal week, on how many days do you do something physically active for thirty minutes or more?",
      "एक सामान्य हफ़्ते में, कितने दिन तुम तीस मिनट या उससे ज़्यादा कोई शारीरिक गतिविधि करते हो?",
      DAYS,
    ),
    choice("S9.4", "Outside of schoolwork, roughly how many hours a day are you on a screen?", "पढ़ाई के अलावा, तुम दिन में लगभग कितने घंटे स्क्रीन पर रहते हो?", SCREEN_HOURS),
    freq("S9.5", "Screen time takes up hours I had meant to spend on something else.", "स्क्रीन पर बिताया समय वे घंटे ले लेता है जो मैंने किसी और काम के लिए सोचे थे।", {
      tB: tx("Screens take up time I had planned to use for something else.", "स्क्रीन वह समय ले लेती है जो मैंने किसी और काम के लिए सोचा था।"),
    }),
    ATTN("S9.att"),
    freq("S9.6", "I feel tense or anxious before tests.", "परीक्षा से पहले मुझे तनाव या घबराहट होती है।", { rev: true }),
    freq("S9.7", "I feel there is at least one adult at school I could go to if something was wrong.", "मुझे लगता है कि स्कूल में कम से कम एक बड़ा व्यक्ति है जिसके पास मैं कुछ गलत होने पर जा सकता/सकती हूँ।"),
    freq("S9.8", "In a normal week, I feel okay.", "एक सामान्य हफ़्ते में, मैं ठीक महसूस करता/करती हूँ।"),
  ],
};

const S10: Section = {
  id: "s10",
  title: tx("Home and time", "घर और समय"),
  items: [
    choice("S10.1", "Where do you usually study at home?", "घर पर तुम आमतौर पर कहाँ पढ़ते हो?", [
      ["a", "A quiet space that’s mine", "एक शांत जगह जो मेरी अपनी है", 5],
      ["b", "A shared space that’s usually quiet", "एक साझा जगह जो आमतौर पर शांत रहती है", 4],
      ["c", "A shared space that’s usually noisy", "एक साझा जगह जहाँ आमतौर पर शोर रहता है", 2],
      ["d", "It varies — nowhere consistent", "बदलता रहता है — कोई तय जगह नहीं", 1],
    ]),
    freq("S10.2", "I have what I need at home to study properly.", "घर पर ठीक से पढ़ने के लिए मेरे पास ज़रूरी चीज़ें हैं।"),
    multi("S10.3", "When you’re stuck on schoolwork at home, who can actually help you? Choose all that apply.", "जब घर पर पढ़ाई में अटकते हो, तो असल में कौन मदद कर पाता है? जो सही हों, सब चुनो।", [
      ["parent", "A parent", "माता या पिता"],
      ["relative", "A sibling or relative", "भाई-बहन या कोई रिश्तेदार"],
      ["tutor", "A tutor or coaching teacher", "ट्यूशन या कोचिंग के शिक्षक"],
      ["online", "Videos or the internet", "वीडियो या इंटरनेट"],
      ["nobody", "Nobody — I work it out or I leave it", "कोई नहीं — मैं खुद हल करता/करती हूँ या छोड़ देता/देती हूँ", undefined, true],
    ]),
    choice("S10.4", "How many hours a week do you spend in tuition or coaching outside school?", "स्कूल के बाहर ट्यूशन या कोचिंग में तुम हफ़्ते में कितने घंटे बिताते हो?", TUITION),
    choice("S10.5", "Which language do you mostly speak at home?", "घर पर तुम ज़्यादातर कौन-सी भाषा बोलते हो?", HOME_LANGUAGES),
    freq("S10.6", "The expectations my family has of me feel achievable.", "मेरे परिवार की मुझसे जो उम्मीदें हैं, वे पूरी करने लायक लगती हैं।", {
      tB: tx("I feel I can manage what my family expects from me.", "मुझे लगता है कि परिवार मुझसे जो उम्मीद करता है, उसे मैं संभाल सकता/सकती हूँ।"),
    }),
    freq("S10.7", "My day has enough time in it for things that aren’t schoolwork.", "मेरे दिन में पढ़ाई के अलावा दूसरी चीज़ों के लिए भी पर्याप्त समय होता है।"),
  ],
};

/** RIASEC-24 interest markers (public-domain IIP set). Interleaved; theme labels are never shown or printed. */
const RIASEC: [string, "R" | "I" | "A" | "S" | "E" | "C", string, string][] = [
  ["S11.1", "R", "Fix or assemble something mechanical", "कोई मशीनी चीज़ ठीक करना या जोड़ना"],
  ["S11.2", "I", "Work out why something happens", "यह पता लगाना कि कोई चीज़ क्यों होती है"],
  ["S11.3", "A", "Draw, paint or design something", "कुछ बनाना, रंगना या डिज़ाइन करना"],
  ["S11.4", "S", "Teach someone a skill", "किसी को कोई हुनर सिखाना"],
  ["S11.5", "E", "Persuade people to agree with an idea", "लोगों को किसी विचार पर सहमत करना"],
  ["S11.6", "C", "Organise records or files", "रिकॉर्ड या फ़ाइलें व्यवस्थित करना"],
  ["S11.7", "R", "Work with tools or equipment", "औज़ारों या उपकरणों के साथ काम करना"],
  ["S11.8", "I", "Run an experiment to test an idea", "किसी विचार को परखने के लिए प्रयोग करना"],
  ["S11.9", "A", "Write a story, script or song", "कहानी, पटकथा या गीत लिखना"],
  ["S11.10", "S", "Help someone with a personal problem", "किसी की निजी परेशानी में मदद करना"],
  ["S11.11", "E", "Lead a team towards a goal", "किसी लक्ष्य की ओर टीम का नेतृत्व करना"],
  ["S11.12", "C", "Follow a detailed procedure precisely", "किसी विस्तृत प्रक्रिया का ठीक-ठीक पालन करना"],
  ["S11.13", "R", "Build something with my hands", "अपने हाथों से कुछ बनाना"],
  ["S11.14", "I", "Analyse numbers to find a pattern", "आँकड़ों का विश्लेषण करके पैटर्न ढूँढना"],
  ["S11.15", "A", "Perform music, drama or dance", "संगीत, नाटक या नृत्य प्रस्तुत करना"],
  ["S11.16", "S", "Look after younger children", "छोटे बच्चों की देखभाल करना"],
  ["S11.17", "E", "Start and run a small venture", "कोई छोटा उद्यम शुरू करना और चलाना"],
  ["S11.18", "C", "Keep accounts or track a budget", "हिसाब-किताब रखना या बजट पर नज़र रखना"],
  ["S11.19", "R", "Work outdoors rather than indoors", "अंदर की बजाय बाहर काम करना"],
  ["S11.20", "I", "Read about a scientific idea for interest", "रुचि के लिए किसी वैज्ञानिक विचार के बारे में पढ़ना"],
  ["S11.21", "A", "Decide how something should look", "तय करना कि कोई चीज़ कैसी दिखनी चाहिए"],
  ["S11.22", "S", "Organise something for a group", "किसी समूह के लिए कुछ आयोजित करना"],
  ["S11.23", "E", "Negotiate an agreement", "बातचीत करके कोई समझौता करवाना"],
  ["S11.24", "C", "Check work carefully for errors", "काम में गलतियाँ ध्यान से जाँचना"],
];

const S11: Section = {
  id: "s11",
  title: tx("How much would you enjoy doing each of these?", "इनमें से हर काम तुम्हें कितना पसंद आएगा?"),
  lead: tx("1 means you would dislike it, 5 means you would enjoy it. Go with your first reaction.", "1 का मतलब बिल्कुल पसंद नहीं, 5 का मतलब बहुत पसंद आएगा। पहली प्रतिक्रिया के साथ जाओ।"),
  items: RIASEC.map(([k, riasec, en, hi]) => ({ k, kind: "rate", anchors: "interest", opts: RATE, riasec, t: tx(en, hi), sec: 4 }) as Item),
};

export function studentSectionsBC(band: "B" | "C", age: number): Section[] {
  const s7: Section = {
    id: "s7",
    title: tx("Character and leadership", "चरित्र और नेतृत्व"),
    items: band === "C" ? [...S7_ITEMS, ...PAIRS] : S7_ITEMS,
  };
  const s8: Section = band === "C" ? S8 : { ...S8, items: S8.items.filter((i) => i.k !== "S8.7") };
  const sections = [S1, S2, S3, S4, S5, S6, s7, s8, S9, S10];
  // RIASEC gate: hidden entirely below 12.0; shown and stored as provisional from 12.0 to 14.99.
  if (age >= 12) sections.push(S11);
  return sections;
}

/* =====================================================================================================
 * Band A student form · ages 6–10. Read aloud one-to-one by an adult who is not the child’s parent;
 * the adult enters the responses. Preference and felt-safety only; no reverse-coded items.
 * ===================================================================================================*/

export const BAND_A_STUDENT: Section[] = [
  {
    id: "a1",
    title: tx("Things you like doing", "जो काम तुम्हें पसंद हैं"),
    lead: tx("Read: “How much do you like doing each of these? Not much, a bit, or a lot?”", "पढ़ें: “इनमें से हर काम तुम्हें कितना पसंद है? ज़्यादा नहीं, थोड़ा, या बहुत?”"),
    items: [
      ["aS1.1", "Reading", "पढ़ना"],
      ["aS1.2", "Working with numbers", "अंकों के साथ काम करना"],
      ["aS1.3", "Finding out how things work", "पता लगाना कि चीज़ें कैसे काम करती हैं"],
      ["aS1.4", "Drawing or making things", "चित्र बनाना या चीज़ें बनाना"],
      ["aS1.5", "Music", "संगीत"],
      ["aS1.6", "Games and sport", "खेल-कूद"],
      ["aS1.7", "Working with friends", "दोस्तों के साथ काम करना"],
      ["aS1.8", "Working on my own", "अकेले काम करना"],
    ].map(([k, en, hi]) => ({ k, kind: "a3", opts: A3_LIKE, t: tx(en, hi) }) as Item),
  },
  {
    id: "a2",
    title: tx("At school", "स्कूल में"),
    lead: tx("Read: “Is this not like you, a bit like you, or a lot like you?”", "पढ़ें: “यह बात तुम्हारे जैसी नहीं है, थोड़ी तुम्हारे जैसी है, या बिल्कुल तुम्हारे जैसी है?”"),
    items: [
      a3("aS2.1", "I like coming to school.", "मुझे स्कूल आना अच्छा लगता है।"),
      a3("aS2.2", "I have someone to play with at break time.", "छुट्टी के समय मेरे पास खेलने के लिए कोई होता है।"),
      a3("aS2.3", "There is a grown-up at school I can talk to if something is wrong.", "स्कूल में एक बड़ा व्यक्ति है जिससे मैं कुछ गलत होने पर बात कर सकता/सकती हूँ।"),
      a3("aS2.4", "I feel okay putting my hand up in class.", "कक्षा में हाथ उठाने में मुझे ठीक लगता है।"),
      a3("aS2.5", "I worry about getting things wrong.", "मुझे गलती होने की चिंता होती है।"),
      a3("aS2.6", "Someone at school notices when I do something well.", "जब मैं कुछ अच्छा करता/करती हूँ, तो स्कूल में किसी का ध्यान जाता है।"),
    ],
  },
  {
    id: "a3",
    title: tx("When things are hard", "जब चीज़ें कठिन हों"),
    items: [
      a3("aS3.1", "I keep trying when something is hard.", "जब कुछ कठिन होता है, तब भी मैं कोशिश करता/करती रहता/रहती हूँ।"),
      a3("aS3.2", "I ask for help when I am stuck.", "जब मैं अटकता/अटकती हूँ, तो मदद माँगता/माँगती हूँ।"),
      a3("aS3.3", "I get upset when I cannot do something.", "जब मैं कुछ नहीं कर पाता/पाती, तो मैं परेशान हो जाता/जाती हूँ।"),
      a3("aS3.4", "I like trying things I have never done before.", "मुझे ऐसी चीज़ें आज़माना अच्छा लगता है जो मैंने पहले कभी नहीं कीं।"),
      a3("aS3.5", "I finish things I start.", "जो शुरू करता/करती हूँ, उसे पूरा करता/करती हूँ।"),
    ],
  },
  {
    id: "a4",
    title: tx("Wondering and noticing", "सोचना और ध्यान देना"),
    items: [
      a3("aS4.1", "I ask a lot of questions.", "मैं बहुत सारे सवाल पूछता/पूछती हूँ।"),
      a3("aS4.2", "I like finding out how things work.", "मुझे यह पता लगाना अच्छा लगता है कि चीज़ें कैसे काम करती हैं।"),
      a3("aS4.3", "I make up my own games or stories.", "मैं अपने खुद के खेल या कहानियाँ बनाता/बनाती हूँ।"),
      a3("aS4.4", "I notice things that other people do not notice.", "मैं ऐसी चीज़ें देख लेता/लेती हूँ जो दूसरों को नहीं दिखतीं।"),
    ],
  },
  {
    id: "a5",
    title: tx("Home and play", "घर और खेल"),
    items: [
      a3("aS5.1", "I sleep well at night.", "मैं रात को अच्छी नींद सोता/सोती हूँ।"),
      a3("aS5.2", "I run around or play outside a lot.", "मैं बाहर बहुत दौड़ता/दौड़ती या खेलता/खेलती हूँ।"),
      a3("aS5.3", "I watch screens a lot.", "मैं बहुत स्क्रीन देखता/देखती हूँ।"),
      a3("aS5.4", "I have a place at home where I can do my work.", "घर पर मेरे पास एक जगह है जहाँ मैं अपना काम कर सकता/सकती हूँ।"),
      a3("aS5.5", "Someone at home helps me when I am stuck.", "जब मैं अटकता/अटकती हूँ, तो घर पर कोई मेरी मदद करता है।"),
    ],
  },
  {
    id: "a6",
    title: tx("Tell me about it", "मुझे बताओ"),
    items: [
      open(
        "aS6.1",
        "Ask: “Tell me about something you made or did that made you really happy.” Type the child’s words exactly, including hesitations and self-corrections.",
        "पूछें: “मुझे किसी ऐसी चीज़ के बारे में बताओ जो तुमने बनाई या की और जिससे तुम्हें बहुत खुशी हुई।” बच्चे के शब्द ठीक वैसे ही लिखें, रुकना और खुद को सुधारना भी।",
        60,
        { skippable: true },
      ),
      choice(
        "aS6.2",
        "Administrator observation — how did the child engage with the spoken question?",
        "संचालक का अवलोकन — बच्चे ने बोले गए प्रश्न का उत्तर कैसे दिया?",
        [
          ["eager", "Answered readily and added detail on their own", "तुरंत उत्तर दिया और अपनी ओर से विस्तार जोड़ा"],
          ["steady", "Answered after a moment, with some detail", "थोड़ा रुककर, कुछ विस्तार के साथ उत्तर दिया"],
          ["prompted", "Needed one or two prompts to say more", "और बताने के लिए एक-दो बार प्रेरित करना पड़ा"],
          ["reluctant", "Said very little, even with prompting", "प्रेरित करने पर भी बहुत कम बोला"],
        ],
        { meta: true },
      ),
      open("aS6.3", "Administrator note — anything about the session that should be read alongside the answers (attention, comfort, language used).", "संचालक की टिप्पणी — सत्र के बारे में कोई बात जो उत्तरों के साथ पढ़ी जानी चाहिए (ध्यान, सहजता, प्रयुक्त भाषा)।", 0, {
        optional: true,
        meta: true,
      }),
    ],
  },
];

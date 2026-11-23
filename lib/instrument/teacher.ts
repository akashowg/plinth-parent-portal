import { choice, obs, open, tx } from "./build";
import type { Item, Section } from "./types";

/* =====================================================================================================
 * Teacher form · one class teacher or mentor · separate link.
 * Every rated item is a classroom behaviour the teacher has either seen or not seen. No items about
 * potential, promise or hope. “Not observed” is always available and carries no value.
 * ===================================================================================================*/

const T0: Section = {
  id: "t0",
  title: tx("About you", "आपके बारे में"),
  items: [
    { k: "T0.name", kind: "text", meta: true, t: tx("Your name", "आपका नाम") },
    choice("T0.role", "Your role with this student", "इस विद्यार्थी के साथ आपकी भूमिका", [
      ["class", "Class teacher", "कक्षा शिक्षक"],
      ["subject", "Subject teacher", "विषय शिक्षक"],
      ["mentor", "Mentor or counsellor", "मेंटर या परामर्शदाता"],
      ["coach", "Coach (sport, arts, activity)", "कोच (खेल, कला, गतिविधि)"],
      ["coordinator", "Coordinator or head", "समन्वयक या प्रमुख"],
    ], { meta: true }),
    { k: "T1.2", kind: "text", meta: true, t: tx("Subject or activity you teach this student", "इस विद्यार्थी को आप कौन-सा विषय या गतिविधि सिखाते हैं") },
    choice("T1.1", "How long have you taught or worked with this student?", "आप इस विद्यार्थी को कितने समय से पढ़ा रहे हैं या उसके साथ काम कर रहे हैं?", [
      ["lt_term", "Less than one term", "एक सत्र से कम"],
      ["term_year", "One term to a year", "एक सत्र से एक साल तक"],
      ["1-2y", "One to two years", "एक से दो साल"],
      ["2y+", "More than two years", "दो साल से अधिक"],
    ]),
    choice("T1.3", "Approximate size of the class in which you teach this student", "जिस कक्षा में आप इस विद्यार्थी को पढ़ाते हैं, उसका लगभग आकार", [
      ["lt25", "Under 25", "25 से कम"],
      ["25-35", "25–35", "25–35"],
      ["36-45", "36–45", "36–45"],
      ["45+", "More than 45", "45 से अधिक"],
    ]),
    {
      k: "T0.declare",
      kind: "check",
      meta: true,
      t: tx(
        "I am completing this myself, from my own classroom observation. I have not copied or been given any of the wording.",
        "मैं यह स्वयं, अपने कक्षा-अवलोकन के आधार पर भर रहा/रही हूँ। मैंने कोई शब्द नकल नहीं किए हैं और न ही किसी ने मुझे दिए हैं।",
      ),
    },
  ],
};

const T2: Section = {
  id: "t2",
  title: tx("Thinking in class", "कक्षा में सोच"),
  lead: tx("How often have you seen this student do each of these this year?", "इस साल आपने इस विद्यार्थी को इनमें से हर काम कितनी बार करते देखा है?"),
  items: [
    obs("T2.1", "Asks questions that go beyond what the syllabus requires.", "पाठ्यक्रम की ज़रूरत से आगे के प्रश्न पूछता/पूछती है।"),
    obs("T2.2", "Explains their reasoning without being asked.", "बिना पूछे अपना तर्क समझाता/समझाती है।"),
    obs("T2.3", "Applies a method learned in one context to a new kind of problem.", "एक संदर्भ में सीखा तरीका नए तरह के सवाल पर लागू करता/करती है।"),
    obs("T2.4", "Wants to understand why a method works, not only how to use it.", "जानना चाहता/चाहती है कि कोई तरीका क्यों काम करता है, सिर्फ़ उसे कैसे लगाना है यह नहीं।"),
    obs("T2.5", "Contributes ideas that other students pick up and build on.", "ऐसे विचार देता/देती है जिन्हें दूसरे विद्यार्थी अपनाकर आगे बढ़ाते हैं।"),
  ],
};

const T3: Section = {
  id: "t3",
  title: tx("Attention and work", "ध्यान और काम"),
  items: [
    obs("T3.1", "Stays focused through an ordinary class period.", "सामान्य कक्षा-अवधि में पूरे समय ध्यान बनाए रखता/रखती है।"),
    obs("T3.2", "Submits work that is complete.", "पूरा किया हुआ काम जमा करता/करती है।"),
    obs("T3.3", "Gets on with work independently when given free working time.", "स्वतंत्र काम का समय मिलने पर खुद से काम में लग जाता/जाती है।"),
    obs("T3.4", "The quality of their work holds steady across the term.", "पूरे सत्र में उसके काम की गुणवत्ता एक-सी बनी रहती है।"),
    obs("T3.5", "Adjusts calmly when a task, seating or plan changes unexpectedly.", "जब कोई काम, बैठने की जगह या योजना अचानक बदलती है, तो शांति से ढल जाता/जाती है।"),
  ],
};

const T4: Section = {
  id: "t4",
  title: tx("Difficulty and correction", "कठिनाई और सुधार"),
  items: [
    obs("T4.1", "Makes a genuine attempt at a hard question before asking for help.", "मदद माँगने से पहले कठिन प्रश्न पर सच्चा प्रयास करता/करती है।"),
    obs("T4.2", "Accepts correction without withdrawing or shutting down.", "सुधार को बिना पीछे हटे या चुप हुए स्वीकार करता/करती है।"),
    obs("T4.3", "Goes back over mistakes to understand them.", "गलतियों को समझने के लिए उन्हें दोबारा देखता/देखती है।"),
    obs("T4.4", "Keeps trying after a poor result rather than giving up on the subject.", "कम अंक आने के बाद विषय छोड़ देने के बजाय कोशिश जारी रखता/रखती है।"),
  ],
};

const T5: Section = {
  id: "t5",
  title: tx("With classmates", "सहपाठियों के साथ"),
  items: [
    obs("T5.1", "Is sought out by classmates for help.", "सहपाठी मदद के लिए उसके पास आते हैं।"),
    obs("T5.2", "Includes classmates who are on the edge of the group.", "समूह के किनारे रह गए सहपाठियों को शामिल करता/करती है।"),
    obs("T5.3", "Is comfortable disagreeing openly in class discussion.", "कक्षा की चर्चा में खुलकर असहमति जताने में सहज है।"),
  ],
};

const T6: Section = {
  id: "t6",
  title: tx("Initiative and voice", "पहल और अभिव्यक्ति"),
  items: [
    obs("T6.1", "Volunteers to answer, present or take on a task.", "उत्तर देने, प्रस्तुति करने या कोई काम लेने के लिए खुद आगे आता/आती है।"),
    obs("T6.2", "Takes responsibility for their part in group work.", "समूह-कार्य में अपने हिस्से की ज़िम्मेदारी लेता/लेती है।"),
    obs("T6.3", "Raises concerns — about fairness, a problem, or being stuck — in an appropriate way.", "चिंताएँ — निष्पक्षता, किसी समस्या, या अटकने के बारे में — उचित तरीके से रखता/रखती है।"),
  ],
};

/** Band A additions — primary-years observation where the teacher is a co-primary source. */
const T9: Section = {
  id: "t9",
  title: tx("Primary-years observation", "प्राथमिक कक्षाओं का अवलोकन"),
  items: [
    choice("T9.1", "At break, this child usually plays…", "छुट्टी के समय यह बच्चा आमतौर पर खेलता/खेलती है…", [
      ["group", "in a larger group", "बड़े समूह में"],
      ["few", "with one or two friends", "एक-दो दोस्तों के साथ"],
      ["alone_choice", "alone, and seems content", "अकेले, और संतुष्ट लगता/लगती है"],
      ["edge", "on the edge, appearing to want to join", "किनारे पर, शामिल होना चाहता/चाहती लगता/लगती है"],
      ["na", "Not observed", "देखा नहीं"],
    ]),
    choice("T9.2", "When joining children who are already playing or working, this child…", "जब पहले से खेल रहे या काम कर रहे बच्चों में शामिल होना हो, तो यह बच्चा…", [
      ["easy", "joins easily", "आसानी से शामिल हो जाता/जाती है", 5],
      ["waits", "waits, then joins", "रुकता/रुकती है, फिर शामिल होता/होती है", 4],
      ["adult", "needs an adult to help them join", "शामिल होने के लिए किसी बड़े की मदद चाहिए", 2],
      ["rarely", "usually doesn’t join", "आमतौर पर शामिल नहीं होता/होती", 1],
      ["na", "Not observed", "देखा नहीं"],
    ]),
    choice("T9.3", "Confidence with fine-motor tasks — writing, cutting, colouring:", "बारीक हाथ के कामों में आत्मविश्वास — लिखना, काटना, रंग भरना:", [
      ["confident", "Confident", "आत्मविश्वासी"],
      ["expected", "Developing as expected for the class", "कक्षा के अनुसार अपेक्षित रूप से विकसित हो रहा है"],
      ["effortful", "Effortful", "प्रयास माँगता है"],
      ["avoids", "Tends to avoid these tasks", "इन कामों से बचता/बचती है"],
      ["na", "Not observed", "देखा नहीं"],
    ]),
    choice("T9.4", "Confidence with whole-body movement — running, climbing, ball games:", "पूरे शरीर की गतिविधियों में आत्मविश्वास — दौड़ना, चढ़ना, गेंद के खेल:", [
      ["confident", "Confident", "आत्मविश्वासी"],
      ["expected", "Developing as expected for the class", "कक्षा के अनुसार अपेक्षित रूप से विकसित हो रहा है"],
      ["effortful", "Effortful", "प्रयास माँगता है"],
      ["avoids", "Tends to avoid these activities", "इन गतिविधियों से बचता/बचती है"],
      ["na", "Not observed", "देखा नहीं"],
    ]),
    obs("T9.5", "Moves from one activity to the next without difficulty.", "एक गतिविधि से दूसरी पर बिना कठिनाई के चला/चली जाता/जाती है।"),
    choice("T9.6", "On an adult-led task, roughly how long does this child’s attention hold?", "किसी बड़े के नेतृत्व वाले काम पर, इस बच्चे का ध्यान लगभग कितनी देर टिकता है?", [
      ["lt5", "Under 5 minutes", "5 मिनट से कम", 1],
      ["5-10", "5–10 minutes", "5–10 मिनट", 2],
      ["10-20", "10–20 minutes", "10–20 मिनट", 4],
      ["20+", "More than 20 minutes", "20 मिनट से अधिक", 5],
      ["na", "Not observed", "देखा नहीं"],
    ]),
    obs("T9.7", "Listens to and follows instructions given to the whole group.", "पूरे समूह को दिए गए निर्देश सुनता/सुनती है और उनका पालन करता/करती है।"),
    choice("T9.8", "Spoken expression compared with classmates:", "सहपाठियों की तुलना में बोलकर अपनी बात कहना:", [
      ["above", "Clearly more developed than most", "ज़्यादातर से साफ़ तौर पर अधिक विकसित"],
      ["similar", "Similar to most", "ज़्यादातर के समान"],
      ["below", "Somewhat less developed than most", "ज़्यादातर से कुछ कम विकसित"],
      ["well_below", "Much less developed than most", "ज़्यादातर से काफ़ी कम विकसित"],
      ["na", "Not observed", "देखा नहीं"],
    ]),
    choice("T9.9", "After break, this child settles back into class work…", "छुट्टी के बाद यह बच्चा कक्षा के काम में वापस लगता/लगती है…", [
      ["quick", "within a couple of minutes", "कुछ ही मिनटों में", 5],
      ["while", "after a short while", "थोड़ी देर बाद", 4],
      ["slow", "slowly, with reminders", "धीरे-धीरे, याद दिलाने पर", 2],
      ["hard", "with real difficulty", "बहुत कठिनाई से", 1],
      ["na", "Not observed", "देखा नहीं"],
    ]),
  ],
};

const T7: Section = {
  id: "t7",
  title: tx("This year", "इस साल"),
  items: [
    choice("T7.1", "This student’s trajectory in your subject or activity over this year:", "इस साल आपके विषय या गतिविधि में इस विद्यार्थी की प्रगति की दिशा:", [
      ["improving", "Improving", "सुधर रही है"],
      ["steady", "Steady", "स्थिर है"],
      ["declining", "Declining", "घट रही है"],
      ["inconsistent", "Inconsistent", "अस्थिर है"],
      ["na", "I haven’t taught them long enough to say", "इतना समय नहीं पढ़ाया कि बता सकूँ"],
    ]),
    open(
      "T8.1",
      "Describe one specific moment this year when this student surprised you — in either direction. What actually happened?",
      "इस साल का कोई एक खास पल बताइए जब इस विद्यार्थी ने आपको चौंकाया — किसी भी दिशा में। असल में क्या हुआ था?",
      200,
      {
        help: tx(
          "An event, not an assessment. A surprise that went the other way is just as useful.",
          "एक घटना, कोई मूल्यांकन नहीं। उलटी दिशा का आश्चर्य भी उतना ही उपयोगी है।",
        ),
        ex: tx(
          "“During a group experiment the burner wouldn’t light. While others waited for me, she checked the gas valve, found it half-closed and fixed it — then explained to her group why the flame had been uneven the day before.”",
          "“समूह-प्रयोग के दौरान बर्नर नहीं जल रहा था। जब बाकी मेरा इंतज़ार कर रहे थे, उसने गैस वाल्व जाँचा, उसे आधा बंद पाया और ठीक किया — फिर अपने समूह को समझाया कि पिछले दिन लौ असमान क्यों थी।”",
        ),
      },
    ),
    open(
      "T8.2",
      "Is there anything about this student’s wellbeing you think the PLINTH reviewer should know? (Optional — this goes only to the reviewer, never into the dossier text.)",
      "क्या इस विद्यार्थी की भलाई के बारे में कोई बात है जो आपके अनुसार PLINTH समीक्षक को पता होनी चाहिए? (वैकल्पिक — यह केवल समीक्षक तक जाती है, डोज़ियर के पाठ में कभी नहीं।)",
      0,
      { optional: true, reviewerOnly: true },
    ),
  ],
};

export function teacherSections(band: "A" | "B" | "C"): Section[] {
  const s = [T0, T2, T3, T4, T5, T6];
  if (band === "A") s.push(T9);
  s.push(T7);
  return s;
}

export const TEACHER_IDENTITY_KEYS = ["T0.name", "T0.role", "T1.2"] as const;
export type TeacherItem = Item;

/** Safeguarding lexicon corpus test: npx tsx tests/lexicon.test.ts */
import { scanText } from "../lib/instrument/lexicon";

type Case = [string, string | null, ("urgent" | "concern")?]; // text, expected category (null = no match), expected severity
const positives: Case[] = [
  // Nine further portal languages (native script). Starter cases; native safeguarding reviewers extend these.
  ["মাঝে মাঝে মনে হয় মরে যেতে চাই", "self_harm", "urgent"],
  ["বাবা আমাকে বেল্ট দিয়ে মারে", "physical_abuse", "urgent"],
  ["ক্লাসের একটা ছেলে আমাকে মারে", "physical_abuse", "concern"],
  ["মা আমাকে রোজ মারে", "physical_abuse", "urgent"],
  ["ସାଙ୍ଗ ମୋତେ ମାରେ", "physical_abuse", "concern"],
  ["কাকু আমাকে খারাপভাবে ছোঁয়", "sexual_abuse", "urgent"],
  ["বাড়িতে খেতে দেয় না", "neglect", "urgent"],
  ["कधी कधी मरावंसं वाटतं", "self_harm", "urgent"],
  ["बाबा मला पट्ट्याने मारतात", "physical_abuse", "urgent"],
  ["मला जेवायला देत नाहीत", "neglect", "urgent"],
  ["సార్ నన్ను తప్పుగా తాకుతారు", "sexual_abuse", "urgent"],
  ["నాకు బతకాలని లేదు", "self_harm", "urgent"],
  ["నాన్న నన్ను కర్రతో కొడతారు", "physical_abuse", "urgent"],
  ["எனக்கு வாழப் பிடிக்கவில்லை", "self_harm", "urgent"],
  ["அப்பா என்னை அடிக்கிறார்", "physical_abuse", "urgent"],
  ["வகுப்பில் எல்லோரும் என்னைக் கேலி செய்கிறார்கள்", "bullying", "concern"],
  ["મને જીવવું નથી", "self_harm", "urgent"],
  ["પપ્પા મને પટ્ટાથી મારે છે", "physical_abuse", "urgent"],
  ["ઘરે મારા લગ્ન નક્કી કરી દીધા છે", "exploitation", "urgent"],
  ["کبھی کبھی میں مرنا چاہتا ہوں", "self_harm", "urgent"],
  ["ابو مجھے بیلٹ سے مارتے ہیں", "physical_abuse", "urgent"],
  ["وہ کہتے ہیں کسی کو مت بتانا", "emotional_abuse", "concern"],
  ["ನನಗೆ ಬದುಕಲು ಇಷ್ಟವಿಲ್ಲ", "self_harm", "urgent"],
  ["ಅಪ್ಪ ನನಗೆ ಕೋಲಿನಿಂದ ಹೊಡೆಯುತ್ತಾರೆ", "physical_abuse", "urgent"],
  ["ಮನೆಯಲ್ಲಿ ಊಟ ಕೊಡುವುದಿಲ್ಲ", "neglect", "urgent"],
  ["ମୁଁ ମରିଯିବାକୁ ଚାହେଁ", "self_harm", "urgent"],
  ["ବାପା ମୋତେ ବେଲ୍ଟରେ ମାରନ୍ତି", "physical_abuse", "urgent"],
  ["ଘରକୁ ଯିବାକୁ ଡର ଲାଗେ", "fear_of_home", "concern"],
  ["എനിക്ക് ജീവിക്കാൻ തോന്നുന്നില്ല", "self_harm", "urgent"],
  ["അച്ഛൻ എന്നെ ബെൽറ്റ് കൊണ്ട് അടിക്കും", "physical_abuse", "urgent"],
  ["ക്ലാസിൽ എല്ലാവരും എന്നെ കളിയാക്കുന്നു", "bullying", "concern"],
  ["എന്നെ ബെല്‍റ്റ് കൊണ്ട് അടിക്കും", "physical_abuse"],

  ["Sometimes I just want to die.", "self_harm", "urgent"],
  ["i wanna die tbh", "self_harm", "urgent"],
  ["I have thought about killing myself.", "self_harm", "urgent"],
  ["I cut myself when exams go badly", "self_harm", "urgent"],
  ["I wish I was never born", "self_harm", "urgent"],
  ["everyone would be better off without me", "self_harm", "urgent"],
  ["I don't want to wake up tomorrow", "self_harm", "urgent"],
  ["I feel like ending it all", "self_harm", "urgent"],
  ["i want to dieeee", "self_harm", "urgent"],
  ["k1ll myself", "self_harm", "urgent"],
  ["Mujhe kabhi kabhi marna chahta hoon aisa lagta hai", "self_harm", "urgent"],
  ["main mar jaunga agar fail hua", "self_harm", "urgent"],
  ["khudkushi ka khayal aata hai", "self_harm", "urgent"],
  ["कभी-कभी मैं मरना चाहती हूँ", "self_harm", "urgent"],
  ["मुझे जीने का मन नहीं करता", "self_harm", "urgent"],
  ["मैंने खुद को चोट पहुँचाई", "self_harm", "urgent"],
  ["आत्महत्या के बारे में सोचता हूँ", "self_harm", "urgent"],
  ["My uncle touches me in a bad way", "sexual_abuse", "urgent"],
  ["he touched my private parts", "sexual_abuse", "urgent"],
  ["Someone online asked me for nude photos", "sexual_abuse", "urgent"],
  ["tuition sir galat tarike se chhuta hai", "sexual_abuse", "urgent"],
  ["वो मुझे गलत तरीके से छूते हैं", "sexual_abuse", "urgent"],
  ["My father beats me every day", "physical_abuse", "urgent"],
  ["mummy belt se maarti hai", "physical_abuse", "urgent"],
  ["पापा मुझे मारते हैं", "physical_abuse", "urgent"],
  ["Papa mujhe peet te hain roz", "physical_abuse", "urgent"],
  ["a boy in my class hit me", "physical_abuse", "concern"],
  ["They lock me in the room when guests come", "emotional_abuse", "concern"],
  ["My mother threatens to send me away", "emotional_abuse", "urgent"],
  ["Sometimes they don't give me food", "neglect", "urgent"],
  ["I often go to bed hungry", "neglect", "urgent"],
  ["घर पर खाना नहीं देते", "neglect", "urgent"],
  ["My parents are getting me married after class 10", "exploitation", "urgent"],
  ["मेरी शादी करवा रहे हैं", "exploitation", "urgent"],
  ["They made me work in the shop instead of school", "exploitation", "urgent"],
  ["Seniors are ragging me every day", "bullying", "concern"],
  ["someone morphed my photo and is blackmailing me", "bullying", "concern"],
  ["Everyone laughs at me in class", "bullying", "concern"],
  ["I am scared to go home after school", "fear_of_home", "concern"],
  ["I want to run away", "fear_of_home", "concern"],
  ["ghar se bhaag jaana chahta hoon", "fear_of_home", "concern"],
  ["My friends and I drink alcohol on weekends", "substance", "concern"],
  ["nasha karta hoon kabhi kabhi", "substance", "concern"],
  ["Nobody cares about me", "distress", "concern"],
  ["I can't take it anymore", "distress", "concern"],
  ["koi parwah nahi karta", "distress", "concern"],
  ["कोई परवाह नहीं करता मेरी", "distress", "concern"],
  ["I'm a burden to my family", "distress", "concern"],
  ["I sometimes think about not being here anymore", "self_harm", "urgent"],
  ["Everyone would be happier if I was gone", "self_harm", "urgent"],
  ["I just want to sleep and never wake up", "self_harm", "urgent"],
  ["मेरे बिना सब खुश रहेंगे", "self_harm", "urgent"],
  ["Bhaiya touches me when no one is home and says don't tell", "sexual_abuse", "urgent"],
  ["My stepfather hits me with a belt", "physical_abuse", "urgent"],
  ["My teacher slapped me in front of everyone", "physical_abuse", "urgent"],
  ["Our class topic was child labour in factories", "exploitation", "concern"],
];
const negatives: string[] = [
  // Benign sentences in the nine languages, including near-misses.
  "মা আমাকে রান্না শেখায়, আমার খুব ভালো লাগে।",
  "আমি ড্রাগন আঁকতে ভালোবাসি।",
  "आई मला रोज गोष्ट सांगते.",
  "నేను మత్తుగా నిద్రపోయాను, పరీక్ష బాగా రాశాను.",
  "అమ్మ నాకు రోజూ కథలు చెబుతుంది.",
  "அம்மா என்னை அடிக்கடி பாராட்டுவார்.",
  "મને મારી બહેન સાથે રમવું ગમે છે.",
  "میں روز کرکٹ کھیلتا ہوں اور مجھے سائنس پسند ہے۔",
  "ಅಮ್ಮ ನನಗೆ ಪ್ರತಿದಿನ ಕಥೆ ಹೇಳುತ್ತಾರೆ.",
  "ମୁଁ ସାଇକେଲ ଠିକ୍ କରିବାକୁ ଭଲ ପାଏ।",
  "എനിക്ക് ചിത്രം വരയ്ക്കാൻ ഇഷ്ടമാണ്.",

  "This homework is killing me but I finished it.",
  "I died laughing at my brother's joke.",
  "My sister beat me at chess yesterday.",
  "Riya beats me in every race, so I practise more.",
  "The movie was a killer.",
  "I love cutting vegetables with my mother.",
  "I hurt my knee playing football.",
  "Our class studied the water cycle.",
  "I feel dead tired after tuition.",
  "I want to be a doctor and help people.",
  "मुझे क्रिकेट खेलना बहुत पसंद है।",
  "मैं रोज़ सुबह दौड़ने जाता हूँ।",
  "Papa helps me with maths every night.",
  "I hit the ball very hard in the final over.",
  "The drama club is the best part of my week.",
  "I was nervous before the exam but it went fine.",
  "My mother scolded me when I came home late.",
  "I get high marks in science.",
  "I am so done with this chapter lol",
  "Exams are a nightmare but I'll survive",
  "My dog died last year and I still miss him",
  "I want to disappear into a good book",
];
let fail = 0;
for (const [text, cat, sev] of positives) {
  const hits = scanText(text);
  const hit = hits.find((h) => h.category === cat);
  const ok = !!hit && (!sev || hit.severity === sev);
  if (!ok) {
    fail++;
    console.log("MISS ", JSON.stringify(text), "→", hits.map((h) => `${h.category}/${h.severity}`).join(", ") || "nothing", `(expected ${cat}/${sev})`);
  }
}
let fp = 0;
for (const text of negatives) {
  const hits = scanText(text);
  if (hits.length) {
    fp++;
    console.log("FALSE", JSON.stringify(text), "→", hits.map((h) => `${h.category}/${h.severity} "${h.phrase}"`).join(", "));
  }
}
const ctx = scanText("I have never wanted to hurt myself.")[0];
console.log("context tags for a negated sentence:", ctx?.tags);
const story = scanText("In the story, the girl wants to die after the war.")[0];
console.log("context tags for a story:", story?.tags);
console.log(`\npositives ${positives.length - fail}/${positives.length} · false alarms on benign sentences ${fp}/${negatives.length}`);
process.exit(fail ? 1 : 0);

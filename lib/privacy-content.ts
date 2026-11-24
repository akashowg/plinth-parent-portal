/** Privacy notice text (English and Hindi; other languages via the catalogs). */
export type Block = { h: string; p: string[] };

export function privacyContent(lang: "en" | "hi", contact: string): { title: string; version: string; blocks: Block[] } {
  if (lang === "hi") {
    return {
      title: "गोपनीयता सूचना",
      version: "संस्करण 4 · 24 नवंबर 2026",
      blocks: [
        { h: "हम कौन हैं", p: [`PLINTH Network यह पोर्टल चलाता है और आपकी दी गई जानकारी के लिए ज़िम्मेदार है। संपर्क: ${contact}`] },
        {
          h: "हम क्या एकत्र करते हैं",
          p: [
            "आपके बारे में: नाम, बच्चे से संबंध, ईमेल, और वैकल्पिक रूप से WhatsApp नंबर।",
            "आपके बच्चे के बारे में: नाम, जन्म तिथि, कक्षा, शहर, राज्य, और आपके, आपके बच्चे के तथा एक शिक्षक के फ़ॉर्म में दिए उत्तर।",
            "सहमति का रिकॉर्ड: सहमति का समय, सूचना का संस्करण, और आपके IP पते का एक-तरफ़ा हैश।",
            "फ़ॉर्म रोज़मर्रा के व्यवहार, सीखने, भावनाओं, दोस्ती, नींद, शारीरिक गतिविधि, स्क्रीन समय, ट्यूशन के घंटों और घर की भाषा के बारे में पूछते हैं। हम अंक, कोई निदान या चिकित्सा इतिहास नहीं माँगते।",
            "6–10 वर्ष के बच्चों के प्रश्न एक प्रशिक्षित वयस्क पढ़कर सुनाते हैं जो माता-पिता नहीं हैं; उनका नाम और भूमिका सहमति रिकॉर्ड में रखी जाती है।",
          ],
        },
        {
          h: "हम इसका उपयोग क्यों करते हैं",
          p: [
            "केवल आपके परिवार के लिए विकासात्मक डोज़ियर तैयार करने के लिए, और — यदि आप आगे जारी रखें — बाद के डोज़ियर में समय के साथ हुए बदलाव दिखाने के लिए।",
            "हम आपके बच्चे को विज्ञापन नहीं दिखाते, विज्ञापन के लिए प्रोफ़ाइल नहीं बनाते, और जानकारी नहीं बेचते।",
          ],
        },
        {
          h: "जानकारी कौन प्रोसेस करता है",
          p: [
            "PLINTH के सेवा प्रदाता: होस्टिंग (Vercel), डेटाबेस, ईमेल (Google Gmail), और डोज़ियर का प्रारूप तैयार करने के लिए AI मॉडल (Anthropic का Claude)। इनमें से कुछ भारत के बाहर जानकारी प्रोसेस कर सकते हैं।",
            "यदि आप टाइप करने के बजाय उत्तर बोलना चुनते हैं, तो बोली को Sarvam AI, एक भारतीय वाक् सेवा, लिखित रूप में बदलती है; जहाँ वह उपलब्ध न हो, वहाँ आपके ब्राउज़र की अपनी वाक् सेवा (Android और Chrome पर Google, iPhone और Mac पर Apple)। Sarvam के साथ, ऑडियो के छोटे हिस्से PLINTH के सर्वर से होकर Sarvam तक जाते हैं और लिखित रूप में लौटते हैं; न PLINTH और न Sarvam ऑडियो रखता है। केवल वही लिखित उत्तर सहेजा जाता है जिसे आप जाँचकर पुष्टि करते हैं। कैमरा विकल्प केवल आपको आपकी छवि दिखाता है और रिकॉर्ड नहीं होता।",
            "हर डोज़ियर आपको भेजे जाने से पहले PLINTH का एक व्यक्ति पढ़ता और स्वीकृत करता है।",
            "आपके उत्तर आपके बच्चे के स्कूल के साथ साझा नहीं किए जाते, नीचे दी गई सुरक्षा स्थिति को छोड़कर। शिक्षक आपके उत्तर नहीं देखते, आप शिक्षक के या अपने बच्चे के उत्तर नहीं देखते, और बच्चा आपके उत्तर नहीं देखता।",
          ],
        },
        {
          h: "सुरक्षा (सेफ़गार्डिंग)",
          p: [
            "PLINTH मानसिक स्वास्थ्य की जाँच नहीं करता। फिर भी, यदि किसी उत्तर से लगे कि बच्चे को सहायता की आवश्यकता हो सकती है, तो PLINTH के एक नामित व्यक्ति को सूचित किया जाता है, जो सावधानी से तय करते हैं कि किसे जानना ज़रूरी है — इसमें स्कूल का परामर्शदाता या पैस्टोरल प्रमुख शामिल हो सकते हैं।",
            "ऐसे उत्तर डोज़ियर में कभी नहीं लिखे जाते और AI को कभी नहीं भेजे जाते।",
          ],
        },
        {
          h: "सुरक्षा और अवधि",
          p: [
            "उत्तर और व्यक्तिगत विवरण एन्क्रिप्ट करके संग्रहीत किए जाते हैं।",
            "जब तक आप अपने बच्चे के लिए PLINTH का उपयोग करते हैं, हम जानकारी रखते हैं। सहमति वापस लेने पर इस पोर्टल से उत्तर तुरंत हटा दिए जाते हैं, और PLINTH की कार्य-प्रतियों से 30 दिनों के भीतर।",
          ],
        },
        {
          h: "आपके अधिकार",
          p: [
            "आप अपनी जानकारी का सारांश माँग सकते हैं, उसे सुधरवा सकते हैं, उसे हटवा सकते हैं, और कभी भी सहमति वापस ले सकते हैं — प्रोफ़ाइल पेज से या हमें लिखकर।",
            `शिकायत के लिए पहले हमसे संपर्क करें: ${contact}। यदि समाधान न हो, तो आप भारत के डेटा संरक्षण बोर्ड से संपर्क कर सकते हैं।`,
          ],
        },
      ],
    };
  }
  return {
    title: "Privacy notice",
    version: "Version 4 · 24 November 2026",
    blocks: [
      { h: "Who we are", p: [`PLINTH Network runs this portal and is responsible for the information you give it. Contact: ${contact}`] },
      {
        h: "What we collect",
        p: [
          "About you: your name, relationship to the child, email, and optionally a WhatsApp number.",
          "About your child: name, date of birth, class, city, state, and the answers given in your form, your child’s form and one teacher’s form.",
          "Your consent record: when consent was given, the version of this notice, and a one-way hash of your IP address.",
          "The forms ask about everyday behaviour, learning, feelings, friendships, sleep, physical activity, screen time, tuition hours and home language. We do not ask for marks, a diagnosis or medical history.",
          "For children aged 6–10, a trained adult who is not a parent reads the child’s questions aloud; their name and role are kept in the consent record.",
        ],
      },
      {
        h: "Why we use it",
        p: [
          "Only to prepare a developmental dossier for your family and, if you continue with PLINTH, to show change over time in later dossiers.",
          "We do not show your child advertising, build advertising profiles, or sell any information.",
        ],
      },
      {
        h: "Who processes it",
        p: [
          "PLINTH’s service providers: hosting (Vercel), the database, email (Google Gmail), and an AI model that drafts the dossier (Claude, by Anthropic). Some of them may process information outside India.",
          "A person at PLINTH reads and approves every dossier before it is sent to you.",
          "If you choose to speak an answer instead of typing it, the speech is turned into text by Sarvam AI, an Indian speech service, or, where that is not available, by your browser’s own speech service (Google on Android and Chrome, Apple on iPhone and Mac). With Sarvam, short pieces of audio pass through PLINTH’s server to Sarvam and come back as text; neither PLINTH nor Sarvam keeps the audio. Only the text you check and confirm is saved. The camera option shows you a mirror of yourself and is not recorded.",
          "Your answers are not shared with your child’s school, except as described under safeguarding below. The teacher does not see your answers; you do not see the teacher’s or your child’s; your child does not see yours.",
        ],
      },
      {
        h: "Safeguarding",
        p: [
          "PLINTH does not screen for mental health. But if an answer suggests a child may need support, a named person at PLINTH is alerted and decides, with care, who needs to know — which may include the school counsellor or pastoral lead.",
          "Those answers are never written into the dossier and never sent to the AI model.",
        ],
      },
      {
        h: "Security and how long we keep it",
        p: [
          "Answers and personal details are stored encrypted.",
          "We keep the information while you use PLINTH for your child. If you withdraw consent, answers are deleted from this portal immediately and from PLINTH’s working copies within 30 days.",
        ],
      },
      {
        h: "Your rights",
        p: [
          "You can ask for a summary of your information, have it corrected, have it erased, and withdraw consent at any time — from the profile page or by writing to us.",
          `For a grievance, contact us first at ${contact}. If it is not resolved, you can approach the Data Protection Board of India.`,
        ],
      },
    ],
  };
}


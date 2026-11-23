import { getLang } from "@/lib/lang";
import { optionalEnv } from "@/lib/env";

export const dynamic = "force-dynamic";

type Block = { h: string; p: string[] };

function content(lang: "en" | "hi", contact: string): { title: string; version: string; blocks: Block[] } {
  if (lang === "hi") {
    return {
      title: "गोपनीयता सूचना",
      version: "संस्करण 1 · 23 नवंबर 2026",
      blocks: [
        { h: "हम कौन हैं", p: [`PLINTH Network यह पोर्टल चलाता है और आपकी दी गई जानकारी के लिए ज़िम्मेदार है। संपर्क: ${contact}`] },
        {
          h: "हम क्या एकत्र करते हैं",
          p: [
            "आपके बारे में: नाम, बच्चे से संबंध, ईमेल, और वैकल्पिक रूप से WhatsApp नंबर।",
            "आपके बच्चे के बारे में: नाम, जन्म तिथि, कक्षा, शहर, राज्य, और आपके, आपके बच्चे के तथा एक शिक्षक के फ़ॉर्म में दिए उत्तर।",
            "सहमति का रिकॉर्ड: सहमति का समय, सूचना का संस्करण, और आपके IP पते का एक-तरफ़ा हैश।",
            "हम अंक, स्क्रीन उपयोग या चिकित्सा जानकारी नहीं माँगते।",
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
            "PLINTH के सेवा प्रदाता: होस्टिंग (Vercel), डेटाबेस, ईमेल (Resend), और डोज़ियर का प्रारूप तैयार करने के लिए AI मॉडल (Anthropic का Claude)। इनमें से कुछ भारत के बाहर जानकारी प्रोसेस कर सकते हैं।",
            "हर डोज़ियर आपको भेजे जाने से पहले PLINTH का एक व्यक्ति पढ़ता और स्वीकृत करता है।",
            "आपके उत्तर आपके बच्चे के स्कूल के साथ साझा नहीं किए जाते। शिक्षक आपके उत्तर नहीं देखते, और आप शिक्षक के उत्तर नहीं देखते।",
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
    version: "Version 1 · 23 November 2026",
    blocks: [
      { h: "Who we are", p: [`PLINTH Network runs this portal and is responsible for the information you give it. Contact: ${contact}`] },
      {
        h: "What we collect",
        p: [
          "About you: your name, relationship to the child, email, and optionally a WhatsApp number.",
          "About your child: name, date of birth, class, city, state, and the answers given in your form, your child’s form and one teacher’s form.",
          "Your consent record: when consent was given, the version of this notice, and a one-way hash of your IP address.",
          "We do not ask for marks, screen use or medical information.",
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
          "PLINTH’s service providers: hosting (Vercel), the database, email (Resend), and an AI model that drafts the dossier (Claude, by Anthropic). Some of them may process information outside India.",
          "A person at PLINTH reads and approves every dossier before it is sent to you.",
          "Your answers are not shared with your child’s school. The teacher does not see your answers, and you do not see the teacher’s.",
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

export default async function Privacy() {
  const lang = await getLang();
  const contact = optionalEnv("CONTACT_EMAIL") ?? "the email address on your PLINTH messages";
  const c = content(lang, contact);
  return (
    <div className="wrap">
      <span className="kicker">PLINTH Network</span>
      <h1>{c.title}</h1>
      <p className="muted">{c.version}</p>
      {c.blocks.map((b) => (
        <div className="section" key={b.h} style={{ marginTop: 24 }}>
          <h2>{b.h}</h2>
          {b.p.map((p) => (
            <p key={p} style={{ margin: 0, color: "var(--slate)" }}>{p}</p>
          ))}
        </div>
      ))}
    </div>
  );
}

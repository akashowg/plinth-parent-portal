import { getLang } from "@/lib/lang";
import { isolate } from "@/lib/i18n/langs";
import { optionalEnv } from "@/lib/env";
import { privacyContent } from "@/lib/privacy-content";
import { tr } from "@/lib/i18n/translate";

export const dynamic = "force-dynamic";

export default async function Privacy() {
  const lang = await getLang();
  const contact = optionalEnv("CONTACT_EMAIL") ?? "the email address on your PLINTH messages";
  // Other languages translate the English notice; {contact} is filled in after translation.
  const raw = privacyContent(lang === "hi" ? "hi" : "en", "{contact}");
  const L = (x: string) => (lang === "hi" ? x : tr(lang, x)).replaceAll("{contact}", isolate(lang, contact));
  const c = { title: L(raw.title), version: L(raw.version), blocks: raw.blocks.map((b) => ({ h: L(b.h), p: b.p.map(L) })) };
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

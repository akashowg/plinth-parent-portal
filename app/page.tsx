import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";

export default async function Home() {
  const lang = await getLang();
  return (
    <div className="wrap-wide">
      <section className="hero">
        <div>
          <span className="kicker">{t(lang, "kicker")}</span>
          <h1>{t(lang, "heroTitle")}</h1>
          <p className="lead">{t(lang, "heroLead")}</p>
          <div className="cta-row">
            <a className="btn" href="/start">
              {t(lang, "begin")}
            </a>
            <a className="link-btn" href="/login">
              {t(lang, "alreadyStarted")}
            </a>
          </div>
        </div>
        <div className="hero-mark" aria-hidden="true">
          <img src="/plinth-logo-icon-navy.svg" alt="" />
        </div>
      </section>

      <h2 style={{ marginTop: 56 }}>{t(lang, "howTitle")}</h2>
      <div className="steps">
        <div className="step">
          <span className="num">01</span>
          <h3>{t(lang, "how1t")}</h3>
          <p>{t(lang, "how1")}</p>
        </div>
        <div className="step">
          <span className="num">02</span>
          <h3>{t(lang, "how2t")}</h3>
          <p>{t(lang, "how2")}</p>
        </div>
        <div className="step">
          <span className="num">03</span>
          <h3>{t(lang, "how3t")}</h3>
          <p>{t(lang, "how3")}</p>
        </div>
      </div>

      <div className="pair">
        <div className="panel panel-accent">
          <h3>{t(lang, "isTitle")}</h3>
          <p>{t(lang, "isBody")}</p>
        </div>
        <div className="panel">
          <h3>{t(lang, "privTitle")}</h3>
          <p>{t(lang, "privBody")}</p>
          <p style={{ marginTop: 12 }}>
            <a href="/privacy">{t(lang, "readNotice")}</a>
          </p>
        </div>
      </div>
    </div>
  );
}

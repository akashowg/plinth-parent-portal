import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import Triangulation from "@/components/Triangulation";

export default async function Home() {
  const lang = await getLang();
  const steps = [
    ["how1t", "how1"],
    ["how2t", "how2"],
    ["how3t", "how3"],
  ] as const;
  const terms = [
    ["term1k", "term1v"],
    ["term2k", "term2v"],
    ["term3k", "term3v"],
    ["term4k", "term4v"],
  ] as const;

  return (
    <div className="home">
      <section className="hero" aria-labelledby="hero-title">
        <div className="frame hero-grid">
          <div>
            <h1 id="hero-title">{t(lang, "heroTitle")}</h1>
            <p className="lead">{t(lang, "heroLead")}</p>
            <div className="cta-row">
              <a className="btn btn-light" href="/start">
                {t(lang, "begin")}
              </a>
              <a href="/login">{t(lang, "alreadyStarted")}</a>
            </div>
            <p className="hero-note">{t(lang, "ageNote")}</p>
          </div>
          <Triangulation
            l={{
              aria: t(lang, "triAria"),
              child: t(lang, "triChild"),
              childSub: t(lang, "triChildSub"),
              parent: t(lang, "triParent"),
              parentSub: t(lang, "triParentSub"),
              teacher: t(lang, "triTeacher"),
              teacherSub: t(lang, "triTeacherSub"),
              core: t(lang, "triCore"),
            }}
          />
        </div>
      </section>

      <section className="band" aria-labelledby="is-title">
        <div className="frame">
          <h2 id="is-title" className="statement-title">
            {t(lang, "isTitle")}
          </h2>
          <p className="statement">{t(lang, "isBody")}</p>
        </div>
      </section>

      <section className="band band-follow" aria-labelledby="how-title">
        <div className="frame">
          <div className="section-head">
            <h2 id="how-title">{t(lang, "howTitle")}</h2>
            <p>{t(lang, "howLead")}</p>
          </div>
          <ol className="index">
            {steps.map(([title, body], i) => (
              <li key={title}>
                <div className="ix-head">
                  <span className="ix-n" aria-hidden="true">
                    {i + 1}
                  </span>
                  <h3>{t(lang, title)}</h3>
                </div>
                <p>{t(lang, body)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="band band-fog" aria-labelledby="priv-title">
        <div className="frame">
          <div className="section-head">
            <h2 id="priv-title">{t(lang, "privTitle")}</h2>
          </div>
          <dl className="terms">
            {terms.map(([k, v]) => (
              <div key={k}>
                <dt>{t(lang, k)}</dt>
                <dd>{t(lang, v)}</dd>
              </div>
            ))}
          </dl>
          <p className="terms-foot">
            <a href="/privacy">{t(lang, "readNotice")}</a>
          </p>
        </div>
      </section>

      <section className="closing" aria-labelledby="closing-line">
        <div className="frame closing-grid">
          <div className="closing-main">
            <p id="closing-line">{t(lang, "closingLine")}</p>
            <a className="btn btn-light" href="/start">
              {t(lang, "begin")}
            </a>
          </div>
          <div className="closing-side">
            <a href="/login">{t(lang, "alreadyStarted")}</a>
          </div>
        </div>
      </section>
    </div>
  );
}

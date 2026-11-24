import InstrumentForm from "@/components/InstrumentForm";
import { sttAvailable } from "@/lib/stt";
import { isolate } from "@/lib/i18n/langs";
import { caseByToken, decodeCase, submittedSources } from "@/lib/cases";
import { safeguardingContactName } from "@/lib/email";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/lang";
import { loadDraft } from "@/lib/instrument/device";
import { formFor } from "@/lib/instrument/store";
import { formDict } from "@/lib/i18n/form-dict";
import { parentCaseId } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function StudentForm({ params }: { params: Promise<{ token: string }> }) {
  const lang = await getLang();
  const { token } = await params;
  const c = await caseByToken("student", token);
  const def = c ? formFor(c, "student") : null;
  if (!c || !def) {
    return (
      <div className="wrap" style={{ maxWidth: 600 }}>
        <h1>PLINTH</h1>
        <p className="lead">{t(lang, "linkInvalid")}</p>
      </div>
    );
  }
  const have = await submittedSources(c.id);
  if (have.has("student") || c.status === "in_studio" || c.status === "delivered") {
    return (
      <div className="wrap" style={{ maxWidth: 600 }}>
        <h1>{t(lang, "studentTitle")}</h1>
        <p className="lead">{t(lang, "alreadyAnswered")}</p>
      </div>
    );
  }
  const first = decodeCase(c).child.name.split(/\s+/)[0];
  const parentHere = (await parentCaseId()) === c.id;
  const draft = await loadDraft(c.id, "student");
  const contact = safeguardingContactName();
  const bandA = def.band === "A";

  const preface = bandA ? (
    <div className="preface">
      <p>{t(lang, "adminLead")}</p>
      <ul>
        <li>{t(lang, "assent1")}</li>
        <li>{t(lang, "assent2")}</li>
        <li>{t(lang, "assent5").replace("{name}", isolate(lang, contact))}</li>
      </ul>
    </div>
  ) : (
    <div className="preface">
      <ul>
        <li>{t(lang, "assent1")}</li>
        <li>{t(lang, "assent2")}</li>
        <li>{t(lang, "assent3")}</li>
        <li>{t(lang, "assent4")}</li>
        <li>{t(lang, "assent5").replace("{name}", isolate(lang, contact))}</li>
      </ul>
    </div>
  );

  return (
    <div className="wrap">
      <span className="kicker">PLINTH · {first}</span>
      <h1>{bandA ? t(lang, "adminTitle") : t(lang, "studentTitle")}</h1>
      {bandA && parentHere && (
        <p className="notice" role="note" style={{ marginBottom: 24 }}>
          {t(lang, "bandAParentNote")}
        </p>
      )}
      {!bandA && <p className="lead">{t(lang, "studentHello")}</p>}
      <InstrumentForm
        serverStt={await sttAvailable()}
        def={def}
        lang={lang}
        dict={formDict(def, lang)}
        token={token}
        initial={draft}
        pinRequired
        preface={preface}
        done={
          <div className="panel panel-accent">
            <h2>{bandA ? t(lang, "adminThanks") : t(lang, "studentThanks")}</h2>
            {parentHere && (
              <p style={{ marginTop: 16 }}>
                <a href="/case">{t(lang, "parentBack")}</a>
              </p>
            )}
          </div>
        }
      />
    </div>
  );
}

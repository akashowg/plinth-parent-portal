import InstrumentForm from "@/components/InstrumentForm";
import { caseByToken, decodeCase, submittedSources } from "@/lib/cases";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/lang";
import { loadDraft } from "@/lib/instrument/device";
import { formFor } from "@/lib/instrument/store";

export const dynamic = "force-dynamic";

export default async function TeacherForm({ params }: { params: Promise<{ token: string }> }) {
  const lang = await getLang();
  const { token } = await params;
  const c = await caseByToken("teacher", token);
  const def = c ? formFor(c, "teacher") : null;
  if (!c || !def) {
    return (
      <div className="wrap" style={{ maxWidth: 600 }}>
        <h1>PLINTH</h1>
        <p className="lead">{t(lang, "linkInvalid")}</p>
      </div>
    );
  }
  const have = await submittedSources(c.id);
  if (have.has("educator") || c.status === "in_studio" || c.status === "delivered") {
    return (
      <div className="wrap" style={{ maxWidth: 600 }}>
        <h1>{t(lang, "teacherTitle")}</h1>
        <p className="lead">{t(lang, "alreadyAnswered")}</p>
      </div>
    );
  }
  const { child } = decodeCase(c);
  const draft = await loadDraft(c.id, "teacher");

  return (
    <div className="wrap">
      <span className="kicker">PLINTH · {child.name} · {child.klass}</span>
      <h1>{t(lang, "teacherTitle")}</h1>
      <p className="lead">{t(lang, "teacherLead")}</p>
      <InstrumentForm
        def={def}
        lang={lang}
        token={token}
        initial={draft && "answers" in draft ? draft : null}
        preface={
          <div className="preface">
            <p>{t(lang, "teacherNotice")}</p>
          </div>
        }
        done={
          <div className="panel panel-accent">
            <h2>{t(lang, "teacherThanks")}</h2>
          </div>
        }
      />
    </div>
  );
}

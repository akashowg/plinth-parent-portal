import ActionForm from "@/components/ActionForm";
import QuestionField from "@/components/QuestionField";
import { submitTeacherForm } from "@/app/actions";
import { caseByToken, decodeCase, submittedSources } from "@/lib/cases";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/lang";
import { TEACHER_CONTEXT, TEACHER_QUESTIONS, TEACHER_SCALES } from "@/lib/questions";

export const dynamic = "force-dynamic";

export default async function TeacherForm({ params }: { params: Promise<{ token: string }> }) {
  const lang = await getLang();
  const { token } = await params;
  const c = await caseByToken("teacher", token);
  if (!c) {
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

  return (
    <div className="wrap">
      <span className="kicker">PLINTH · {child.name} · {child.klass}</span>
      <h1>{t(lang, "teacherTitle")}</h1>
      <p className="lead">{t(lang, "teacherLead")}</p>
      <ActionForm
        action={submitTeacherForm}
        submitLabel={t(lang, "submit")}
        doneView={
          <div className="panel panel-accent">
            <h2>{t(lang, "teacherThanks")}</h2>
          </div>
        }
      >
        <input type="hidden" name="token" value={token} />
        <p className="notice" style={{ background: "var(--paper)", color: "var(--slate)", borderColor: "var(--line)" }}>
          {t(lang, "teacherNotice")}
        </p>

        <div className="section">
          <h2>{t(lang, "aboutYourRole")}</h2>
          <div className="grid-2">
            {TEACHER_CONTEXT.map((q) => (
              <QuestionField key={q.id} q={q} lang={lang} />
            ))}
          </div>
        </div>

        <div className="section">
          <h2>{t(lang, "quickRatings")}</h2>
          <p className="muted" style={{ margin: 0 }}>{t(lang, "quickRatingsLead")}</p>
          {TEACHER_SCALES.map((q) => (
            <QuestionField key={q.id} q={q} lang={lang} />
          ))}
        </div>

        <div className="section">
          <h2>{t(lang, "inYourWords")}</h2>
          {TEACHER_QUESTIONS.map((q, i) => (
            <QuestionField key={q.id} q={q} lang={lang} n={i + 1} />
          ))}
        </div>

        <div className="consent-list">
          <label className="check">
            <input type="checkbox" name="declare" value="yes" required />
            <span>{t(lang, "teacherDeclare")}</span>
          </label>
        </div>
      </ActionForm>
    </div>
  );
}

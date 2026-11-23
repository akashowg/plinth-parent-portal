import ActionForm from "@/components/ActionForm";
import QuestionField from "@/components/QuestionField";
import { submitStudentForm } from "@/app/actions";
import { caseByToken, decodeCase, submittedSources } from "@/lib/cases";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/lang";
import { STUDENT_QUESTIONS } from "@/lib/questions";

export const dynamic = "force-dynamic";

export default async function StudentForm({ params }: { params: Promise<{ token: string }> }) {
  const lang = await getLang();
  const { token } = await params;
  const c = await caseByToken("student", token);
  if (!c) {
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

  return (
    <div className="wrap">
      <span className="kicker">PLINTH · {first}</span>
      <h1>{t(lang, "studentTitle")}</h1>
      <p className="lead">{t(lang, "studentHello")}</p>
      <ActionForm
        action={submitStudentForm}
        submitLabel={t(lang, "submit")}
        doneView={
          <div className="panel panel-accent">
            <h2>{t(lang, "studentThanks")}</h2>
          </div>
        }
      >
        <input type="hidden" name="token" value={token} />
        <div className="assent">
          <h3>{t(lang, "assentTitle")}</h3>
          <ul>
            <li>{t(lang, "assent1")}</li>
            <li>{t(lang, "assent2")}</li>
            <li>{t(lang, "assent3")}</li>
            <li>{t(lang, "assent4")}</li>
          </ul>
          <label className="check">
            <input type="checkbox" name="assent" value="yes" required />
            <span><strong>{t(lang, "assentAgree")}</strong></span>
          </label>
        </div>
        <p className="muted" style={{ margin: 0 }}>{t(lang, "answerHint")}</p>
        {STUDENT_QUESTIONS.map((q, i) => (
          <QuestionField key={q.id} q={q} lang={lang} n={i + 1} forceOptional />
        ))}
      </ActionForm>
    </div>
  );
}

import { redirect } from "next/navigation";
import ActionForm from "@/components/ActionForm";
import QuestionField from "@/components/QuestionField";
import { submitParentForm } from "@/app/actions";
import { decodeCase, getCase, getSubmissions } from "@/lib/cases";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/lang";
import { PARENT_QUESTIONS } from "@/lib/questions";
import { parentCaseId } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ParentForm() {
  const lang = await getLang();
  const id = await parentCaseId();
  if (!id) redirect("/login");
  const c = await getCase(id);
  if (!c || !c.verified_at || c.withdrawn_at) redirect("/case");
  if (c.status === "in_studio" || c.status === "delivered") redirect("/case");
  const { child } = decodeCase(c);
  const prev = (await getSubmissions(id)).find((s) => s.source === "parent")?.answers ?? {};

  return (
    <div className="wrap">
      <span className="kicker">{t(lang, "parentFormTitle")} · {child.name}</span>
      <h1>{t(lang, "parentFormTitle")}</h1>
      <p className="lead">{t(lang, "answerHint")}</p>
      <ActionForm action={submitParentForm} submitLabel={t(lang, "submit")}>
        {PARENT_QUESTIONS.map((q, i) => (
          <QuestionField key={q.id} q={q} lang={lang} n={i + 1} value={prev[q.id]} />
        ))}
      </ActionForm>
      <p style={{ marginTop: 24 }}>
        <a href="/case">← {t(lang, "backToProfile")}</a>
      </p>
    </div>
  );
}

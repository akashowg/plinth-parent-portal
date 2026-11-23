import { redirect } from "next/navigation";
import InstrumentForm from "@/components/InstrumentForm";
import { decodeCase, getCase, submittedSources } from "@/lib/cases";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/lang";
import { loadDraft } from "@/lib/instrument/device";
import { formFor } from "@/lib/instrument/store";
import { formDict } from "@/lib/i18n/form-dict";
import { parentCaseId } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ParentForm() {
  const lang = await getLang();
  const id = await parentCaseId();
  if (!id) redirect("/login");
  const c = await getCase(id);
  if (!c || !c.verified_at || c.withdrawn_at) redirect("/case");
  if (c.status === "in_studio" || c.status === "delivered") redirect("/case");
  if ((await submittedSources(id)).has("parent")) redirect("/case");
  const def = formFor(c, "parent");
  if (!def) redirect("/case");
  const { child } = decodeCase(c);
  const draft = await loadDraft(id, "parent");

  return (
    <div className="wrap">
      <span className="kicker">{t(lang, "parentFormTitle")} · {child.name}</span>
      <h1>{t(lang, "parentFormTitle")}</h1>
      <InstrumentForm
        def={def}
        lang={lang}
        dict={formDict(def, lang)}
        initial={draft && "answers" in draft ? draft : null}
        preface={
          <div className="preface">
            <p>{t(lang, "parentPreface")}</p>
          </div>
        }
        done={
          <div className="panel panel-accent">
            <h2>{t(lang, "saved")}</h2>
            <p style={{ marginTop: 16 }}>
              <a href="/case?saved=parent">← {t(lang, "backToProfile")}</a>
            </p>
          </div>
        }
      />
      <p style={{ marginTop: 24 }}>
        <a href="/case">← {t(lang, "backToProfile")}</a>
      </p>
    </div>
  );
}

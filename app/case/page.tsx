import { redirect } from "next/navigation";
import ActionForm from "@/components/ActionForm";
import CopyButton from "@/components/CopyButton";
import { signOut, withdrawConsent } from "@/app/actions";
import { decodeCase, getCase, submittedSources } from "@/lib/cases";
import { baseUrl } from "@/lib/env";
import { t } from "@/lib/i18n";
import { getLang } from "@/lib/lang";
import { parentCaseId } from "@/lib/session";

export const dynamic = "force-dynamic";

function Badge({ ok, lang }: { ok: boolean; lang: "en" | "hi" }) {
  return <span className={`badge ${ok ? "badge-ok" : "badge-wait"}`}>{ok ? t(lang, "received") : t(lang, "waiting")}</span>;
}

export default async function CasePage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const lang = await getLang();
  const id = await parentCaseId();
  if (!id) redirect("/login");
  const c = await getCase(id);
  if (!c || !c.verified_at) redirect("/login");
  if (c.withdrawn_at) redirect("/withdrawn");
  const { child, tokens } = decodeCase(c);
  const have = await submittedSources(id);
  const { saved } = await searchParams;
  const locked = c.status === "in_studio" || c.status === "delivered";

  const studentUrl = `${baseUrl()}/s/${tokens.student}`;
  const teacherUrl = `${baseUrl()}/t/${tokens.teacher}`;
  const wa = (msg: string, url: string) => `https://wa.me/?text=${encodeURIComponent(`${msg} ${url}`)}`;
  const verifiedOn = new Date(c.verified_at).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="wrap">
      <span className="kicker">{t(lang, "kicker")}</span>
      <h1>{t(lang, "caseTitle")}</h1>
      <div className="meta">
        <div><span className="k">{t(lang, "aboutChildFor")}</span><span className="v">{child.name}</span></div>
        <div><span className="k">{t(lang, "klass")}</span><span className="v">{child.klass}</span></div>
        <div><span className="k">{t(lang, "reference")}</span><span className="v">{c.ref}</span></div>
      </div>

      {saved && <p className="notice" style={{ marginBottom: 24 }}>{t(lang, "saved")}</p>}
      {c.status === "in_studio" && <p className="notice" style={{ marginBottom: 24 }}>{t(lang, "statusInStudio")}</p>}
      {c.status === "delivered" && <p className="notice" style={{ marginBottom: 24 }}>{t(lang, "statusDelivered")}</p>}
      {!locked && have.size === 3 && <p className="notice" style={{ marginBottom: 24 }}>{t(lang, "allIn")}</p>}

      <div className="card">
        <div className="card-head">
          <h3>1 · {t(lang, "step1")}</h3>
          <Badge ok={have.has("parent")} lang={lang} />
        </div>
        <p>{t(lang, "step1Lead")}</p>
        {!locked && (
          <div className="row">
            <a className={have.has("parent") ? "btn btn-quiet" : "btn"} href="/case/parent-form">
              {have.has("parent") ? t(lang, "editForm") : t(lang, "fillForm")}
            </a>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-head">
          <h3>2 · {t(lang, "step2")}</h3>
          <Badge ok={have.has("student")} lang={lang} />
        </div>
        <p>{t(lang, "step2Lead")}</p>
        {!locked && !have.has("student") && (
          <>
            <div className="row">
              <a className="btn" href={`/s/${tokens.student}`}>
                {t(lang, "fillHere")}
              </a>
            </div>
            <p className="small" style={{ marginTop: 4 }}>{t(lang, "orShare")}</p>
            <div className="linkbox">{studentUrl}</div>
            <div className="row">
              <a className="btn btn-quiet" href={wa(t(lang, "waStudent"), studentUrl)} target="_blank" rel="noopener">
                {t(lang, "sendWhatsApp")}
              </a>
              <CopyButton text={studentUrl} label={t(lang, "copyLink")} copiedLabel={t(lang, "copied")} />
            </div>
          </>
        )}
      </div>

      <div className="card">
        <div className="card-head">
          <h3>3 · {t(lang, "step3")}</h3>
          <Badge ok={have.has("educator")} lang={lang} />
        </div>
        <p>{t(lang, "step3Lead")}</p>
        {!locked && !have.has("educator") && (
          <>
            <div className="linkbox">{teacherUrl}</div>
            <div className="row">
              <a className="btn" href={wa(t(lang, "waTeacher"), teacherUrl)} target="_blank" rel="noopener">
                {t(lang, "sendWhatsApp")}
              </a>
              <CopyButton text={teacherUrl} label={t(lang, "copyLink")} copiedLabel={t(lang, "copied")} />
            </div>
          </>
        )}
      </div>

      <div className="section" style={{ marginTop: 40 }}>
        <h2>{t(lang, "consentRecord")}</h2>
        <p className="muted" style={{ margin: 0 }}>
          {t(lang, "consentGiven")} {verifiedOn}. <a href="/privacy">{t(lang, "readNotice")}</a>
        </p>
        <form action={signOut}>
          <button className="btn btn-quiet" type="submit">{t(lang, "signOut")}</button>
        </form>
      </div>

      <details className="danger">
        <summary>{t(lang, "withdrawTitle")}</summary>
        <p className="muted">{t(lang, "withdrawLead")}</p>
        <ActionForm action={withdrawConsent} submitLabel={t(lang, "withdrawButton")} danger>
          <label className="field">
            <span className="q-label">{t(lang, "withdrawConfirm")}</span>
            <input type="text" name="confirm" required autoComplete="off" />
          </label>
        </ActionForm>
      </details>
    </div>
  );
}

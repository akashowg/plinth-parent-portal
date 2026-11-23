import ActionForm from "@/components/ActionForm";
import { requestLogin } from "@/app/actions";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";

export default async function Login() {
  const lang = await getLang();
  return (
    <div className="wrap" style={{ maxWidth: 560 }}>
      <h1>{t(lang, "loginTitle")}</h1>
      <p className="lead">{t(lang, "loginLead")}</p>
      <ActionForm action={requestLogin} submitLabel={t(lang, "sendCode")}>
        <label className="field">
          <span className="q-label">{t(lang, "email")}</span>
          <input type="email" name="email" required maxLength={254} autoComplete="email" inputMode="email" />
        </label>
      </ActionForm>
    </div>
  );
}

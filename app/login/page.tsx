import ActionForm from "@/components/ActionForm";
import { requestLogin } from "@/app/actions";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
const EMAIL_PATTERN = String.raw`[^\s@]+@[^\s@]+\.[^\s@]{2,}`;

export default async function Login() {
  const lang = await getLang();
  return (
    <div className="wrap" style={{ maxWidth: 560 }}>
      <h1>{t(lang, "loginTitle")}</h1>
      <p className="lead">{t(lang, "loginLead")}</p>
      <ActionForm action={requestLogin} submitLabel={t(lang, "sendCode")}>
        <label className="field">
          <span className="q-label">{t(lang, "email")}</span>
          <input type="email" name="email" required pattern={EMAIL_PATTERN} title={t(lang, "errEmail")} maxLength={254} autoComplete="email" inputMode="email" />
        </label>
      </ActionForm>
    </div>
  );
}

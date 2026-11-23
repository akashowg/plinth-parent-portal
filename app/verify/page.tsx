import ActionForm from "@/components/ActionForm";
import { verifyCode } from "@/app/actions";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import { devShowCodes } from "@/lib/env";

export default async function Verify({ searchParams }: { searchParams: Promise<{ c?: string; dev?: string }> }) {
  const lang = await getLang();
  const { c = "", dev } = await searchParams;
  return (
    <div className="wrap" style={{ maxWidth: 560 }}>
      <h1>{t(lang, "verifyTitle")}</h1>
      <p className="lead">{t(lang, "verifyLead")}</p>
      {dev && devShowCodes() && (
        <p className="devcode">
          {t(lang, "devCode")} <strong>{dev}</strong>
        </p>
      )}
      <ActionForm action={verifyCode} submitLabel={t(lang, "verify")}>
        <input type="hidden" name="c" value={c} />
        <label className="field">
          <span className="q-label">{t(lang, "code")}</span>
          <input
            className="code-input"
            type="text"
            name="code"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            autoComplete="one-time-code"
            required
            autoFocus
          />
        </label>
      </ActionForm>
    </div>
  );
}

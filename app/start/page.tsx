import ActionForm from "@/components/ActionForm";
import { startCase } from "@/app/actions";
import { CONSENT_ITEMS } from "@/lib/consent";
import { getLang } from "@/lib/lang";
import { t, type Key } from "@/lib/i18n";
import { CLASS_OPTIONS } from "@/lib/instrument/forms";
import { safeguardingContactName } from "@/lib/email";

export default async function Start() {
  const lang = await getLang();
  const now = new Date();
  const shift = (years: number, days = 0) => {
    const d = new Date(Date.UTC(now.getUTCFullYear() - years, now.getUTCMonth(), now.getUTCDate() + days));
    return d.toISOString().slice(0, 10);
  };
  const maxDob = shift(6); // at least 6 years old
  const minDob = shift(19, 1); // younger than 19
  const contact = safeguardingContactName();
  return (
    <div className="wrap">
      <span className="kicker">{t(lang, "kicker")}</span>
      <h1>{t(lang, "startTitle")}</h1>
      <p className="lead">{t(lang, "startLead")}</p>

      <ActionForm action={startCase} submitLabel={t(lang, "continueVerify")}>
        <div className="section">
          <h2>{t(lang, "aboutYou")}</h2>
          <label className="field">
            <span className="q-label">{t(lang, "parentName")} <span className="req">*</span></span>
            <input type="text" name="parentName" required maxLength={120} autoComplete="name" />
          </label>
          <div className="grid-2">
            <label className="field">
              <span className="q-label">{t(lang, "relation")} <span className="req">*</span></span>
              <select name="relation" required defaultValue="">
                <option value="" disabled>{t(lang, "choose")}</option>
                <option value="Mother">{t(lang, "relMother")}</option>
                <option value="Father">{t(lang, "relFather")}</option>
                <option value="Legal guardian">{t(lang, "relGuardian")}</option>
              </select>
            </label>
            <label className="field">
              <span className="q-label">{t(lang, "otherParent")}</span>
              <input type="text" name="otherParent" maxLength={120} autoComplete="off" />
            </label>
          </div>
          <div className="grid-2">
            <label className="field">
              <span className="q-label">{t(lang, "email")} <span className="req">*</span></span>
              <input type="email" name="email" required maxLength={254} autoComplete="email" inputMode="email" />
              <span className="help">{t(lang, "emailHelp")}</span>
            </label>
            <label className="field">
              <span className="q-label">{t(lang, "whatsapp")}</span>
              <input type="tel" name="whatsapp" maxLength={20} autoComplete="tel" inputMode="tel" placeholder="+91" />
              <span className="help">{t(lang, "whatsappHelp")}</span>
            </label>
          </div>
        </div>

        <div className="section">
          <h2>{t(lang, "aboutChild")}</h2>
          <label className="field">
            <span className="q-label">{t(lang, "childName")} <span className="req">*</span></span>
            <input type="text" name="childName" required maxLength={120} autoComplete="off" />
          </label>
          <div className="grid-2">
            <label className="field">
              <span className="q-label">{t(lang, "dob")} <span className="req">*</span></span>
              <input type="date" name="dob" required max={maxDob} min={minDob} />
            </label>
            <label className="field">
              <span className="q-label">{t(lang, "klass")} <span className="req">*</span></span>
              <select name="klass" required defaultValue="">
                <option value="" disabled>{t(lang, "choose")}</option>
                {CLASS_OPTIONS.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="field">
            <span className="q-label">{t(lang, "gender")} <span className="req">*</span></span>
            <select name="gender" required defaultValue="">
              <option value="" disabled>{t(lang, "choose")}</option>
              <option value="Girl">{t(lang, "girl")}</option>
              <option value="Boy">{t(lang, "boy")}</option>
              <option value="Not stated">{t(lang, "preferNot")}</option>
            </select>
          </label>
          <div className="grid-2">
            <label className="field">
              <span className="q-label">{t(lang, "city")} <span className="req">*</span></span>
              <input type="text" name="city" required maxLength={80} autoComplete="address-level2" />
            </label>
            <label className="field">
              <span className="q-label">{t(lang, "state")} <span className="req">*</span></span>
              <input type="text" name="state" required maxLength={80} autoComplete="address-level1" />
            </label>
          </div>
        </div>

        <div className="section">
          <h2>{t(lang, "consentTitle")}</h2>
          <p className="muted" style={{ margin: 0 }}>{t(lang, "consentLead")}</p>
          <div className="consent-list">
            {CONSENT_ITEMS.map((k) => (
              <label key={k} className="check">
                <input type="checkbox" name={k} value="yes" required />
                <span>{t(lang, k as Key).replace("{name}", contact)}</span>
              </label>
            ))}
          </div>
          <p className="small" style={{ margin: 0 }}>
            <a href="/privacy" target="_blank" rel="noopener">{t(lang, "readNotice")}</a>
          </p>
        </div>
      </ActionForm>
    </div>
  );
}

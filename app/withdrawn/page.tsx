import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";

export default async function Withdrawn() {
  const lang = await getLang();
  return (
    <div className="wrap" style={{ maxWidth: 600 }}>
      <h1>{t(lang, "withdrawnTitle")}</h1>
      <p className="lead">{t(lang, "withdrawnBody")}</p>
      <a className="btn btn-quiet" href="/">PLINTH</a>
    </div>
  );
}

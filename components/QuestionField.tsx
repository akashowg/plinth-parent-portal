import { SCALE, type Lang, type Question } from "@/lib/questions";
import { t } from "@/lib/i18n";

export default function QuestionField({
  q,
  lang,
  n,
  value,
  forceOptional,
}: {
  q: Question;
  lang: Lang;
  n?: number;
  value?: string;
  forceOptional?: boolean;
}) {
  const required = !!q.required && !forceOptional;
  const label = (
    <span className="q-label">
      {n !== undefined && <span className="q-num">{String(n).padStart(2, "0")}</span>}
      <span>
        {q.label[lang]}
        {required && <span className="req" aria-label={t(lang, "required")}> *</span>}
      </span>
    </span>
  );

  if (q.type === "scale") {
    return (
      <fieldset className="scale">
        <legend>{q.label[lang]}{required && <span className="req"> *</span>}</legend>
        <div className="scale-opts">
          {SCALE.map((o) => (
            <label key={o.value} className="pill">
              <input type="radio" name={q.id} value={o.value} required={required} defaultChecked={value === o.value} />
              <span>{o.label[lang]}</span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  if (q.type === "choice") {
    return (
      <label className="field">
        {label}
        <select name={q.id} required={required} defaultValue={value ?? ""}>
          <option value="" disabled>
            {t(lang, "choose")}
          </option>
          {q.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label[lang]}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className="field">
      {label}
      {"help" in q && q.help && <span className="help">{q.help[lang]}</span>}
      {q.type === "short" ? (
        <input type="text" name={q.id} required={required} maxLength={120} defaultValue={value} autoComplete="off" />
      ) : (
        <textarea name={q.id} required={required} maxLength={4000} rows={4} defaultValue={value} />
      )}
    </label>
  );
}

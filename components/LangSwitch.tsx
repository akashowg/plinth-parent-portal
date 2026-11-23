"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { LANGS, type Lang } from "@/lib/i18n/langs";

/** Language menu: every language is listed in its own script, so a parent can find theirs without reading English. */
export default function LangSwitch({ current, label }: { current: Lang; label: string }) {
  const path = usePathname();
  const qs = useSearchParams().toString();
  const back = encodeURIComponent(path + (qs ? `?${qs}` : ""));
  const cur = LANGS.find((l) => l.code === current) ?? LANGS[0];
  return (
    <details className="lang-menu">
      <summary className="lang" aria-label={label}>
        <span aria-hidden="true">文</span>{" "}
        <span lang={cur.code} dir={cur.dir}>
          {cur.native}
        </span>
      </summary>
      <ul role="list">
        {LANGS.map((l) => (
          <li key={l.code}>
            <a
              href={`/lang?to=${l.code}&back=${back}`}
              hrefLang={l.code}
              aria-current={l.code === current ? "true" : undefined}
            >
              <span className="native" lang={l.code} dir={l.dir}>
                {l.native}
              </span>
              {l.code !== "en" && (
                <span className="eng" lang="en">
                  {l.name}
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}

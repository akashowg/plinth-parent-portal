"use client";

import { usePathname, useSearchParams } from "next/navigation";

export default function LangSwitch({ to, label }: { to: "en" | "hi"; label: string }) {
  const path = usePathname();
  const qs = useSearchParams().toString();
  const back = encodeURIComponent(path + (qs ? `?${qs}` : ""));
  return (
    <a className="lang" href={`/lang?to=${to}&back=${back}`} lang={to} hrefLang={to}>
      {label}
    </a>
  );
}

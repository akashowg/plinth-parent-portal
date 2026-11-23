/** Every live string is in source.json and translated in all nine catalog languages: npx tsx tests/i18n-coverage.test.ts */
import * as fs from "node:fs";
import { collectLive } from "../scripts/i18n-collect";
import { tr } from "../lib/i18n/translate";
import { CATALOG_LANGS, LANGS } from "../lib/i18n/langs";

const source: string[] = JSON.parse(fs.readFileSync("lib/i18n/source.json", "utf8"));
const index = new Map(source.map((s, i) => [s, i]));
const live = collectLive();
const SCRIPT: Record<string, RegExp> = {
  bn: /[ঀ-৿]/, mr: /[ऀ-ॿ]/, te: /[ఀ-౿]/, ta: /[஀-௿]/, gu: /[઀-૿]/,
  ur: /[؀-ۿ]/, kn: /[ಀ-೿]/, or: /[଀-୿]/, ml: /[ഀ-ൿ]/,
};
const holes = (s: string) => (s.match(/\{[a-z]+\}/g) ?? []).sort().join(",");
let fail = 0;
const missingSource = live.filter((s) => !index.has(s));
if (missingSource.length) { fail++; console.log(`NOT IN source.json (run scripts/i18n-extract.ts): ${missingSource.length}`, missingSource.slice(0, 5)); }
for (const lang of CATALOG_LANGS) {
  const cat: (string | null)[] = JSON.parse(fs.readFileSync(`lib/i18n/catalogs/${lang}.json`, "utf8"));
  let missing = 0, wrongScript = 0, badHoles = 0, english = 0;
  for (const en of live) {
    const i = index.get(en)!;
    const t = cat[i];
    if (typeof t !== "string" || !t.trim()) { missing++; continue; }
    if (!SCRIPT[lang].test(t) && /[a-z]{3}/i.test(en.replace(/PLINTH|HDI|WhatsApp|Claude|Anthropic|Vercel|Gmail|Google|AI|IP|WITHDRAW/g, ""))) wrongScript++;
    if (holes(t) !== holes(en)) badHoles++;
    if (tr(lang, en) === en && /[a-z]{4}/i.test(en)) english++;
  }
  const ok = !missing && !wrongScript && !badHoles && !english;
  if (!ok) fail++;
  console.log(`${ok ? "ok  " : "FAIL"} ${lang} (${LANGS.find((l) => l.code === lang)?.name}): ${live.length - missing}/${live.length} live strings` + (wrongScript ? ` · ${wrongScript} wrong script` : "") + (badHoles ? ` · ${badHoles} placeholder mismatches` : "") + (english ? ` · ${english} fall back to English` : ""));
}
console.log(fail ? `\n${fail} problem(s)` : "\nall languages complete");
process.exit(fail ? 1 : 0);

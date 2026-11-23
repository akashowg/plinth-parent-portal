/**
 * Translation lookup. Source text is English (with Hindi authored alongside it). The nine catalog languages are
 * arrays aligned to lib/i18n/source.json, which is append-only: a string keeps its index forever, so adding or
 * rewording text never shifts existing translations. Anything without a translation falls back to English.
 */
import SOURCE from "./source.json";
import bn from "./catalogs/bn.json";
import mr from "./catalogs/mr.json";
import te from "./catalogs/te.json";
import ta from "./catalogs/ta.json";
import gu from "./catalogs/gu.json";
import ur from "./catalogs/ur.json";
import kn from "./catalogs/kn.json";
import or from "./catalogs/or.json";
import ml from "./catalogs/ml.json";
import type { CatalogLang, Lang } from "./langs";

const RAW: Record<CatalogLang, (string | null)[]> = { bn, mr, te, ta, gu, ur, kn, or, ml };
const MAPS = new Map<CatalogLang, Map<string, string>>();

function map(lang: CatalogLang): Map<string, string> {
  let m = MAPS.get(lang);
  if (!m) {
    m = new Map();
    const arr = RAW[lang] ?? [];
    (SOURCE as string[]).forEach((en, i) => {
      const t = arr[i];
      if (typeof t === "string" && t.trim()) m!.set(en, t);
    });
    MAPS.set(lang, m);
  }
  return m;
}

export function tr(lang: Lang, en: string, hi?: string): string {
  if (lang === "en") return en;
  if (lang === "hi") return hi ?? en;
  return map(lang).get(en) ?? en;
}

/** The subset of a catalog a client component needs, so whole catalogs never ship to the browser. */
export function dictFor(lang: Lang, english: Iterable<string>): Record<string, string> {
  if (lang === "en" || lang === "hi") return {};
  const m = map(lang);
  const out: Record<string, string> = {};
  for (const e of english) {
    const t = m.get(e);
    if (t) out[e] = t;
  }
  return out;
}

export function coverage(lang: CatalogLang): { total: number; translated: number; missing: string[] } {
  const m = map(lang);
  const missing = (SOURCE as string[]).filter((e) => !m.has(e));
  return { total: (SOURCE as string[]).length, translated: (SOURCE as string[]).length - missing.length, missing };
}

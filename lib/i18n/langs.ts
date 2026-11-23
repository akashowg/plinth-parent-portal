/**
 * The portal's languages: English plus India's ten most spoken languages (Census 2011 order).
 * Hindi is authored alongside English in the source files; the other nine come from lib/i18n/catalogs.
 */
export const LANGS = [
  { code: "en", name: "English", native: "English", locale: "en-IN", dir: "ltr" },
  { code: "hi", name: "Hindi", native: "हिन्दी", locale: "hi-IN", dir: "ltr" },
  { code: "bn", name: "Bengali", native: "বাংলা", locale: "bn-IN", dir: "ltr" },
  { code: "mr", name: "Marathi", native: "मराठी", locale: "mr-IN", dir: "ltr" },
  { code: "te", name: "Telugu", native: "తెలుగు", locale: "te-IN", dir: "ltr" },
  { code: "ta", name: "Tamil", native: "தமிழ்", locale: "ta-IN", dir: "ltr" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી", locale: "gu-IN", dir: "ltr" },
  { code: "ur", name: "Urdu", native: "اردو", locale: "ur-IN", dir: "rtl" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ", locale: "kn-IN", dir: "ltr" },
  { code: "or", name: "Odia", native: "ଓଡ଼ିଆ", locale: "or-IN", dir: "ltr" },
  { code: "ml", name: "Malayalam", native: "മലയാളം", locale: "ml-IN", dir: "ltr" },
] as const;

export type Lang = (typeof LANGS)[number]["code"];
export type CatalogLang = Exclude<Lang, "en" | "hi">;
export const CATALOG_LANGS = LANGS.map((l) => l.code).filter((c): c is CatalogLang => c !== "en" && c !== "hi");
export const LANG_CODES = LANGS.map((l) => l.code) as Lang[];
export const isLang = (v: unknown): v is Lang => typeof v === "string" && (LANG_CODES as string[]).includes(v);
export const langInfo = (l: Lang) => LANGS.find((x) => x.code === l)!;

/**
 * Wraps text inserted into a translated sentence (a name, an email address) in Unicode isolates for right-to-left
 * languages, so English inside Urdu keeps its own order and its brackets and commas stay where they belong.
 */
export function isolate(lang: string, value: string): string {
  return langInfo(lang as Lang).dir === "rtl" ? `⁨${value}⁩` : value;
}

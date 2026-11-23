import "server-only";
import type { FormDef } from "../instrument/types";
import { ANCHORS } from "../instrument/scales";
import { U } from "../instrument/ui";
import type { Lang } from "./langs";
import { dictFor } from "./translate";

/** Every English string a form can show, so the browser receives only that slice of the catalog. */
export function formDict(def: FormDef, lang: Lang): Record<string, string> {
  if (lang === "en" || lang === "hi") return {};
  const out = new Set<string>();
  const add = (x?: { en: string }) => x?.en && out.add(x.en);
  for (const s of def.sections) {
    add(s.title);
    add(s.lead);
    for (const i of s.items) {
      add(i.t);
      add(i.help);
      add(i.ex);
      for (const o of i.opts ?? []) add(o.t);
    }
  }
  for (const s of def.subjects ?? []) add(s.t);
  for (const a of Object.values(ANCHORS)) {
    add(a.lo);
    add(a.hi);
  }
  for (const v of Object.values(U)) add(v);
  return dictFor(lang, out);
}

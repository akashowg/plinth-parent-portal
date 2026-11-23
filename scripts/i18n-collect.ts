/** Every English string the portal can currently show. Shared by the extractor and the coverage test. */
import { D } from "../lib/i18n";
import { U } from "../lib/instrument/ui";
import { buildForm } from "../lib/instrument/forms";
import * as scales from "../lib/instrument/scales";
import { privacyContent } from "../lib/privacy-content";

export function collectLive(): string[] {
  const found: string[] = [];
  const add = (s?: string) => {
    if (s && s.trim() && !/^[0-9–+\- ]+$/.test(s)) found.push(s);
  };
  const addT = (x?: { en: string }) => add(x?.en);

  Object.values(D).forEach(addT);
  Object.values(U).forEach(addT);
  for (const band of ["A", "B", "C"] as const)
    for (const source of ["student", "parent", "teacher"] as const)
      for (const klass of ["Class VIII", "Class XI"]) {
        const d = buildForm(source, { band, age: band === "A" ? 8 : band === "B" ? 13 : 16, klass });
        for (const s of d.sections) {
          addT(s.title);
          addT(s.lead);
          for (const i of s.items) {
            addT(i.t);
            addT(i.help);
            addT(i.ex);
            (i.opts ?? []).forEach((o) => addT(o.t));
          }
        }
        (d.subjects ?? []).forEach((s) => addT(s.t));
      }
  for (const v of Object.values(scales)) {
    if (Array.isArray(v)) v.forEach((o: { t?: { en: string } }) => addT(o.t));
    else if (v && typeof v === "object") Object.values(v).forEach((a) => { const x = a as { lo?: { en: string }; hi?: { en: string } }; addT(x.lo); addT(x.hi); });
  }
  const p = privacyContent("en", "{contact}");
  add(p.title); add(p.version);
  p.blocks.forEach((b) => { add(b.h); b.p.forEach(add); });
  return [...new Set(found)];
}

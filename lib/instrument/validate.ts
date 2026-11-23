import { RATE } from "./scales";
import type { Answers, FormDef, Item, Section } from "./types";

/* ------------------------------------------------------------------ visibility and validation */

export const SKIP = "__skip__";

export function chosenSubjects(def: FormDef, a: Answers): { v: string; t: { en: string; hi: string } }[] {
  const picked = Array.isArray(a["S1.0"]) ? (a["S1.0"] as string[]) : [];
  return (def.subjects ?? []).filter((s) => picked.includes(s.v));
}

export function gridKeys(subject: string) {
  return { enjoy: `S1.enjoy.${subject}`, ease: `S1.ease.${subject}` };
}

export function isVisible(item: Item, a: Answers): boolean {
  if (!item.show) return true;
  const v = a[item.show.k];
  return typeof v === "string" && item.show.in.includes(v);
}

/** Length that counts towards a character floor (spaces collapsed). */
export function textLength(s: string): number {
  return [...s.replace(/\s+/g, " ").trim()].length;
}

export type Problem = { k: string; code: "required" | "floor" | "invalid"; need?: number };

export function validateSection(def: FormDef, section: Section, a: Answers): Problem[] {
  const out: Problem[] = [];
  for (const i of section.items) {
    if (!isVisible(i, a)) continue;
    const p = validateItem(def, i, a);
    if (p) out.push(p);
  }
  return out;
}

export function validateItem(def: FormDef, i: Item, a: Answers): Problem | null {
  const v = a[i.k];
  switch (i.kind) {
    case "grid": {
      for (const s of chosenSubjects(def, a)) {
        const g = gridKeys(s.v);
        for (const key of [g.enjoy, g.ease]) {
          const x = a[key];
          if (typeof x !== "string" || !RATE.some((o) => o.v === x)) return { k: key, code: "required" };
        }
      }
      return null;
    }
    case "subject": {
      const subs = chosenSubjects(def, a);
      if (subs.length === 0) return null;
      if (typeof v !== "string" || !subs.some((s) => s.v === v)) return { k: i.k, code: "required" };
      return null;
    }
    case "multi": {
      if (i.k === "S1.0") {
        const ok = Array.isArray(v) && v.length > 0 && v.every((x) => (def.subjects ?? []).some((s) => s.v === x));
        return ok ? null : { k: i.k, code: "required" };
      }
      if (!Array.isArray(v) || v.length === 0) return i.optional ? null : { k: i.k, code: "required" };
      if (!v.every((x) => i.opts?.some((o) => o.v === x))) return { k: i.k, code: "invalid" };
      return null;
    }
    case "check":
      return v === "yes" ? null : { k: i.k, code: "required" };
    case "text": {
      const ok = typeof v === "string" && v.trim().length > 0;
      return ok || i.optional ? null : { k: i.k, code: "required" };
    }
    case "open": {
      if (typeof v !== "string" || v.trim() === "") return i.optional ? null : { k: i.k, code: "required" };
      if (v === SKIP) return i.skippable ? null : { k: i.k, code: "required" };
      const floor = i.floor ?? 0;
      if (floor > 0 && textLength(v) < floor) return { k: i.k, code: "floor", need: floor };
      return null;
    }
    default: {
      // freq, obs, a3, rate, choice, pair
      const options = i.opts ?? [];
      if (typeof v !== "string" || v === "") return i.optional ? null : { k: i.k, code: "required" };
      return options.some((o) => o.v === v) ? null : { k: i.k, code: "invalid" };
    }
  }
}

export function optionsFor(i: Item) {
  return i.opts ?? [];
}

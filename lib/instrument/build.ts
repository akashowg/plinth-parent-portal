import type { Item, Opt, T } from "./types";

/** Small builders that keep the item banks readable. */
export const tx = (en: string, hi: string): T => ({ en, hi });

export const freq = (k: string, en: string, hi: string, o: Partial<Item> = {}): Item => ({ k, kind: "freq", t: tx(en, hi), ...o });
export const obs = (k: string, en: string, hi: string, o: Partial<Item> = {}): Item => ({ k, kind: "obs", t: tx(en, hi), ...o });
export const a3 = (k: string, en: string, hi: string, o: Partial<Item> = {}): Item => ({ k, kind: "a3", t: tx(en, hi), ...o });

/** Option rows: [value, English, Hindi, ordinal value?, exclusive?] */
export type Row = [string, string, string, number?, boolean?];
export const opts = (rows: Row[]): Opt[] =>
  rows.map(([v, en, hi, s, exclusive]) => ({ v, t: tx(en, hi), ...(s !== undefined ? { s } : {}), ...(exclusive ? { exclusive } : {}) }));

export const choice = (k: string, en: string, hi: string, rows: Row[] | Opt[], o: Partial<Item> = {}): Item => ({
  k,
  kind: "choice",
  t: tx(en, hi),
  opts: Array.isArray(rows[0]) ? opts(rows as Row[]) : (rows as Opt[]),
  ...o,
});

export const multi = (k: string, en: string, hi: string, rows: Row[] | Opt[], o: Partial<Item> = {}): Item => ({
  ...choice(k, en, hi, rows, o),
  kind: "multi",
});

export const open = (k: string, en: string, hi: string, floor: number, o: Partial<Item> = {}): Item => ({
  k,
  kind: "open",
  t: tx(en, hi),
  floor,
  sec: 60,
  ...o,
});

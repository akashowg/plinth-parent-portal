/** Source-integrity check: how much of the educator's text repeats the parent's text (word 3-gram overlap). */

function shingles(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
  const out = new Set<string>();
  for (let i = 0; i + 2 < words.length; i++) out.add(words.slice(i, i + 3).join(" "));
  if (words.length > 0 && words.length < 3) out.add(words.join(" "));
  return out;
}

/** Share of the educator's 3-word phrases that also appear in the parent's answers (0–1). */
export function overlap(educatorText: string, parentText: string): number {
  const e = shingles(educatorText);
  if (e.size === 0) return 0;
  const p = shingles(parentText);
  let shared = 0;
  for (const s of e) if (p.has(s)) shared++;
  return shared / e.size;
}

export type IntegrityVerdict = { level: "ok" | "review" | "duplicate"; overlap: number };

export function educatorIntegrity(educatorText: string, parentText: string): IntegrityVerdict {
  const o = overlap(educatorText, parentText);
  if (o >= 0.6) return { level: "duplicate", overlap: o };
  if (o >= 0.25) return { level: "review", overlap: o };
  return { level: "ok", overlap: o };
}

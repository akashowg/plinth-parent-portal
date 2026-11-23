/**
 * Builds lib/i18n/source.json — every English string the portal can show to a family, teacher or child.
 * Append-only: existing strings keep their index, new strings go to the end. Then reports catalog coverage.
 *   npx tsx scripts/i18n-extract.ts
 */
import * as fs from "node:fs";
import { collectLive } from "./i18n-collect";

const found = collectLive();
const path = "lib/i18n/source.json";
const existing: string[] = JSON.parse(fs.readFileSync(path, "utf8"));
const have = new Set(existing);
const added = [...new Set(found)].filter((s) => !have.has(s));
const next = [...existing, ...added];
fs.writeFileSync(path, JSON.stringify(next, null, 1) + "\n");
const live = new Set(found);
console.log(`source: ${next.length} strings (${added.length} new; ${next.filter((s) => !live.has(s)).length} retired but kept)`);
for (const l of ["bn", "mr", "te", "ta", "gu", "ur", "kn", "or", "ml"]) {
  const cat: (string | null)[] = JSON.parse(fs.readFileSync(`lib/i18n/catalogs/${l}.json`, "utf8"));
  const missing = next.filter((s, i) => live.has(s) && !(typeof cat[i] === "string" && cat[i]!.trim())).length;
  console.log(`  ${l}: ${live.size - missing}/${live.size} live strings translated`);
}

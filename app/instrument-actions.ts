"use server";

import { headers } from "next/headers";
import { audit, db } from "@/lib/db";
import { lookupHash, seal } from "@/lib/crypto";
import { deviceHash } from "@/lib/instrument/device";
import { baseUrl } from "@/lib/env";
import { notifyAdmin, notifySafeguarding } from "@/lib/email";
import { caseByToken, getCase, submittedSources, type CaseRow } from "@/lib/cases";
import { parentCaseId } from "@/lib/session";
import { allItems, chosenSubjects, gridKeys, isVisible, validateSection, type Problem } from "@/lib/instrument/forms";
import { safeguardingHits, SG_MEANING } from "@/lib/instrument/safeguarding";
import { caseContext, DB_SOURCE, formFor, type StoredPayload } from "@/lib/instrument/store";
import type { Answers, FormDef, Source } from "@/lib/instrument/types";

const MAX_TEXT = 4000;

type Access = { c: CaseRow; source: Source } | { error: "link" | "locked" | "done" | "session" };

async function access(source: Source, token: string | undefined): Promise<Access> {
  let c: CaseRow | null = null;
  if (source === "parent") {
    const id = await parentCaseId();
    if (!id) return { error: "session" };
    c = await getCase(id);
    if (!c || !c.verified_at || c.withdrawn_at) return { error: "session" };
  } else {
    c = await caseByToken(source === "student" ? "student" : "teacher", String(token ?? "").slice(0, 64));
    if (!c) return { error: "link" };
  }
  if (c.status === "in_studio" || c.status === "delivered") return { error: "locked" };
  const have = await submittedSources(c.id);
  if (have.has(DB_SOURCE[source])) return { error: "done" };
  return { c, source };
}

/** Keep only keys the form defines, with values of the right shape and size. */
function sanitise(def: FormDef, raw: unknown): Answers {
  const a: Answers = {};
  if (!raw || typeof raw !== "object") return a;
  const r = raw as Record<string, unknown>;
  const allowed = new Set(allItems(def).map((i) => i.k));
  for (const s of def.subjects ?? []) {
    const g = gridKeys(s.v);
    allowed.add(g.enjoy);
    allowed.add(g.ease);
  }
  for (const [k, v] of Object.entries(r)) {
    if (!allowed.has(k)) continue;
    if (typeof v === "string") a[k] = v.slice(0, MAX_TEXT);
    else if (Array.isArray(v)) a[k] = v.filter((x): x is string => typeof x === "string").slice(0, 24).map((x) => x.slice(0, 40));
  }
  return a;
}

function sanitiseTimings(def: FormDef, raw: unknown): Record<string, number> {
  const t: Record<string, number> = {};
  if (!raw || typeof raw !== "object") return t;
  for (const s of def.sections) {
    const v = Number((raw as Record<string, unknown>)[s.id]);
    if (Number.isFinite(v) && v >= 0) t[s.id] = Math.min(Math.round(v), 6 * 3600 * 1000);
  }
  return t;
}

export async function saveDraft(input: { source: Source; token?: string; answers: unknown; timings: unknown; step: number }): Promise<{ ok: boolean }> {
  const acc = await access(input.source, input.token);
  if ("error" in acc) return { ok: false };
  const def = formFor(acc.c, input.source);
  if (!def) return { ok: false };
  const h = await deviceHash(true);
  const data = { answers: sanitise(def, input.answers), timings: sanitiseTimings(def, input.timings), step: Math.max(0, Math.min(Number(input.step) || 0, 40)) };
  const sql = await db();
  await sql`
    insert into drafts (case_id, source, device_hash, data_enc) values (${acc.c.id}, ${input.source}, ${h}, ${seal(data)})
    on conflict (case_id, source) do update set device_hash = excluded.device_hash, data_enc = excluded.data_enc, updated_at = now()`;
  return { ok: true };
}

export type SubmitResult = { ok?: true; error?: "link" | "locked" | "done" | "session" | "invalid"; problems?: Problem[]; section?: string };

export async function submitInstrument(input: { source: Source; token?: string; answers: unknown; timings: unknown }): Promise<SubmitResult> {
  const acc = await access(input.source, input.token);
  if ("error" in acc) return { error: acc.error };
  const { c, source } = acc;
  const ctx = caseContext(c);
  const def = formFor(c, source);
  if (!ctx || !def) return { error: "invalid" };
  const answers = sanitise(def, input.answers);
  const timings = sanitiseTimings(def, input.timings);

  // Server-side validation of every visible item, section by section.
  for (const s of def.sections) {
    const problems = validateSection(def, s, answers);
    if (problems.length) return { error: "invalid", problems, section: s.id };
  }
  // Drop answers to items that are no longer visible, and grid rows for subjects not studied.
  for (const i of allItems(def)) if (!isVisible(i, answers)) delete answers[i.k];
  if (def.subjects) {
    const keep = new Set(chosenSubjects(def, answers).flatMap((s) => Object.values(gridKeys(s.v))));
    for (const k of Object.keys(answers)) if (k.startsWith("S1.enjoy.") || k.startsWith("S1.ease.")) if (!keep.has(k)) delete answers[k];
  }

  const sg = safeguardingHits(def, answers);
  const payload: StoredPayload = { v: 2, band: ctx.band, answers, timings, sg };
  const sql = await db();
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim();
  const meta = { ipHash: ip ? lookupHash("ip:" + ip) : null, ua: (h.get("user-agent") ?? "").slice(0, 300) };

  await sql.begin(async (tx) => {
    if (source === "student") {
      const kind = ctx.band === "A" ? "student_assent_administered" : "student_assent";
      const items = ctx.band === "A"
        ? { administrator_name: answers["aS0.name"], administrator_role: answers["aS0.role"], mode: answers["aS0.mode"], not_parent: true, child_agreed: true }
        : { assent: true, setting: answers["S0.alone"] };
      await tx`insert into consents (case_id, kind, notice_version, items, ip_hash, user_agent)
               values (${c.id}, ${kind}, 'student-assent-v2-2026-11-23', ${tx.json(items as never)}, ${meta.ipHash}, ${meta.ua})`;
    }
    if (source === "teacher") {
      await tx`insert into consents (case_id, kind, notice_version, items, ip_hash, user_agent)
               values (${c.id}, 'teacher_declaration', 'teacher-notice-v2-2026-11-23', ${tx.json({ declared_own_observation: true })}, ${meta.ipHash}, ${meta.ua})`;
    }
    await tx`
      insert into submissions (case_id, source, question_set, answers_enc)
      values (${c.id}, ${DB_SOURCE[source]}, ${def.version}, ${seal(payload)})
      on conflict (case_id, source) do nothing`;
    for (const hit of sg) {
      await tx`insert into safeguards (case_id, code, source, item) values (${c.id}, ${hit.code}, ${hit.source}, ${hit.item})`;
    }
    await tx`delete from drafts where case_id = ${c.id} and source = ${source}`;
    await tx`update cases set instrument = ${def.version} where id = ${c.id}`;
  });
  await audit(c.id, source, `${source}_submitted_v2`);

  const have = await submittedSources(c.id);
  if (have.size === 3 && c.status === "collecting") await sql`update cases set status = 'ready' where id = ${c.id}`;

  if (sg.length) {
    await audit(c.id, "system", `safeguarding:${[...new Set(sg.map((x) => x.code))].join(",")}`);
    const codes = [...new Set(sg.map((x) => x.code))];
    await notifySafeguarding(c.ref, codes.map((code) => `${code} (${source}): ${SG_MEANING[code]}`), `${baseUrl()}/admin/case/${c.id}`);
  }
  await notifyAdmin(
    `PLINTH portal: ${source} form received for ${c.ref}`,
    `Case ${c.ref} (Band ${ctx.band}): the ${source} form was received. Sources in: ${have.size}/3.${sg.length ? " Safeguarding triggers were raised — see the separate alert." : ""}`,
  );
  return { ok: true };
}

import "server-only";
import { db } from "../db";
import { open } from "../crypto";
import type { CaseRow, Child } from "../cases";
import { decodeCase } from "../cases";
import { bandForAge, buildForm, exactAge, INSTRUMENT_VERSION } from "./forms";
import { buildLedger, validity, type LedgerEntry, type Submitted, type Validity } from "./scoring";
import { deriveSignals, interestTexture, type Derived, type InterestTexture } from "./derived";
import { safeguardingHits, type SgHit } from "./safeguarding";
import type { Answers, Band, FormDef, Source } from "./types";

/** Database keeps the original source names; "educator" is the teacher form. */
export const DB_SOURCE: Record<Source, "student" | "parent" | "educator"> = { student: "student", parent: "parent", teacher: "educator" };
export const FROM_DB: Record<string, Source> = { student: "student", parent: "parent", educator: "teacher" };

export type CaseContext = { band: Band; age: number; klass: string; child: Child };

export function caseContext(c: CaseRow & { band?: string | null }): CaseContext | null {
  const { child } = decodeCase(c);
  const age = exactAge(child.dob);
  const band = (c.band as Band | null) ?? bandForAge(age);
  if (!band) return null;
  return { band, age, klass: child.klass, child };
}

export function formFor(c: CaseRow, source: Source): FormDef | null {
  const ctx = caseContext(c);
  if (!ctx) return null;
  return buildForm(source, ctx);
}

export type StoredPayload = { v: 2; band: Band; answers: Answers; timings: Record<string, number>; sg: SgHit[] };

export type V2Submission = { source: Source; submitted_at: Date; question_set: string; payload: StoredPayload } | { source: Source; submitted_at: Date; question_set: string; legacy: Record<string, string> };

export async function loadSubmissions(caseId: string): Promise<V2Submission[]> {
  const sql = await db();
  const rows = await sql<{ source: string; question_set: string; answers_enc: string; submitted_at: Date }[]>`
    select source, question_set, answers_enc, submitted_at from submissions where case_id = ${caseId} order by submitted_at`;
  return rows.map((r) => {
    const data = open<Record<string, unknown>>(r.answers_enc);
    const source = FROM_DB[r.source];
    if (data && (data as { v?: number }).v === 2) return { source, submitted_at: r.submitted_at, question_set: r.question_set, payload: data as unknown as StoredPayload };
    return { source, submitted_at: r.submitted_at, question_set: r.question_set, legacy: data as Record<string, string> };
  });
}

export type Analysis = {
  ctx: CaseContext;
  version: string;
  submitted: Partial<Record<Source, Submitted & { at: Date }>>;
  legacy: Source[];
  validity: Partial<Record<Source, Validity>>;
  ledger: LedgerEntry[];
  derived: Derived[];
  interest: InterestTexture;
  hits: SgHit[];
};

export async function analyse(c: CaseRow): Promise<Analysis | null> {
  const ctx = caseContext(c);
  if (!ctx) return null;
  const subs = await loadSubmissions(c.id);
  const submitted: Analysis["submitted"] = {};
  const legacy: Source[] = [];
  const hits: SgHit[] = [];
  for (const s of subs) {
    if ("legacy" in s) {
      legacy.push(s.source);
      continue;
    }
    const def = buildForm(s.source, { ...ctx, band: s.payload.band });
    submitted[s.source] = { def, answers: s.payload.answers, timings: s.payload.timings, at: s.submitted_at };
    hits.push(...(s.payload.sg ?? safeguardingHits(def, s.payload.answers)));
  }
  const val: Analysis["validity"] = {};
  for (const src of Object.keys(submitted) as Source[]) val[src] = validity(submitted[src]!);
  return {
    ctx,
    version: INSTRUMENT_VERSION,
    submitted,
    legacy,
    validity: val,
    ledger: buildLedger(ctx.band, submitted, val),
    derived: deriveSignals(ctx.band, ctx, submitted, val),
    interest: interestTexture(submitted.student, val.student),
    hits,
  };
}

export type SafeguardRow = { id: number; code: string; source: string; item: string; created_at: Date; status: string; note_enc: string | null; actioned_at: Date | null };

export async function safeguardRows(caseId: string): Promise<SafeguardRow[]> {
  const sql = await db();
  return sql<SafeguardRow[]>`select * from safeguards where case_id = ${caseId} order by created_at, id`;
}

export type ReviewRow = { reviewer: string; role: string; attest: Record<string, boolean>; at: Date };

export async function latestReview(caseId: string): Promise<ReviewRow | null> {
  const sql = await db();
  const rows = await sql<ReviewRow[]>`select reviewer, role, attest, at from reviews where case_id = ${caseId} order by at desc limit 1`;
  return rows[0] ?? null;
}

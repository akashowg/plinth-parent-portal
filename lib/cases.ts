import "server-only";
import { db } from "./db";
import { lookupHash, open } from "./crypto";

export type Parent = { name: string; relation: string; email: string; whatsapp?: string; otherParent?: string };
export type Child = { name: string; dob: string; klass: string; gender: string; city: string; state: string };
export type Tokens = { student: string; teacher: string };

export type CaseRow = {
  id: string;
  ref: string;
  created_at: Date;
  lang: string;
  status: string;
  parent_enc: string;
  child_enc: string;
  tokens_enc: string;
  verified_at: Date | null;
  withdrawn_at: Date | null;
  admin_note: string | null;
};

export const ADMIN_STATUSES = ["collecting", "ready", "in_studio", "delivered"] as const;

export async function getCase(id: string): Promise<CaseRow | null> {
  const sql = await db();
  const rows = await sql<CaseRow[]>`select * from cases where id = ${id}`;
  return rows[0] ?? null;
}

export async function caseByToken(kind: "student" | "teacher", token: string): Promise<CaseRow | null> {
  if (!token || token.length > 64) return null;
  const sql = await db();
  const h = lookupHash(`${kind}:${token}`);
  const rows =
    kind === "student"
      ? await sql<CaseRow[]>`select * from cases where student_token_hash = ${h}`
      : await sql<CaseRow[]>`select * from cases where teacher_token_hash = ${h}`;
  const c = rows[0];
  if (!c || c.withdrawn_at || !c.verified_at) return null;
  return c;
}

export async function submittedSources(caseId: string): Promise<Set<string>> {
  const sql = await db();
  const rows = await sql<{ source: string }[]>`select source from submissions where case_id = ${caseId}`;
  return new Set(rows.map((r) => r.source));
}

export function decodeCase(c: CaseRow) {
  return {
    parent: open<Parent>(c.parent_enc),
    child: open<Child>(c.child_enc),
    tokens: open<Tokens>(c.tokens_enc),
  };
}

export type Submission = { source: "parent" | "student" | "educator"; question_set: string; answers: Record<string, string>; submitted_at: Date };

export async function getSubmissions(caseId: string): Promise<Submission[]> {
  const sql = await db();
  const rows = await sql<{ source: Submission["source"]; question_set: string; answers_enc: string; submitted_at: Date }[]>`
    select source, question_set, answers_enc, submitted_at from submissions where case_id = ${caseId} order by submitted_at`;
  return rows.map((r) => ({ source: r.source, question_set: r.question_set, answers: open(r.answers_enc), submitted_at: r.submitted_at }));
}

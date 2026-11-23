import "server-only";
import postgres from "postgres";
import { requireEnv } from "./env";

type Sql = ReturnType<typeof postgres>;
const g = globalThis as unknown as { __plinthSql?: Sql; __plinthSchema?: Promise<void> };

function client(): Sql {
  if (!g.__plinthSql) {
    const url = requireEnv("DATABASE_URL");
    const local = /@(localhost|127\.0\.0\.1)[:/]/.test(url) || url.includes("host=/");
    g.__plinthSql = postgres(url, {
      ssl: local || process.env.DATABASE_SSL === "disable" ? false : "require",
      max: 3,
      idle_timeout: 20,
      prepare: false, // works with connection poolers (Supabase, Neon)
    });
  }
  return g.__plinthSql;
}

const SCHEMA = `
create table if not exists cases (
  id uuid primary key default gen_random_uuid(),
  ref text unique not null,
  created_at timestamptz not null default now(),
  lang text not null default 'en',
  status text not null default 'awaiting_verification',
  email_hash text not null,
  parent_enc text not null,
  child_enc text not null,
  student_token_hash text unique not null,
  teacher_token_hash text unique not null,
  tokens_enc text not null,
  verified_at timestamptz,
  withdrawn_at timestamptz,
  admin_note text
);
create index if not exists cases_email_hash on cases(email_hash);

create table if not exists consents (
  id bigserial primary key,
  case_id uuid not null references cases(id) on delete cascade,
  kind text not null,
  notice_version text not null,
  items jsonb not null,
  at timestamptz not null default now(),
  ip_hash text,
  user_agent text
);

create table if not exists submissions (
  id bigserial primary key,
  case_id uuid not null references cases(id) on delete cascade,
  source text not null check (source in ('parent','student','educator')),
  question_set text not null,
  answers_enc text not null,
  submitted_at timestamptz not null default now(),
  unique (case_id, source)
);

create table if not exists codes (
  id bigserial primary key,
  email_hash text not null,
  case_id uuid references cases(id) on delete cascade,
  code_hash text not null,
  purpose text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  attempts int not null default 0,
  used_at timestamptz
);
create index if not exists codes_email on codes(email_hash, created_at desc);

create table if not exists audit (
  id bigserial primary key,
  case_id uuid,
  actor text not null,
  action text not null,
  at timestamptz not null default now()
);
`;

/** Returns the SQL client after making sure the tables exist (once per server instance). */
export async function db(): Promise<Sql> {
  const sql = client();
  if (!g.__plinthSchema) {
    g.__plinthSchema = sql.unsafe(SCHEMA).then(() => undefined);
    g.__plinthSchema.catch(() => {
      g.__plinthSchema = undefined;
    });
  }
  await g.__plinthSchema;
  return sql;
}

export async function audit(caseId: string | null, actor: string, action: string) {
  const sql = await db();
  await sql`insert into audit (case_id, actor, action) values (${caseId}, ${actor}, ${action})`;
}

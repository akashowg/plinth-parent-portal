import "server-only";
import postgres from "postgres";
import { databaseUrl } from "./env";

type Sql = ReturnType<typeof postgres>;
const g = globalThis as unknown as { __plinthSql?: Sql; __plinthSchema?: Promise<void> };

function client(): Sql {
  if (!g.__plinthSql) {
    // Drop provider-specific query options (e.g. Supabase's ?supa=…, ?sslmode=…); TLS is set explicitly below.
    const u = new URL(databaseUrl());
    u.search = "";
    const url = u.toString();
    const local = ["localhost", "127.0.0.1"].includes(u.hostname);
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

alter table cases add column if not exists band text;
alter table cases add column if not exists instrument text;

create table if not exists drafts (
  case_id uuid not null references cases(id) on delete cascade,
  source text not null,
  device_hash text not null,
  data_enc text not null,
  updated_at timestamptz not null default now(),
  primary key (case_id, source)
);
alter table drafts add column if not exists pin_locked boolean not null default false;
alter table drafts add column if not exists attempts int not null default 0;
alter table drafts add column if not exists step int not null default 0;

create table if not exists safeguards (
  id bigserial primary key,
  case_id uuid not null references cases(id) on delete cascade,
  code text not null,
  source text not null,
  item text not null,
  created_at timestamptz not null default now(),
  status text not null default 'open',
  note_enc text,
  actioned_at timestamptz
);
create index if not exists safeguards_case on safeguards(case_id);
alter table safeguards add column if not exists detail_enc text;
alter table safeguards add column if not exists outcome text;

create table if not exists sg_terms (
  id bigserial primary key,
  phrase text not null,
  category text not null,
  severity text not null check (severity in ('urgent','concern')),
  kind text not null default 'match' check (kind in ('match','except')),
  active boolean not null default true,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists reviews (
  id bigserial primary key,
  case_id uuid not null references cases(id) on delete cascade,
  reviewer text not null,
  role text not null,
  attest jsonb not null,
  at timestamptz not null default now()
);

create table if not exists stt_usage (
  key_hash text not null,
  hour timestamptz not null,
  seconds real not null default 0,
  requests integer not null default 0,
  primary key (key_hash, hour)
);

-- One row: set when Sarvam rejects the key or the credits run out, so every form falls back to the
-- browser's own speech engine until the pause ends (re-checked automatically after it).
create table if not exists stt_state (
  id integer primary key default 1 check (id = 1),
  paused_until timestamptz,
  reason text,
  alerted_at timestamptz
);

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

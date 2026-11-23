"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { audit, db } from "@/lib/db";
import { caseRef, lookupHash, randomToken, safeEqual, seal, sixDigitCode } from "@/lib/crypto";
import { devShowCodes, requireEnv } from "@/lib/env";
import { notifyAdmin, sendMail } from "@/lib/email";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import { CLASS_OPTIONS, collectAnswers, QUESTION_SET_VERSION } from "@/lib/questions";
import { ADMIN_STATUSES, caseByToken, getCase, submittedSources } from "@/lib/cases";
import { clearAdminSession, clearParentSession, isAdmin, parentCaseId, setAdminSession, setParentSession } from "@/lib/session";

import { CONSENT_ITEMS, CONSENT_VERSION, type FormState } from "@/lib/consent";

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;
const s = (fd: FormData, k: string, max = 120) => String(fd.get(k) ?? "").trim().slice(0, max);

async function requestMeta() {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim();
  return { ipHash: ip ? lookupHash("ip:" + ip) : null, ua: (h.get("user-agent") ?? "").slice(0, 300) };
}

async function issueCode(emailHash: string, email: string, caseId: string, purpose: "verify" | "login") {
  const sql = await db();
  const recent = await sql<{ n: number }[]>`
    select count(*)::int as n from codes where email_hash = ${emailHash} and created_at > now() - interval '1 hour'`;
  if ((recent[0]?.n ?? 0) >= 5) return { tooMany: true as const };
  const code = sixDigitCode();
  await sql`insert into codes (email_hash, case_id, code_hash, purpose, expires_at)
            values (${emailHash}, ${caseId}, ${lookupHash("code:" + code)}, ${purpose}, now() + interval '10 minutes')`;
  const lang = await getLang();
  const subject = lang === "hi" ? `PLINTH HDI सत्यापन कोड: ${code}` : `Your PLINTH HDI verification code: ${code}`;
  const text =
    lang === "hi"
      ? `आपका PLINTH HDI कोड ${code} है। यह 10 मिनट तक मान्य है।\n\nयदि आपने यह अनुरोध नहीं किया, तो इस ईमेल को अनदेखा करें।\n\n— PLINTH HDI · PLINTH Network की एक पहल`
      : `Your PLINTH HDI code is ${code}. It works for 10 minutes.\n\nIf you did not ask for this, you can ignore this email.\n\n— PLINTH HDI · a PLINTH Network initiative`;
  const sent = await sendMail({ to: email, subject, text });
  if (!sent.ok) return { mailFailed: true as const };
  return { code: devShowCodes() ? code : undefined };
}

/* ------------------------------------------------------------------ start + consent */
export async function startCase(_: FormState, fd: FormData): Promise<FormState> {
  const lang = await getLang();
  const parent = {
    name: s(fd, "parentName"),
    relation: s(fd, "relation", 30),
    email: s(fd, "email", 254).toLowerCase(),
    whatsapp: s(fd, "whatsapp", 20).replace(/[^\d+ ]/g, ""),
    otherParent: s(fd, "otherParent"),
  };
  const child = {
    name: s(fd, "childName"),
    dob: s(fd, "dob", 10),
    klass: s(fd, "klass", 20),
    gender: s(fd, "gender", 30),
    city: s(fd, "city", 80),
    state: s(fd, "state", 80),
  };
  if (!parent.name || !parent.relation || !parent.email || !child.name || !child.dob || !child.klass || !child.gender || !child.city || !child.state)
    return { error: t(lang, "errRequired") };
  if (!["Mother", "Father", "Legal guardian"].includes(parent.relation)) return { error: t(lang, "errRequired") };
  if (!CLASS_OPTIONS.includes(child.klass)) return { error: t(lang, "errRequired") };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(child.dob) || Number.isNaN(Date.parse(child.dob)) || Date.parse(child.dob) > Date.now())
    return { error: t(lang, "errRequired") };
  if (!EMAIL_RE.test(parent.email)) return { error: t(lang, "errEmail") };
  const items = Object.fromEntries(CONSENT_ITEMS.map((k) => [k, fd.get(k) === "yes"]));
  if (!CONSENT_ITEMS.every((k) => items[k])) return { error: t(lang, "errConsent") };

  const sql = await db();
  const emailHash = lookupHash("email:" + parent.email);
  const tokens = { student: randomToken(18), teacher: randomToken(18) };
  const meta = await requestMeta();
  const [row] = await sql<{ id: string }[]>`
    insert into cases (ref, lang, email_hash, parent_enc, child_enc, student_token_hash, teacher_token_hash, tokens_enc)
    values (${caseRef()}, ${lang}, ${emailHash}, ${seal(parent)}, ${seal(child)},
            ${lookupHash("student:" + tokens.student)}, ${lookupHash("teacher:" + tokens.teacher)}, ${seal(tokens)})
    returning id`;
  await sql`insert into consents (case_id, kind, notice_version, items, ip_hash, user_agent)
            values (${row.id}, 'parent_consent_given', ${CONSENT_VERSION}, ${sql.json({ ...items, lang })}, ${meta.ipHash}, ${meta.ua})`;
  await audit(row.id, "parent", "case_created");

  const r = await issueCode(emailHash, parent.email, row.id, "verify");
  if ("tooMany" in r) return { error: t(lang, "errTooMany") };
  if ("mailFailed" in r) return { error: t(lang, "errMail") };
  redirect(`/verify?c=${row.id}${r.code ? `&dev=${r.code}` : ""}`);
}

/* ------------------------------------------------------------------ verify code */
export async function verifyCode(_: FormState, fd: FormData): Promise<FormState> {
  const lang = await getLang();
  const caseId = s(fd, "c", 40);
  const code = s(fd, "code", 6).replace(/\D/g, "");
  if (!/^[0-9a-f-]{36}$/.test(caseId) || code.length !== 6) return { error: t(lang, "errCode") };
  const sql = await db();
  const rows = await sql<{ id: number; code_hash: string; attempts: number }[]>`
    select id, code_hash, attempts from codes
    where case_id = ${caseId} and used_at is null and expires_at > now()
    order by created_at desc limit 1`;
  const row = rows[0];
  if (!row || row.attempts >= 5) return { error: t(lang, "errCode") };
  if (!safeEqual(row.code_hash, lookupHash("code:" + code))) {
    await sql`update codes set attempts = attempts + 1 where id = ${row.id}`;
    return { error: t(lang, "errCode") };
  }
  await sql`update codes set used_at = now() where id = ${row.id}`;
  const [c] = await sql<{ verified_at: Date | null; withdrawn_at: Date | null; ref: string }[]>`
    select verified_at, withdrawn_at, ref from cases where id = ${caseId}`;
  if (!c || c.withdrawn_at) return { error: t(lang, "errCode") };
  if (!c.verified_at) {
    await sql`update cases set verified_at = now(), status = 'collecting' where id = ${caseId}`;
    const meta = await requestMeta();
    await sql`insert into consents (case_id, kind, notice_version, items, ip_hash, user_agent)
              values (${caseId}, 'email_verified', ${CONSENT_VERSION}, ${sql.json({ method: "email_otp" })}, ${meta.ipHash}, ${meta.ua})`;
    await audit(caseId, "parent", "email_verified");
    await notifyAdmin(`PLINTH portal: new profile ${c.ref}`, `A parent has given consent and verified their email for case ${c.ref}.`);
  }
  await setParentSession(caseId);
  redirect("/case");
}

/* ------------------------------------------------------------------ returning parent */
export async function requestLogin(_: FormState, fd: FormData): Promise<FormState> {
  const lang = await getLang();
  const email = s(fd, "email", 254).toLowerCase();
  if (!EMAIL_RE.test(email)) return { error: t(lang, "errEmail") };
  const sql = await db();
  const emailHash = lookupHash("email:" + email);
  const rows = await sql<{ id: string }[]>`
    select id from cases where email_hash = ${emailHash} and withdrawn_at is null order by created_at desc limit 1`;
  const c = rows[0];
  if (!c) return { done: true, message: t(lang, "loginSent") }; // do not reveal whether the email exists
  const r = await issueCode(emailHash, email, c.id, "login");
  if ("tooMany" in r) return { error: t(lang, "errTooMany") };
  if ("mailFailed" in r) return { error: t(lang, "errMail") };
  redirect(`/verify?c=${c.id}${r.code ? `&dev=${r.code}` : ""}`);
}

export async function signOut() {
  await clearParentSession();
  redirect("/");
}

/* ------------------------------------------------------------------ submissions */
async function saveSubmission(caseId: string, source: "parent" | "student" | "educator", answers: Record<string, string>) {
  const sql = await db();
  await sql`
    insert into submissions (case_id, source, question_set, answers_enc)
    values (${caseId}, ${source}, ${QUESTION_SET_VERSION}, ${seal(answers)})
    on conflict (case_id, source) do update
      set answers_enc = excluded.answers_enc, question_set = excluded.question_set, submitted_at = now()`;
  await audit(caseId, source, `${source}_submitted`);
  const have = await submittedSources(caseId);
  const [c] = await sql<{ ref: string; status: string }[]>`select ref, status from cases where id = ${caseId}`;
  if (have.size === 3 && c.status === "collecting") {
    await sql`update cases set status = 'ready' where id = ${caseId}`;
  }
  await notifyAdmin(
    `PLINTH portal: ${source} form received for ${c.ref}`,
    `Case ${c.ref}: the ${source} form was received. Sources in: ${[...have].join(", ")} (${have.size}/3).`,
  );
}

function blocked(c: { status: string; withdrawn_at: Date | null }) {
  return !!c.withdrawn_at || c.status === "in_studio" || c.status === "delivered";
}

export async function submitParentForm(_: FormState, fd: FormData): Promise<FormState> {
  const lang = await getLang();
  const id = await parentCaseId();
  if (!id) redirect("/login");
  const c = await getCase(id);
  if (!c || !c.verified_at || blocked(c)) redirect("/case");
  const { answers, missing } = collectAnswers("parent", fd);
  if (missing.length) return { error: t(lang, "errRequired") };
  await saveSubmission(id, "parent", answers);
  redirect("/case?saved=parent");
}

export async function submitStudentForm(_: FormState, fd: FormData): Promise<FormState> {
  const lang = await getLang();
  const token = s(fd, "token", 64);
  const c = await caseByToken("student", token);
  if (!c) return { error: t(lang, "linkInvalid") };
  if (blocked(c)) return { error: t(lang, "alreadyAnswered") };
  if (fd.get("assent") !== "yes") return { error: t(lang, "errAssent") };
  const { answers } = collectAnswers("student", fd); // children may skip any question
  const sql = await db();
  const meta = await requestMeta();
  await sql`insert into consents (case_id, kind, notice_version, items, ip_hash, user_agent)
            values (${c.id}, 'student_assent', 'student-assent-v1-2026-11-23', ${sql.json({ assent: true, lang })}, ${meta.ipHash}, ${meta.ua})`;
  await saveSubmission(c.id, "student", answers);
  return { done: true };
}

export async function submitTeacherForm(_: FormState, fd: FormData): Promise<FormState> {
  const lang = await getLang();
  const token = s(fd, "token", 64);
  const c = await caseByToken("teacher", token);
  if (!c) return { error: t(lang, "linkInvalid") };
  if (blocked(c)) return { error: t(lang, "alreadyAnswered") };
  if (fd.get("declare") !== "yes") return { error: t(lang, "errDeclare") };
  const { answers, missing } = collectAnswers("educator", fd);
  if (missing.length) return { error: t(lang, "errRequired") };
  const sql = await db();
  const meta = await requestMeta();
  await sql`insert into consents (case_id, kind, notice_version, items, ip_hash, user_agent)
            values (${c.id}, 'teacher_declaration', 'teacher-notice-v1-2026-11-23', ${sql.json({ declared_own_observation: true, lang })}, ${meta.ipHash}, ${meta.ua})`;
  await saveSubmission(c.id, "educator", answers);
  return { done: true };
}

/* ------------------------------------------------------------------ withdrawal */
export async function withdrawConsent(_: FormState, fd: FormData): Promise<FormState> {
  const lang = await getLang();
  const id = await parentCaseId();
  if (!id) redirect("/login");
  if (s(fd, "confirm", 20).toUpperCase() !== "WITHDRAW") return { error: t(lang, "withdrawConfirm") };
  const sql = await db();
  const meta = await requestMeta();
  const [c] = await sql<{ ref: string }[]>`select ref from cases where id = ${id}`;
  await sql.begin(async (tx) => {
    await tx`delete from submissions where case_id = ${id}`;
    await tx`delete from codes where case_id = ${id}`;
    // Keep only the proof that consent was given and withdrawn; erase the personal details.
    await tx`update cases set withdrawn_at = now(), status = 'withdrawn',
               parent_enc = ${seal({ erased: true })}, child_enc = ${seal({ erased: true })}, tokens_enc = ${seal({ erased: true })},
               student_token_hash = ${"erased:" + randomToken(12)}, teacher_token_hash = ${"erased:" + randomToken(12)},
               email_hash = ${"erased:" + randomToken(12)}
             where id = ${id}`;
    await tx`insert into consents (case_id, kind, notice_version, items, ip_hash, user_agent)
             values (${id}, 'consent_withdrawn', ${CONSENT_VERSION}, ${tx.json({ data_deleted: true })}, ${meta.ipHash}, ${meta.ua})`;
  });
  await audit(id, "parent", "consent_withdrawn_data_deleted");
  await notifyAdmin(
    `PLINTH portal: consent withdrawn for ${c?.ref}`,
    `The parent for case ${c?.ref} withdrew consent. The portal deleted their answers. Delete any copy of this case held in PLINTH Studio as well.`,
  );
  await clearParentSession();
  redirect("/withdrawn");
}

/* ------------------------------------------------------------------ admin */
const adminTries = new Map<string, { n: number; at: number }>();

export async function adminLogin(_: FormState, fd: FormData): Promise<FormState> {
  const meta = await requestMeta();
  const key = meta.ipHash ?? "unknown";
  const rec = adminTries.get(key);
  if (rec && rec.n >= 8 && Date.now() - rec.at < 15 * 60_000) return { error: "Too many attempts. Wait 15 minutes." };
  const pw = String(fd.get("password") ?? "");
  const expected = requireEnv("ADMIN_PASSWORD");
  if (!safeEqual(lookupHash("pw:" + pw), lookupHash("pw:" + expected))) {
    adminTries.set(key, { n: (rec?.n ?? 0) + 1, at: Date.now() });
    await audit(null, "admin", "login_failed");
    return { error: "Incorrect password." };
  }
  adminTries.delete(key);
  await setAdminSession();
  await audit(null, "admin", "login");
  redirect("/admin");
}

export async function adminLogout() {
  await clearAdminSession();
  redirect("/admin");
}

export async function adminSetStatus(fd: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const id = s(fd, "id", 40);
  const status = s(fd, "status", 20);
  const note = String(fd.get("note") ?? "").slice(0, 2000);
  if (!(ADMIN_STATUSES as readonly string[]).includes(status)) redirect(`/admin/case/${id}`);
  const sql = await db();
  await sql`update cases set status = ${status}, admin_note = ${note || null} where id = ${id} and withdrawn_at is null`;
  await audit(id, "admin", `status:${status}`);
  redirect(`/admin/case/${id}?updated=1`);
}

export async function adminEraseCase(fd: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const id = s(fd, "id", 40);
  if (s(fd, "confirm", 20).toUpperCase() !== "ERASE") redirect(`/admin/case/${id}?erase=confirm`);
  const sql = await db();
  await sql`delete from cases where id = ${id}`;
  await audit(id, "admin", "case_erased");
  redirect("/admin?erased=1");
}

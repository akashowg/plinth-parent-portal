"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { audit, db } from "@/lib/db";
import { caseRef, lookupHash, randomToken, safeEqual, seal, sixDigitCode } from "@/lib/crypto";
import { devShowCodes, requireEnv } from "@/lib/env";
import { notifyAdmin, sendMail } from "@/lib/email";
import { getLang } from "@/lib/lang";
import { t } from "@/lib/i18n";
import { bandForAge, CLASS_OPTIONS, exactAge } from "@/lib/instrument/forms";
import { ADMIN_STATUSES, getCase } from "@/lib/cases";
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
  const band = bandForAge(exactAge(child.dob));
  if (!band) return { error: t(lang, "errAge") };
  if (!EMAIL_RE.test(parent.email)) return { error: t(lang, "errEmail") };
  const items = Object.fromEntries(CONSENT_ITEMS.map((k) => [k, fd.get(k) === "yes"]));
  if (!CONSENT_ITEMS.every((k) => items[k])) return { error: t(lang, "errConsent") };

  const sql = await db();
  const emailHash = lookupHash("email:" + parent.email);
  const tokens = { student: randomToken(18), teacher: randomToken(18) };
  const meta = await requestMeta();
  const [row] = await sql<{ id: string }[]>`
    insert into cases (ref, lang, band, email_hash, parent_enc, child_enc, student_token_hash, teacher_token_hash, tokens_enc)
    values (${caseRef()}, ${lang}, ${band}, ${emailHash}, ${seal(parent)}, ${seal(child)},
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
  const [c] = await sql<{ verified_at: Date | null; withdrawn_at: Date | null; ref: string; band: string | null }[]>`
    select verified_at, withdrawn_at, ref, band from cases where id = ${caseId}`;
  if (!c || c.withdrawn_at) return { error: t(lang, "errCode") };
  if (!c.verified_at) {
    await sql`update cases set verified_at = now(), status = 'collecting' where id = ${caseId}`;
    const meta = await requestMeta();
    await sql`insert into consents (case_id, kind, notice_version, items, ip_hash, user_agent)
              values (${caseId}, 'email_verified', ${CONSENT_VERSION}, ${sql.json({ method: "email_otp" })}, ${meta.ipHash}, ${meta.ua})`;
    await audit(caseId, "parent", "email_verified");
    await notifyAdmin(
      `PLINTH portal: new profile ${c.ref} (Band ${c.band ?? "?"})`,
      `A parent has given consent and verified their email for case ${c.ref}.` +
        (c.band === "A"
          ? "\n\nBand A (ages 6–10): the child's questions must be read aloud one-to-one by a trained adult who is not a parent. Contact the family to arrange the session; the administrator link is on the admin case page."
          : ""),
    );
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
    await tx`delete from drafts where case_id = ${id}`;
    await tx`update safeguards set note_enc = null where case_id = ${id}`;
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

/* ------------------------------------------------------------------ admin · safeguarding and review */
export async function adminActionSafeguard(fd: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const id = s(fd, "id", 40);
  const sgId = Number(s(fd, "sg", 20));
  const outcome = s(fd, "outcome", 30);
  const note = String(fd.get("note") ?? "").trim().slice(0, 2000);
  if (!["actioned", "cleared_context", "false_alarm"].includes(outcome) || note.length < 10) redirect(`/admin/case/${id}?sg=note`);
  const status = outcome === "actioned" ? "actioned" : "cleared";
  const sql = await db();
  await sql`update safeguards set status = ${status}, outcome = ${outcome}, note_enc = ${seal({ note, by: "admin" })}, actioned_at = now()
            where id = ${sgId} and case_id = ${id}`;
  await audit(id, "admin", `safeguard_${outcome}:${sgId}`);
  redirect(`/admin/case/${id}?updated=sg-${sgId}`);
}

/* ------------------------------------------------------------------ admin · safeguarding lexicon */
const TERM_CATEGORIES = [
  "self_harm", "sexual_abuse", "physical_abuse", "emotional_abuse", "neglect", "exploitation",
  "bullying", "fear_of_home", "substance", "distress", "custom",
];

export async function adminAddTerm(fd: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const phrase = s(fd, "phrase", 120);
  const category = s(fd, "category", 30);
  const kind = s(fd, "kind", 10) === "except" ? "except" : "match";
  const severity = kind === "except" ? "concern" : s(fd, "severity", 10) === "urgent" ? "urgent" : "concern";
  const note = s(fd, "note", 300);
  if (phrase.length < 3 || !TERM_CATEGORIES.includes(category)) redirect("/admin/safeguarding?term=invalid");
  const sql = await db();
  await sql`insert into sg_terms (phrase, category, severity, kind, note) values (${phrase}, ${category}, ${severity}, ${kind}, ${note || null})`;
  await audit(null, "admin", `sg_term_added:${kind}`);
  redirect("/admin/safeguarding?term=added");
}

export async function adminToggleTerm(fd: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const id = Number(s(fd, "id", 20));
  const sql = await db();
  await sql`update sg_terms set active = not active where id = ${id}`;
  await audit(null, "admin", `sg_term_toggled:${id}`);
  redirect("/admin/safeguarding?term=updated");
}

export async function adminTestLexicon(_: FormState, fd: FormData): Promise<FormState> {
  if (!(await isAdmin())) return { error: "Sign in again." };
  const text = String(fd.get("text") ?? "").slice(0, 2000);
  const { scanText, CATEGORY_LABEL } = await import("@/lib/instrument/lexicon");
  const { customTerms } = await import("@/lib/instrument/store");
  const hits = scanText(text, await customTerms());
  if (!hits.length) return { message: "No match. This text would go to the engine." };
  return {
    message: hits
      .map((h) => `${h.severity.toUpperCase()} · ${CATEGORY_LABEL[h.category]} · “${h.phrase}”${h.tags.length ? ` · ${h.tags.join(", ")}` : ""}`)
      .join("\n"),
  };
}

export async function adminSignOff(fd: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const id = s(fd, "id", 40);
  const reviewer = s(fd, "reviewer", 120);
  const role = s(fd, "role", 120);
  const attest = {
    validity_flags_reviewed: fd.get("a_validity") === "yes",
    safeguarding_actioned_or_cleared: fd.get("a_safeguarding") === "yes",
    contradictions_preserved: fd.get("a_contradictions") === "yes",
  };
  if (!reviewer || !role || !Object.values(attest).every(Boolean)) redirect(`/admin/case/${id}?review=incomplete`);
  const sql = await db();
  const open_ = await sql<{ n: number }[]>`select count(*)::int as n from safeguards where case_id = ${id} and status = 'open'`;
  if ((open_[0]?.n ?? 0) > 0) redirect(`/admin/case/${id}?review=open`);
  await sql`insert into reviews (case_id, reviewer, role, attest) values (${id}, ${reviewer}, ${role}, ${sql.json(attest)})`;
  await audit(id, "admin", "reviewer_sign_off");
  redirect(`/admin/case/${id}?updated=review-${Date.now()}`);
}

export async function adminReopenSource(fd: FormData) {
  if (!(await isAdmin())) redirect("/admin");
  const id = s(fd, "id", 40);
  const source = s(fd, "source", 20);
  if (!["parent", "student", "educator"].includes(source) || s(fd, "confirm", 20).toUpperCase() !== "REOPEN") redirect(`/admin/case/${id}?reopen=confirm`);
  const sql = await db();
  await sql`delete from submissions where case_id = ${id} and source = ${source}`;
  await sql`update cases set status = 'collecting' where id = ${id} and status = 'ready'`;
  await audit(id, "admin", `reopened:${source}`);
  redirect(`/admin/case/${id}?updated=1`);
}


import "server-only";
import { createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { requireEnv } from "./env";
import { safeEqual } from "./crypto";

const PARENT = "pp_parent";
const ADMIN = "pp_admin";

function sign(payload: string): string {
  const mac = createHmac("sha256", requireEnv("SESSION_SECRET")).update(payload).digest("base64url");
  return `${payload}.${mac}`;
}

function verify(token: string | undefined): string | null {
  if (!token) return null;
  const i = token.lastIndexOf(".");
  if (i < 0) return null;
  const payload = token.slice(0, i);
  if (!safeEqual(sign(payload), token)) return null;
  const [value, exp] = payload.split("|");
  if (!value || !exp || Number(exp) < Date.now()) return null;
  return value;
}

const cookieBase = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export async function setParentSession(caseId: string) {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 7; // 7 days
  (await cookies()).set(PARENT, sign(`${caseId}|${exp}`), { ...cookieBase, maxAge: 60 * 60 * 24 * 7 });
}

export async function parentCaseId(): Promise<string | null> {
  return verify((await cookies()).get(PARENT)?.value);
}

export async function clearParentSession() {
  (await cookies()).delete(PARENT);
}

export async function setAdminSession() {
  const exp = Date.now() + 1000 * 60 * 60 * 8; // 8 hours
  (await cookies()).set(ADMIN, sign(`admin|${exp}`), { ...cookieBase, sameSite: "strict", maxAge: 60 * 60 * 8 });
}

export async function isAdmin(): Promise<boolean> {
  return verify((await cookies()).get(ADMIN)?.value) === "admin";
}

export async function clearAdminSession() {
  (await cookies()).delete(ADMIN);
}

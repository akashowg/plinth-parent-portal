import "server-only";

/** Read a required server-side setting. Throws a clear message when it is missing. */
export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v || !v.trim()) {
    throw new Error(`Missing setting ${name}. Add it in Vercel → Project → Settings → Environment Variables.`);
  }
  return v.trim();
}

export function optionalEnv(name: string): string | undefined {
  const v = process.env[name];
  return v && v.trim() ? v.trim() : undefined;
}

/** Settings the portal cannot run without. Shown on the admin page when any is missing. */
export const REQUIRED_SETTINGS = [
  "DATABASE_URL",
  "DATA_ENCRYPTION_KEY",
  "SESSION_SECRET",
  "ADMIN_PASSWORD",
  "RESEND_API_KEY",
  "EMAIL_FROM",
  "CONTACT_EMAIL",
  "PUBLIC_BASE_URL",
] as const;

export function missingSettings(): string[] {
  return REQUIRED_SETTINGS.filter((n) => !optionalEnv(n));
}

/** Development helper: show one-time codes on screen instead of emailing them. Never set in production. */
export function devShowCodes(): boolean {
  return process.env.DEV_SHOW_CODES === "1" && process.env.VERCEL_ENV !== "production";
}

export function baseUrl(): string {
  return (optionalEnv("PUBLIC_BASE_URL") ?? "http://localhost:3000").replace(/\/+$/, "");
}

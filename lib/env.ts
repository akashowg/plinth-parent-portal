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

/**
 * Database connection string. DATABASE_URL wins; otherwise the variable a Vercel Marketplace
 * database (Supabase, Neon) injects automatically, so nobody has to copy a database password.
 */
export function databaseUrl(): string {
  const v = optionalEnv("DATABASE_URL") ?? optionalEnv("POSTGRES_URL");
  if (!v) throw new Error("No database connected. Add one in Vercel → Project → Storage, or set DATABASE_URL.");
  return v;
}

/** Settings the portal cannot run without. Shown on the admin page when any is missing. */
export const REQUIRED_SETTINGS = ["DATA_ENCRYPTION_KEY", "ADMIN_PASSWORD", "CONTACT_EMAIL", "PUBLIC_BASE_URL"] as const;

export function missingSettings(): string[] {
  const missing: string[] = REQUIRED_SETTINGS.filter((n) => !optionalEnv(n));
  if (!optionalEnv("DATABASE_URL") && !optionalEnv("POSTGRES_URL")) missing.unshift("database (DATABASE_URL or a Vercel Storage database)");
  const gmail = optionalEnv("GMAIL_USER") && optionalEnv("GMAIL_APP_PASSWORD");
  const resend = optionalEnv("RESEND_API_KEY") && optionalEnv("EMAIL_FROM");
  if (!gmail && !resend) missing.push("email (GMAIL_USER + GMAIL_APP_PASSWORD)");
  return missing;
}

/** Development helper: show one-time codes on screen instead of emailing them. Never set in production. */
export function devShowCodes(): boolean {
  return process.env.DEV_SHOW_CODES === "1" && process.env.VERCEL_ENV !== "production";
}

export function baseUrl(): string {
  return (optionalEnv("PUBLIC_BASE_URL") ?? "http://localhost:3000").replace(/\/+$/, "");
}

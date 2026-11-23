import "server-only";
import { devShowCodes, optionalEnv, requireEnv } from "./env";

type Mail = { to: string; subject: string; text: string };

/** Send a plain-text email through Resend. In development without a key, the message is only logged. */
export async function sendMail(mail: Mail): Promise<{ ok: boolean; dev?: boolean }> {
  const key = optionalEnv("RESEND_API_KEY");
  if (!key) {
    if (devShowCodes() || process.env.NODE_ENV !== "production") {
      console.log(`[dev mail] to=${mail.to} subject=${mail.subject}\n${mail.text}`);
      return { ok: true, dev: true };
    }
    throw new Error("Email is not configured (RESEND_API_KEY).");
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: requireEnv("EMAIL_FROM"), to: [mail.to], subject: mail.subject, text: mail.text }),
  });
  if (!res.ok) {
    console.error("Resend error", res.status, await res.text().catch(() => ""));
    return { ok: false };
  }
  return { ok: true };
}

/** Notify PLINTH (ADMIN_EMAIL) about portal activity. Never includes children's answers. */
export async function notifyAdmin(subject: string, text: string) {
  const to = optionalEnv("ADMIN_EMAIL");
  if (!to) return;
  try {
    await sendMail({ to, subject, text });
  } catch (e) {
    console.error("Admin notification failed", e);
  }
}

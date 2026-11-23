import "server-only";
import nodemailer from "nodemailer";
import { devShowCodes, optionalEnv } from "./env";

type Mail = { to: string; subject: string; text: string };

/**
 * Send a plain-text email.
 *  - Gmail (GMAIL_USER + GMAIL_APP_PASSWORD): sends from that Gmail account over SMTP.
 *  - Resend (RESEND_API_KEY + EMAIL_FROM): for a verified domain of your own.
 * In development with neither configured, the message is only logged.
 */
export async function sendMail(mail: Mail): Promise<{ ok: boolean; dev?: boolean }> {
  const gmailUser = optionalEnv("GMAIL_USER");
  const gmailPass = optionalEnv("GMAIL_APP_PASSWORD");
  const resendKey = optionalEnv("RESEND_API_KEY");

  if (gmailUser && gmailPass) {
    try {
      const transport = nodemailer.createTransport({
        host: optionalEnv("SMTP_HOST") ?? "smtp.gmail.com",
        port: Number(optionalEnv("SMTP_PORT") ?? 465),
        secure: (optionalEnv("SMTP_PORT") ?? "465") === "465",
        auth: { user: gmailUser, pass: gmailPass.replace(/\s+/g, "") },
      });
      await transport.sendMail({
        from: optionalEnv("EMAIL_FROM") ?? `PLINTH HDI <${gmailUser}>`,
        to: mail.to,
        subject: mail.subject,
        text: mail.text,
      });
      return { ok: true };
    } catch (e) {
      console.error("Gmail send failed", e instanceof Error ? e.message : e);
      return { ok: false };
    }
  }

  if (resendKey) {
    const from = optionalEnv("EMAIL_FROM");
    if (!from) {
      console.error("EMAIL_FROM is required with Resend");
      return { ok: false };
    }
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${resendKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [mail.to], subject: mail.subject, text: mail.text }),
    });
    if (!res.ok) {
      console.error("Resend error", res.status, await res.text().catch(() => ""));
      return { ok: false };
    }
    return { ok: true };
  }

  if (devShowCodes() || process.env.NODE_ENV !== "production") {
    console.log(`[dev mail] to=${mail.to} subject=${mail.subject}\n${mail.text}`);
    return { ok: true, dev: true };
  }
  console.error("Email is not configured: set GMAIL_USER + GMAIL_APP_PASSWORD, or RESEND_API_KEY + EMAIL_FROM.");
  return { ok: false };
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

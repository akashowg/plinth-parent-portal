import "server-only";
import { db } from "./db";
import { notifyAdmin } from "./email";
import { optionalEnv } from "./env";

/**
 * Speech-to-text through Sarvam AI (India). Audio is passed through and never stored by PLINTH.
 *
 * Sarvam is the first choice; the browser's own speech engine is the fallback. If Sarvam rejects the key or
 * the credits run out, transcription pauses for PAUSE_MINUTES for every form (new pages open straight on the
 * browser engine, open pages switch mid-sentence), PLINTH is emailed at most once per ALERT_HOURS, and Sarvam
 * is tried again when the pause ends — so topping up credits or replacing the key needs no redeploy.
 */
const PAUSE_MINUTES = 15;
const ALERT_HOURS = 12;

export function sttConfigured(): boolean {
  return !!optionalEnv("SARVAM_API_KEY");
}

/** True when Sarvam should be used right now: a key is set and it is not paused after an account failure. */
export async function sttAvailable(): Promise<boolean> {
  if (!sttConfigured()) return false;
  try {
    const sql = await db();
    const [row] = await sql<{ paused: boolean }[]>`
      select coalesce(paused_until > now(), false) as paused from stt_state where id = 1`;
    return !row?.paused;
  } catch {
    return true; // the database check is advisory; a failing request still falls back on its own
  }
}

/** Sarvam language codes; note Odia is od-IN there. */
const SARVAM_LANG: Record<string, string> = {
  en: "en-IN", hi: "hi-IN", bn: "bn-IN", mr: "mr-IN", te: "te-IN", ta: "ta-IN",
  gu: "gu-IN", ur: "ur-IN", kn: "kn-IN", or: "od-IN", ml: "ml-IN",
};

/**
 * account: the key is rejected or the credits are used up (401, 402, 403) — nothing will work until fixed.
 * busy: Sarvam is rate-limiting (429). down: Sarvam failed or timed out (5xx, network).
 */
export type SttFailure = "account" | "busy" | "down";

export class SttError extends Error {
  constructor(public kind: SttFailure, message: string) {
    super(message);
  }
}

function classify(status: number): SttFailure {
  if (status === 401 || status === 402 || status === 403) return "account";
  if (status === 429) return "busy";
  return "down";
}

export async function transcribe(audio: Blob, lang: string): Promise<string> {
  const key = optionalEnv("SARVAM_API_KEY");
  if (!key) throw new SttError("account", "not configured");
  const base = (optionalEnv("SARVAM_API_URL") ?? "https://api.sarvam.ai").replace(/\/+$/, "");
  const form = new FormData();
  form.append("file", audio, "speech.wav");
  form.append("model", optionalEnv("SARVAM_STT_MODEL") ?? "saaras:v4");
  form.append("mode", "transcribe");
  form.append("language_code", SARVAM_LANG[lang] ?? "unknown");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12_000);
  try {
    const res = await fetch(`${base}/speech-to-text`, {
      method: "POST",
      headers: { "api-subscription-key": key },
      body: form,
      signal: ctrl.signal,
      cache: "no-store",
    });
    if (!res.ok) throw new SttError(classify(res.status), `sarvam ${res.status}`);
    const data = (await res.json()) as { transcript?: string };
    return (data.transcript ?? "").trim();
  } catch (e) {
    if (e instanceof SttError) throw e;
    throw new SttError("down", e instanceof Error ? e.name : "error");
  } finally {
    clearTimeout(timer);
  }
}

/** Pause Sarvam for every form after an account failure, and tell PLINTH (at most once per ALERT_HOURS). */
export async function pauseStt(reason: string): Promise<void> {
  try {
    const sql = await db();
    const [row] = await sql<{ alert: boolean }[]>`
      insert into stt_state (id, paused_until, reason, alerted_at)
      values (1, now() + make_interval(mins => ${PAUSE_MINUTES}), ${reason}, now())
      on conflict (id) do update set
        paused_until = excluded.paused_until,
        reason = excluded.reason,
        alerted_at = case when stt_state.alerted_at is null or stt_state.alerted_at < now() - make_interval(hours => ${ALERT_HOURS})
                          then now() else stt_state.alerted_at end
      returning (alerted_at > now() - interval '5 seconds') as alert`;
    console.error(`Sarvam speech-to-text paused for ${PAUSE_MINUTES} min (${reason}); forms use the browser engine meanwhile.`);
    if (row?.alert) {
      await notifyAdmin(
        "PLINTH: Sarvam voice typing paused — forms switched to browser speech",
        [
          `Sarvam rejected a transcription request (${reason}). This usually means the credits have run out or the API key was replaced or revoked.`,
          "",
          "Nothing is broken for families: voice answers have switched automatically to the browser's own speech engine (Google on Android and Chrome, Apple on iPhone and Mac). Regional-language accuracy may be lower until Sarvam is back.",
          "",
          "To restore Sarvam: top up credits at dashboard.sarvam.ai, or put a valid key in Vercel as SARVAM_API_KEY and redeploy.",
          `PLINTH re-tries Sarvam every ${PAUSE_MINUTES} minutes; you will get at most one of these emails every ${ALERT_HOURS} hours.`,
        ].join("\n"),
      );
    }
  } catch (e) {
    console.error("Could not record the Sarvam pause", e instanceof Error ? e.message : "error");
  }
}

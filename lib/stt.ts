import "server-only";
import { optionalEnv } from "./env";

/** Speech-to-text through Sarvam AI (India). Audio is passed through and never stored by PLINTH. */
export function sttEnabled(): boolean {
  return !!optionalEnv("SARVAM_API_KEY");
}

/** Sarvam language codes; note Odia is od-IN there. */
const SARVAM_LANG: Record<string, string> = {
  en: "en-IN", hi: "hi-IN", bn: "bn-IN", mr: "mr-IN", te: "te-IN", ta: "ta-IN",
  gu: "gu-IN", ur: "ur-IN", kn: "kn-IN", or: "od-IN", ml: "ml-IN",
};

export class SttError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function transcribe(audio: Blob, lang: string): Promise<string> {
  const key = optionalEnv("SARVAM_API_KEY");
  if (!key) throw new SttError(503, "not configured");
  const base = (optionalEnv("SARVAM_API_URL") ?? "https://api.sarvam.ai").replace(/\/+$/, "");
  const form = new FormData();
  form.append("file", audio, "speech.wav");
  form.append("model", optionalEnv("SARVAM_STT_MODEL") ?? "saaras:v4");
  form.append("mode", "transcribe");
  form.append("language_code", SARVAM_LANG[lang] ?? "unknown");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 20_000);
  try {
    const res = await fetch(`${base}/speech-to-text`, {
      method: "POST",
      headers: { "api-subscription-key": key },
      body: form,
      signal: ctrl.signal,
      cache: "no-store",
    });
    if (!res.ok) throw new SttError(res.status === 429 ? 429 : 502, `sarvam ${res.status}`);
    const data = (await res.json()) as { transcript?: string };
    return (data.transcript ?? "").trim();
  } catch (e) {
    if (e instanceof SttError) throw e;
    throw new SttError(504, e instanceof Error ? e.name : "error");
  } finally {
    clearTimeout(timer);
  }
}

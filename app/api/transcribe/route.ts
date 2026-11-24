import { NextResponse, type NextRequest } from "next/server";
import { caseByToken } from "@/lib/cases";
import { lookupHash } from "@/lib/crypto";
import { db } from "@/lib/db";
import { parentCaseId } from "@/lib/session";
import { SttError, sttEnabled, transcribe } from "@/lib/stt";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 1_000_000; // ~30 s of 16 kHz mono 16-bit WAV
const HOURLY_SECONDS = 45 * 60; // per form link: plenty for honest use, caps abuse and cost
const LANGS = new Set(["en", "hi", "bn", "mr", "te", "ta", "gu", "ur", "kn", "or", "ml"]);

/** Seconds of audio in a 16 kHz mono PCM WAV, read from its header; null if it is not one. */
function wavSeconds(buf: ArrayBuffer): number | null {
  if (buf.byteLength < 44) return null;
  const v = new DataView(buf);
  const tag = (o: number) => String.fromCharCode(v.getUint8(o), v.getUint8(o + 1), v.getUint8(o + 2), v.getUint8(o + 3));
  if (tag(0) !== "RIFF" || tag(8) !== "WAVE" || tag(12) !== "fmt ") return null;
  const channels = v.getUint16(22, true);
  const rate = v.getUint32(24, true);
  const bits = v.getUint16(34, true);
  if (channels !== 1 || rate !== 16000 || bits !== 16) return null;
  return (buf.byteLength - 44) / (rate * 2);
}

const no = (status: number, error: string) => NextResponse.json({ error }, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(req: NextRequest) {
  if (!sttEnabled()) return no(503, "off");
  let fd: FormData;
  try {
    fd = await req.formData();
  } catch {
    return no(400, "bad");
  }
  const kind = String(fd.get("kind") ?? "");
  const token = String(fd.get("token") ?? "");
  const lang = String(fd.get("lang") ?? "");
  const audio = fd.get("audio");
  if (!LANGS.has(lang) || !(audio instanceof Blob) || audio.size > MAX_BYTES) return no(400, "bad");

  // Only someone holding a live form may use this: the child's or teacher's link, or the signed-in parent.
  let who: string | null = null;
  if (kind === "student" || kind === "teacher") {
    const c = await caseByToken(kind, token);
    if (c && c.status !== "in_studio" && c.status !== "delivered") who = `${kind}:${c.id}`;
  } else if (kind === "parent") {
    const id = await parentCaseId();
    if (id) who = `parent:${id}`;
  }
  if (!who) return no(401, "auth");

  const bytes = await audio.arrayBuffer();
  const secs = wavSeconds(bytes);
  if (secs === null || secs < 0.3 || secs > 30) return no(400, "bad");

  const sql = await db();
  const key = lookupHash(`stt:${who}`);
  const [row] = await sql<{ seconds: number }[]>`
    insert into stt_usage (key_hash, hour, seconds, requests)
    values (${key}, date_trunc('hour', now()), ${secs}, 1)
    on conflict (key_hash, hour) do update
      set seconds = stt_usage.seconds + excluded.seconds, requests = stt_usage.requests + 1
    returning seconds`;
  if (row.seconds > HOURLY_SECONDS) return no(429, "limit");

  try {
    const text = await transcribe(new Blob([bytes], { type: "audio/wav" }), lang);
    return NextResponse.json({ text }, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    const status = e instanceof SttError ? e.status : 502;
    console.error("transcribe failed", status); // never log audio or words
    return no(status === 429 ? 429 : 502, "upstream");
  }
}

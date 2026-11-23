import "server-only";
import { createCipheriv, createDecipheriv, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { requireEnv } from "./env";

function dataKey(): Buffer {
  const raw = requireEnv("DATA_ENCRYPTION_KEY");
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) {
    throw new Error("DATA_ENCRYPTION_KEY must be 32 bytes, base64-encoded. Run `npm run gen:secrets` to make one.");
  }
  return key;
}

/** Encrypt any JSON-serialisable value with AES-256-GCM. Output: "v1.<iv>.<tag>.<ciphertext>" (base64url). */
export function seal(value: unknown): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", dataKey(), iv);
  const ct = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return ["v1", iv.toString("base64url"), tag.toString("base64url"), ct.toString("base64url")].join(".");
}

export function open<T = unknown>(sealed: string): T {
  const [v, ivB, tagB, ctB] = sealed.split(".");
  if (v !== "v1" || !ivB || !tagB || ctB === undefined) throw new Error("Unreadable encrypted value");
  const decipher = createDecipheriv("aes-256-gcm", dataKey(), Buffer.from(ivB, "base64url"));
  decipher.setAuthTag(Buffer.from(tagB, "base64url"));
  const pt = Buffer.concat([decipher.update(Buffer.from(ctB, "base64url")), decipher.final()]);
  return JSON.parse(pt.toString("utf8")) as T;
}

/** Keyed hash for lookups (email, tokens, codes) so raw values are never stored. */
export function lookupHash(value: string): string {
  return createHmac("sha256", dataKey()).update("lookup:" + value).digest("base64url");
}

export function randomToken(bytes = 24): string {
  return randomBytes(bytes).toString("base64url");
}

export function sixDigitCode(): string {
  return (randomBytes(4).readUInt32BE(0) % 1_000_000).toString().padStart(6, "0");
}

export function caseRef(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const b = randomBytes(6);
  let s = "";
  for (const byte of b) s += alphabet[byte % alphabet.length];
  return "PL-" + s;
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

/**
 * A key derived from the master key, the case and a 4-digit code the child chose. Used only for the child's draft,
 * so a draft saved on a shared phone cannot be read back by anyone who does not know the child's code.
 */
export function pinKey(caseId: string, pin: string): Buffer {
  return createHmac("sha256", dataKey()).update(`draft-pin:v1:${caseId}:${pin}`).digest();
}

export function sealWith(key: Buffer, value: unknown): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const ct = Buffer.concat([cipher.update(JSON.stringify(value), "utf8"), cipher.final()]);
  return ["p1", iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), ct.toString("base64url")].join(".");
}

/** Returns null when the key is wrong (authentication fails) instead of throwing. */
export function openWith<T = unknown>(key: Buffer, sealed: string): T | null {
  try {
    const [v, ivB, tagB, ctB] = sealed.split(".");
    if (v !== "p1") return null;
    const d = createDecipheriv("aes-256-gcm", key, Buffer.from(ivB, "base64url"));
    d.setAuthTag(Buffer.from(tagB, "base64url"));
    return JSON.parse(Buffer.concat([d.update(Buffer.from(ctB, "base64url")), d.final()]).toString("utf8")) as T;
  } catch {
    return null;
  }
}

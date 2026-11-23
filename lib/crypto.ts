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

import "server-only";
import { cookies } from "next/headers";
import { db } from "../db";
import { lookupHash, open, randomToken } from "../crypto";
import type { Answers, Source } from "./types";

const DEVICE = "pp_dev";

/** A random per-device id (cookie). Drafts are only ever returned to the device that saved them. */
export async function deviceHash(create: boolean): Promise<string | null> {
  const jar = await cookies();
  let id = jar.get(DEVICE)?.value;
  if (!id && create) {
    id = randomToken(18);
    jar.set(DEVICE, id, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
  }
  return id ? lookupHash("dev:" + id) : null;
}

export type DraftData = { answers: Answers; timings: Record<string, number>; step: number };
export type Draft = DraftData | { locked: true; step: number };

/**
 * Draft for a server component. Parent and teacher drafts come back only to the device that saved them.
 * A child's draft is sealed with the child's own 4-digit code, so only a "locked" marker comes back — the answers
 * are released by unlockDraft() after the code is entered, on any device.
 */
export async function loadDraft(caseId: string, source: Source): Promise<Draft | null> {
  const sql = await db();
  const rows = await sql<{ data_enc: string; device_hash: string; pin_locked: boolean; step: number }[]>`
    select data_enc, device_hash, pin_locked, step from drafts where case_id = ${caseId} and source = ${source}`;
  const r = rows[0];
  if (!r) return null;
  if (r.pin_locked) return { locked: true, step: r.step };
  const h = await deviceHash(false);
  if (!h || r.device_hash !== h) return null;
  return open<DraftData>(r.data_enc);
}

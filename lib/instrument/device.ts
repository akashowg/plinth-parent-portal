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

/** Draft answers, returned only to the same device that saved them. Server components only. */
export async function loadDraft(caseId: string, source: Source): Promise<{ answers: Answers; timings: Record<string, number>; step: number } | null> {
  const h = await deviceHash(false);
  if (!h) return null;
  const sql = await db();
  const rows = await sql<{ data_enc: string; device_hash: string }[]>`
    select data_enc, device_hash from drafts where case_id = ${caseId} and source = ${source}`;
  if (!rows[0] || rows[0].device_hash !== h) return null;
  return open(rows[0].data_enc);
}


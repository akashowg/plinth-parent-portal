import "server-only";
import { headers } from "next/headers";
import { baseUrl } from "./env";

/**
 * The address people actually reached the portal on, for links we hand out (child, teacher, admin).
 * Built from the request so a missing or stale PUBLIC_BASE_URL (localhost, a domain not yet connected)
 * can never produce a child's link that does not open. PUBLIC_BASE_URL is the fallback when there is
 * no request to read.
 */
export async function siteUrl(): Promise<string> {
  try {
    const h = await headers();
    const host = (h.get("x-forwarded-host") ?? h.get("host") ?? "").split(",")[0].trim();
    if (host && /^[a-z0-9.-]+(:\d{1,5})?$/i.test(host)) {
      const local = /^(localhost|127\.0\.0\.1)(:|$)/.test(host);
      const fwd = (h.get("x-forwarded-proto") ?? "").split(",")[0].trim();
      const proto = fwd === "http" || fwd === "https" ? fwd : local ? "http" : "https";
      return `${proto}://${host}`;
    }
  } catch {}
  return baseUrl();
}

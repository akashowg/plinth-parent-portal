import { NextResponse, type NextRequest } from "next/server";
import { isLang } from "@/lib/i18n/langs";

export function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("to");
  const to = isLang(q) ? q : "en";
  let back = req.nextUrl.searchParams.get("back") ?? "/";
  if (!back.startsWith("/") || back.startsWith("//") || back.includes("\\")) back = "/";
  const res = NextResponse.redirect(new URL(back, req.nextUrl.origin), 303);
  res.cookies.set("lang", to, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  return res;
}

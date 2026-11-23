import { NextResponse, type NextRequest } from "next/server";

export function GET(req: NextRequest) {
  const to = req.nextUrl.searchParams.get("to") === "hi" ? "hi" : "en";
  let back = req.nextUrl.searchParams.get("back") ?? "/";
  if (!back.startsWith("/") || back.startsWith("//") || back.includes("\\")) back = "/";
  const res = NextResponse.redirect(new URL(back, req.nextUrl.origin), 303);
  res.cookies.set("lang", to, { path: "/", sameSite: "lax", maxAge: 60 * 60 * 24 * 365 });
  return res;
}

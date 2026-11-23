import { NextResponse } from "next/server";
import { audit } from "@/lib/db";
import { decodeCase, getCase, getSubmissions } from "@/lib/cases";
import { studioText } from "@/lib/export";
import { isAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return new NextResponse("Not found", { status: 404 });
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new NextResponse("Not found", { status: 404 });
  const c = await getCase(id);
  if (!c || c.withdrawn_at) return new NextResponse("Not found", { status: 404 });
  const { parent, child } = decodeCase(c);
  const text = studioText(c, parent, child, await getSubmissions(id));
  await audit(id, "admin", "exported_intake");
  return new NextResponse(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${c.ref}_intake.txt"`,
      "Cache-Control": "no-store",
    },
  });
}

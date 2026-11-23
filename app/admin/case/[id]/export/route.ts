import { NextResponse } from "next/server";
import { audit, db } from "@/lib/db";
import { decodeCase, getCase } from "@/lib/cases";
import { studioText } from "@/lib/export";
import { analyse } from "@/lib/instrument/store";
import { isAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET(_: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!(await isAdmin())) return new NextResponse("Not found", { status: 404 });
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/.test(id)) return new NextResponse("Not found", { status: 404 });
  const c = await getCase(id);
  if (!c || c.withdrawn_at) return new NextResponse("Not found", { status: 404 });
  const sql = await db();
  const [{ n }] = await sql<{ n: number }[]>`select count(*)::int as n from safeguards where case_id = ${id} and status = 'open'`;
  if (n > 0) return new NextResponse("Export locked: action every safeguarding trigger first.", { status: 409 });
  const a = await analyse(c);
  if (!a) return new NextResponse("Case is outside the supported age range.", { status: 422 });
  const { parent } = decodeCase(c);
  const text = studioText(c, parent, a);
  await audit(id, "admin", "exported_intake_v2");
  return new NextResponse(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${c.ref}_intake_v2.txt"`,
      "Cache-Control": "no-store",
    },
  });
}

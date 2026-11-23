import ActionForm from "@/components/ActionForm";
import { adminLogin, adminLogout } from "@/app/actions";
import { db } from "@/lib/db";
import { open } from "@/lib/crypto";
import type { Child } from "@/lib/cases";
import { missingSettings } from "@/lib/env";
import { isAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  awaiting_verification: "Awaiting email check",
  collecting: "Collecting",
  ready: "Ready for Studio",
  in_studio: "In Studio",
  delivered: "Delivered",
  withdrawn: "Withdrawn",
};

export default async function Admin({ searchParams }: { searchParams: Promise<{ erased?: string; show?: string }> }) {
  const missing = missingSettings();
  if (!(await isAdmin())) {
    return (
      <div className="wrap admin" style={{ maxWidth: 480 }}>
        <span className="kicker">PLINTH · Admin</span>
        <h1>Sign in</h1>
        <ActionForm action={adminLogin} submitLabel="Sign in">
          <label className="field">
            <span className="q-label">Admin password</span>
            <input type="password" name="password" required autoComplete="current-password" />
          </label>
        </ActionForm>
      </div>
    );
  }

  const { erased, show } = await searchParams;
  const sql = await db();
  const rows = await sql<
    { id: string; ref: string; created_at: Date; status: string; child_enc: string; withdrawn_at: Date | null; band: string | null; srcs: string[] | null; sg_open: number }[]
  >`
    select c.id, c.ref, c.created_at, c.status, c.child_enc, c.withdrawn_at, c.band,
           array_remove(array_agg(distinct s.source), null) as srcs,
           (select count(*)::int from safeguards g where g.case_id = c.id and g.status = 'open') as sg_open
    from cases c left join submissions s on s.case_id = c.id
    where ${show === "all" ? sql`true` : sql`c.status <> 'awaiting_verification'`}
    group by c.id order by c.created_at desc limit 500`;

  return (
    <div className="wrap-wide admin">
      <div className="card-head" style={{ marginBottom: 24 }}>
        <div>
          <span className="kicker">PLINTH · Admin</span>
          <h1 style={{ marginBottom: 0 }}>Intake queue</h1>
        </div>
        <form action={adminLogout}>
          <button className="btn btn-quiet" type="submit">Sign out</button>
        </form>
      </div>
      {missing.length > 0 && (
        <p className="warnbox">Settings not configured: {missing.join(", ")}. See README → Vercel setup.</p>
      )}
      {erased && <p className="notice">Case erased.</p>}
      <p className="muted">
        {rows.length} profile(s).{" "}
        {show === "all" ? <a href="/admin">Hide unverified</a> : <a href="/admin?show=all">Include unverified sign-ups</a>}
      </p>
      <table>
        <thead>
          <tr>
            <th>Ref</th>
            <th>Child</th>
            <th>Class</th>
            <th>Band</th>
            <th>Started</th>
            <th>Sources</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const child = r.withdrawn_at ? null : open<Child>(r.child_enc);
            const srcs = new Set(r.srcs ?? []);
            return (
              <tr key={r.id}>
                <td><a href={`/admin/case/${r.id}`}>{r.ref}</a></td>
                <td>{child?.name ?? "—"}</td>
                <td>{child?.klass ?? "—"}</td>
                <td>{r.band ?? "—"}</td>
                <td>{new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                <td>
                  {(["student", "parent", "educator"] as const).map((s) => (
                    <span key={s} className={`badge ${srcs.has(s) ? "badge-ok" : "badge-wait"}`} style={{ marginRight: 4 }}>
                      {s === "educator" ? "teacher" : s}
                    </span>
                  ))}
                </td>
                <td>
                  {STATUS_LABEL[r.status] ?? r.status}
                  {r.sg_open > 0 && <span className="badge badge-risk" style={{ marginLeft: 6 }}>safeguarding {r.sg_open}</span>}
                </td>
              </tr>
            );
          })}
          {rows.length === 0 && (
            <tr>
              <td colSpan={7} className="muted">No profiles yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

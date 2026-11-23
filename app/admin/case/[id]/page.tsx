import { redirect } from "next/navigation";
import CopyButton from "@/components/CopyButton";
import { adminEraseCase, adminSetStatus } from "@/app/actions";
import { ADMIN_STATUSES, decodeCase, getCase, getSubmissions } from "@/lib/cases";
import { db } from "@/lib/db";
import { educatorFreeText, parentFreeText, studioText } from "@/lib/export";
import { educatorIntegrity } from "@/lib/integrity";
import { isAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

const LABEL: Record<string, string> = {
  collecting: "Collecting",
  ready: "Ready for Studio",
  in_studio: "In Studio (locks the forms)",
  delivered: "Delivered",
};

export default async function AdminCase({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ updated?: string; erase?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) redirect("/admin");
  const c = await getCase(id);
  if (!c) redirect("/admin");
  const { updated, erase } = await searchParams;
  const sql = await db();
  const consents = await sql<{ kind: string; notice_version: string; at: Date }[]>`
    select kind, notice_version, at from consents where case_id = ${id} order by at`;

  if (c.withdrawn_at) {
    return (
      <div className="wrap admin">
        <a href="/admin">← Queue</a>
        <h1>{c.ref} · withdrawn</h1>
        <p className="muted">Consent withdrawn {new Date(c.withdrawn_at).toISOString()}. Answers and personal details were deleted.</p>
        <ConsentTable rows={consents} />
        <EraseForm id={id} confirm={!!erase} />
      </div>
    );
  }

  const { parent, child } = decodeCase(c);
  const subs = await getSubmissions(id);
  const by = Object.fromEntries(subs.map((s) => [s.source, s]));
  const text = studioText(c, parent, child, subs);
  const integrity = by.educator ? educatorIntegrity(educatorFreeText(by.educator), parentFreeText(by.parent)) : null;

  return (
    <div className="wrap-wide admin">
      <a href="/admin">← Queue</a>
      <h1 style={{ marginTop: 12 }}>
        {c.ref} · {child.name}
      </h1>
      <div className="meta">
        <div><span className="k">Class</span><span className="v">{child.klass}</span></div>
        <div><span className="k">DOB</span><span className="v">{child.dob}</span></div>
        <div><span className="k">Place</span><span className="v">{child.city}, {child.state}</span></div>
        <div><span className="k">Parent</span><span className="v">{parent.name} ({parent.relation})</span></div>
        <div><span className="k">Email</span><span className="v">{parent.email}</span></div>
        {parent.whatsapp && <div><span className="k">WhatsApp</span><span className="v">{parent.whatsapp}</span></div>}
      </div>

      {updated && <p className="notice">Saved.</p>}
      {integrity && integrity.level !== "ok" && (
        <p className="warnbox">
          Source integrity: the teacher’s text {integrity.level === "duplicate" ? "closely repeats" : "partly repeats"} the parent’s
          text ({Math.round(integrity.overlap * 100)}% phrase overlap). Check independence before treating this as a third source.
        </p>
      )}

      <div className="pair" style={{ marginBottom: 32 }}>
        <div className="card">
          <h3>Sources</h3>
          {(["student", "parent", "educator"] as const).map((s) => (
            <p key={s}>
              <span className={`badge ${by[s] ? "badge-ok" : "badge-wait"}`}>{s === "educator" ? "teacher" : s}</span>{" "}
              {by[s] ? `received ${new Date(by[s].submitted_at).toLocaleString("en-IN")}` : "not yet"}
            </p>
          ))}
        </div>
        <form action={adminSetStatus} className="card">
          <h3>Status</h3>
          <input type="hidden" name="id" value={id} />
          <select name="status" defaultValue={c.status}>
            {ADMIN_STATUSES.map((s) => (
              <option key={s} value={s}>{LABEL[s]}</option>
            ))}
          </select>
          <textarea name="note" rows={2} placeholder="Private note (optional)" defaultValue={c.admin_note ?? ""} />
          <div><button className="btn" type="submit">Save status</button></div>
        </form>
      </div>

      <div className="card-head">
        <h2>Paste into PLINTH Studio</h2>
        <div className="row">
          <CopyButton text={text} label="Copy intake" copiedLabel="Copied" />
          <a className="btn btn-quiet" href={`/admin/case/${id}/export`}>Download .txt</a>
        </div>
      </div>
      <p className="muted">Open Studio → Analyse, paste this whole block, choose the report type, then set the status here to “In Studio”.</p>
      <pre>{text}</pre>

      <h2 style={{ marginTop: 32 }}>Consent record</h2>
      <ConsentTable rows={consents} />
      <EraseForm id={id} confirm={!!erase} />
    </div>
  );
}

function ConsentTable({ rows }: { rows: { kind: string; notice_version: string; at: Date }[] }) {
  return (
    <table>
      <thead>
        <tr><th>Event</th><th>Notice version</th><th>When (UTC)</th></tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i}><td>{r.kind.replaceAll("_", " ")}</td><td>{r.notice_version}</td><td>{new Date(r.at).toISOString()}</td></tr>
        ))}
      </tbody>
    </table>
  );
}

function EraseForm({ id, confirm }: { id: string; confirm: boolean }) {
  return (
    <details className="danger" open={confirm}>
      <summary>Erase this case completely</summary>
      <p className="muted">
        Use for an erasure request. Deletes the case, answers and consent record permanently. Delete the Studio copy too.
      </p>
      <form action={adminEraseCase} className="form">
        <input type="hidden" name="id" value={id} />
        <label className="field">
          <span className="q-label">Type ERASE to confirm</span>
          <input type="text" name="confirm" required autoComplete="off" />
        </label>
        {confirm && <p className="alert">Type ERASE exactly to confirm.</p>}
        <div><button className="btn btn-danger" type="submit">Erase permanently</button></div>
      </form>
    </details>
  );
}

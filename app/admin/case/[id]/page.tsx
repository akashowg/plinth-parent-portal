import { redirect } from "next/navigation";
import CopyButton from "@/components/CopyButton";
import { adminActionSafeguard, adminEraseCase, adminReopenSource, adminSetStatus, adminSignOff } from "@/app/actions";
import { ADMIN_STATUSES, decodeCase, getCase } from "@/lib/cases";
import { open } from "@/lib/crypto";
import { db } from "@/lib/db";
import { baseUrl } from "@/lib/env";
import { answerText, integrityCheck, studioText, displayId } from "@/lib/export";
import { allItems } from "@/lib/instrument/forms";
import { SG_MEANING, type SgCode } from "@/lib/instrument/safeguarding";
import { CATEGORY_LABEL, type LexiconHit } from "@/lib/instrument/lexicon";
import { analyse, latestReview, safeguardRows } from "@/lib/instrument/store";
import type { Source } from "@/lib/instrument/types";
import { isAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

const LABEL: Record<string, string> = {
  collecting: "Collecting",
  ready: "Ready for Studio",
  in_studio: "In Studio (locks the forms)",
  delivered: "Delivered",
};
const SRC_DB: Record<Source, string> = { student: "student", parent: "parent", teacher: "educator" };
const TIER_BADGE: Record<string, string> = { high: "badge-ok", moderate: "badge-ok", low: "badge-warn", insufficient: "badge-wait" };

export default async function AdminCase({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ updated?: string; erase?: string; sg?: string; review?: string; reopen?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) redirect("/admin");
  const c = await getCase(id);
  if (!c) redirect("/admin");
  const q = await searchParams;
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
        <EraseForm id={id} confirm={!!q.erase} />
      </div>
    );
  }

  const { parent, child, tokens } = decodeCase(c);
  const a = await analyse(c);
  const sgRows = await safeguardRows(id);
  const review = await latestReview(id);
  const openSg = sgRows.filter((r) => r.status === "open");
  const text = a ? studioText(c, parent, a) : "";
  const integrity = a ? integrityCheck(a) : null;
  const studentUrl = `${baseUrl()}/s/${tokens.student}`;
  const teacherUrl = `${baseUrl()}/t/${tokens.teacher}`;

  const heldText = (source: string, item: string) => {
    const src = (source === "educator" ? "teacher" : source) as Source;
    const sub = a?.submitted[src];
    const v = sub?.answers[item];
    const it = sub ? allItems(sub.def).find((i) => i.k === item) : undefined;
    return { stem: it?.t.en ?? item, value: it ? answerText(it, v, sub?.def.subjects ?? []) : "—" };
  };

  return (
    <div className="wrap-wide admin">
      <a href="/admin">← Queue</a>
      <h1 style={{ marginTop: 12 }}>
        {c.ref} · {child.name}
      </h1>
      <div className="meta">
        <div><span className="k">Band</span><span className="v">{a?.ctx.band ?? "—"} · age {a?.ctx.age.toFixed(1)}</span></div>
        <div><span className="k">Class</span><span className="v">{child.klass}</span></div>
        <div><span className="k">DOB</span><span className="v">{child.dob}</span></div>
        <div><span className="k">Place</span><span className="v">{child.city}, {child.state}</span></div>
        <div><span className="k">Parent</span><span className="v">{parent.name} ({parent.relation})</span></div>
        <div><span className="k">Email</span><span className="v">{parent.email}</span></div>
        {parent.whatsapp && <div><span className="k">WhatsApp</span><span className="v">{parent.whatsapp}</span></div>}
      </div>

      {q.updated && <p className="notice">Saved.</p>}
      {q.sg && <p className="alert">Write a note of at least 10 characters saying what you did.</p>}
      {q.review === "incomplete" && <p className="alert">Fill your name and role, and tick all three attestations.</p>}
      {q.review === "open" && <p className="alert">Action or clear every safeguarding trigger before signing off.</p>}

      {/* ---------------------------------------------------------------- safeguarding */}
      {sgRows.length > 0 && (
        <section id="safeguarding" style={{ marginBottom: 32 }}>
          <h2>Safeguarding {openSg.length ? <span className="badge badge-risk">{openSg.length} open</span> : <span className="badge badge-ok">all actioned</span>}</h2>
          <p className="muted">
            Flag, do not screen. Nothing here goes into the report or the Studio export. Act on each trigger and record what you did.
            For immediate danger call 112; Child Helpline 1098; Tele-MANAS 14416. <a href="/admin/safeguarding">Lexicon and outcomes</a>
          </p>
          {sgRows.map((r) => {
            const h = heldText(r.source, r.item);
            const note = r.note_enc ? open<{ note: string }>(r.note_enc)?.note : null;
            const detail = r.detail_enc ? open<LexiconHit[]>(r.detail_enc) : null;
            return (
              <div key={r.id} className="card sg-row">
                <div className="card-head">
                  <h3>
                    {r.code} · {r.source === "educator" ? "teacher" : r.source} · {displayId(a?.ctx.band ?? "C", (r.source === "educator" ? "teacher" : r.source) as Source, r.item)}
                  </h3>
                  <span className={`badge ${r.status === "open" ? "badge-risk" : "badge-ok"}`}>
                    {r.status === "open" ? (r.code === "SG-4U" ? "open · act today" : "open") : (r.outcome ?? r.status).replace("_", " ")}
                  </span>
                </div>
                <p>{SG_MEANING[r.code as SgCode] ?? r.code}</p>
                {detail && detail.length > 0 && (
                  <ul className="small" style={{ margin: 0 }}>
                    {detail.map((d, i) => (
                      <li key={i}>
                        <strong>{d.severity}</strong> · {CATEGORY_LABEL[d.category]} · matched “{d.phrase}”
                        {d.tags.length ? ` · ${d.tags.join(", ")}` : ""}
                      </li>
                    ))}
                  </ul>
                )}
                <p>
                  <strong>{h.stem}</strong>
                  <br />
                  <span style={{ whiteSpace: "pre-wrap" }}>{h.value}</span>
                </p>
                {r.status === "open" ? (
                  <form action={adminActionSafeguard} className="form">
                    <input type="hidden" name="id" value={id} />
                    <input type="hidden" name="sg" value={r.id} />
                    <select name="outcome" defaultValue="actioned">
                      <option value="actioned">Actioned — I followed up</option>
                      <option value="cleared_context">Cleared — read in context, no concern</option>
                      <option value="false_alarm">False alarm — the words were matched wrongly</option>
                    </select>
                    <textarea name="note" rows={2} required minLength={10} placeholder="What you did, who you contacted, when" />
                    <div><button className="btn" type="submit">Record</button></div>
                  </form>
                ) : (
                  <p className="small">
                    {r.actioned_at ? new Date(r.actioned_at).toLocaleString("en-IN") : ""} — {note}
                  </p>
                )}
              </div>
            );
          })}
        </section>
      )}

      {/* ---------------------------------------------------------------- sources and validity */}
      <div className="pair" style={{ marginBottom: 32 }}>
        <div className="card">
          <h3>Sources and validity</h3>
          {(["student", "parent", "teacher"] as Source[]).map((s) => {
            const sub = a?.submitted[s];
            const v = a?.validity[s];
            return (
              <div key={s}>
                <p>
                  <span className={`badge ${sub ? "badge-ok" : a?.legacy.includes(s) ? "badge-warn" : "badge-wait"}`}>{s}</span>{" "}
                  {sub ? `received ${sub.at.toLocaleString("en-IN")}` : a?.legacy.includes(s) ? "legacy v1 answers only — reopen to collect v2" : "not yet"}
                </p>
                {v && (
                  <p className="small">
                    {v.flags.length ? v.flags.join(" · ") : "no validity flags"}
                    {v.humanReview && <strong> · human review required (rushed and straightlined)</strong>}
                  </p>
                )}
              </div>
            );
          })}
          {integrity && integrity.level !== "ok" && (
            <p className="warnbox">
              Teacher’s written text {integrity.level === "duplicate" ? "closely repeats" : "partly repeats"} the parent’s ({Math.round(integrity.overlap * 100)}% phrase
              overlap). Check independence before treating it as a third source.
            </p>
          )}
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

      <div className="card" style={{ marginBottom: 32 }}>
        <h3>Links</h3>
        <p className="small">
          {a?.ctx.band === "A"
            ? "Band A: open the child link yourself (or send it to the school counsellor) and read the questions aloud one-to-one, with no parent present."
            : "For re-sending if a family loses a link."}
        </p>
        <div className="linkbox">Child: {studentUrl}</div>
        <div className="linkbox">Teacher: {teacherUrl}</div>
        <div className="row">
          <CopyButton text={studentUrl} label="Copy child link" copiedLabel="Copied" />
          <CopyButton text={teacherUrl} label="Copy teacher link" copiedLabel="Copied" />
          {a?.ctx.band === "A" && <a className="btn btn-quiet" href={studentUrl} target="_blank" rel="noopener">Open child form (administer)</a>}
        </div>
      </div>

      {/* ---------------------------------------------------------------- ledger */}
      {a && (
        <section style={{ marginBottom: 32 }}>
          <h2>Signal ledger</h2>
          <p className="muted">Values 1–5 per source. Divergent sources are never averaged; the engine must keep the contradiction.</p>
          <table className="ledger">
            <thead>
              <tr><th>Construct</th><th>Student</th><th>Parent</th><th>Teacher</th><th>Verdict</th><th>Confidence</th><th>Engine</th></tr>
            </thead>
            <tbody>
              {a.ledger.map((e) => (
                <tr key={e.construct}>
                  <td>
                    {e.label}
                    <br />
                    <span className="small muted">HDI {e.maps_to.hdi.join("/")} · PIC {e.maps_to.pic.join("/")}{e.band_gate ? ` · ${e.band_gate}` : ""}</span>
                  </td>
                  {(["student", "parent", "teacher"] as Source[]).map((s) => (
                    <td key={s} className="num">{e.sources[s] ? `${e.sources[s]!.value} (${e.sources[s]!.n_items})` : "—"}</td>
                  ))}
                  <td>{e.convergence.replace("_", " ")}{e.contradiction_token ? <><br /><span className="small">{e.contradiction_token}</span></> : null}</td>
                  <td><span className={`badge ${TIER_BADGE[e.confidence]}`}>{e.confidence}</span>{e.flags.length ? <><br /><span className="small muted">{e.flags.join(", ")}</span></> : null}</td>
                  <td className="small">{e.engine_permission.may_state ? "may state" : e.engine_permission.may_suggest ? "suggest only" : "silent"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h3 style={{ marginTop: 24 }}>Derived signals</h3>
          <dl className="qa">
            {a.derived.map((d) => (
              <div key={d.id}>
                <dt>{d.id.replaceAll("_", " ")}</dt>
                <dd>{d.reading}{d.engine_rule ? ` — ${d.engine_rule}` : ""}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {/* ---------------------------------------------------------------- review gate */}
      <section id="review" className="card" style={{ marginBottom: 32 }}>
        <h3>Reviewer sign-off</h3>
        {review ? (
          <p>
            Signed off by <strong>{review.reviewer}</strong> ({review.role}) on {new Date(review.at).toLocaleString("en-IN")}: validity flags reviewed,
            safeguarding actioned or cleared, contradictions preserved.
          </p>
        ) : (
          <p className="small">Required before a dossier is released. Sign off after you have read the flags, the safeguarding panel and the ledger.</p>
        )}
        <form action={adminSignOff} className="form">
          <input type="hidden" name="id" value={id} />
          <div className="grid-2">
            <input type="text" name="reviewer" placeholder="Reviewer name" required />
            <input type="text" name="role" placeholder="Role" required />
          </div>
          <label className="check"><input type="checkbox" name="a_validity" value="yes" required /><span>I reviewed every validity flag.</span></label>
          <label className="check"><input type="checkbox" name="a_safeguarding" value="yes" required /><span>Every safeguarding trigger was actioned or cleared.</span></label>
          <label className="check"><input type="checkbox" name="a_contradictions" value="yes" required /><span>Contradictions between sources are preserved, not averaged.</span></label>
          <div><button className="btn btn-quiet" type="submit">Sign off</button></div>
        </form>
      </section>

      {/* ---------------------------------------------------------------- export */}
      <div className="card-head">
        <h2>Paste into PLINTH Studio</h2>
        {openSg.length === 0 && a && (
          <div className="row">
            <CopyButton text={text} label="Copy intake" copiedLabel="Copied" />
            <a className="btn btn-quiet" href={`/admin/case/${id}/export`}>Download .txt</a>
          </div>
        )}
      </div>
      {openSg.length > 0 ? (
        <p className="alert">The export is locked until every safeguarding trigger above is actioned or cleared.</p>
      ) : (
        <>
          <p className="muted">Open Studio → Analyse, paste this whole block, choose the report type, then set the status here to “In Studio”.</p>
          <pre>{text}</pre>
        </>
      )}

      <details className="danger">
        <summary>Reopen one form</summary>
        <p className="muted">Deletes that respondent’s submitted answers so they can fill the form again with the same link. Safeguarding records stay.</p>
        <form action={adminReopenSource} className="form">
          <input type="hidden" name="id" value={id} />
          <select name="source" defaultValue="parent">
            {(["parent", "student", "teacher"] as Source[]).map((s) => (
              <option key={s} value={SRC_DB[s]}>{s}</option>
            ))}
          </select>
          <label className="field">
            <span className="q-label">Type REOPEN to confirm</span>
            <input type="text" name="confirm" required autoComplete="off" />
          </label>
          {q.reopen && <p className="alert">Type REOPEN exactly to confirm.</p>}
          <div><button className="btn btn-danger" type="submit">Reopen</button></div>
        </form>
      </details>

      <h2 style={{ marginTop: 32 }}>Consent record</h2>
      <ConsentTable rows={consents} />
      <EraseForm id={id} confirm={!!q.erase} />
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

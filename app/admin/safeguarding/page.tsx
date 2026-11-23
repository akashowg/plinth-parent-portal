import { redirect } from "next/navigation";
import ActionForm from "@/components/ActionForm";
import { adminAddTerm, adminTestLexicon, adminToggleTerm } from "@/app/actions";
import { open } from "@/lib/crypto";
import { db } from "@/lib/db";
import { CATEGORY_LABEL, CATEGORY_SEVERITY, LEXICON_SIZE, LEXICON_VERSION, type Category, type LexiconHit } from "@/lib/instrument/lexicon";
import type { TermRow } from "@/lib/instrument/store";
import { isAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

const CATS = Object.keys(CATEGORY_LABEL) as Category[];

export default async function SafeguardingAdmin({ searchParams }: { searchParams: Promise<{ term?: string }> }) {
  if (!(await isAdmin())) redirect("/admin");
  const { term } = await searchParams;
  const sql = await db();
  const terms = await sql<TermRow[]>`select * from sg_terms order by active desc, created_at desc`;
  const rows = await sql<{ code: string; status: string; outcome: string | null; detail_enc: string | null }[]>`
    select code, status, outcome, detail_enc from safeguards where code in ('SG-4', 'SG-4U')`;

  // Outcome counts per category: how often each kind of match was real, cleared in context, or a false alarm.
  const stats = new Map<string, { total: number; open: number; actioned: number; context: number; falseAlarm: number }>();
  for (const r of rows) {
    const cats = new Set((r.detail_enc ? open<LexiconHit[]>(r.detail_enc) ?? [] : []).map((d) => d.category));
    for (const c of cats.size ? cats : new Set(["unknown"])) {
      const s = stats.get(c) ?? { total: 0, open: 0, actioned: 0, context: 0, falseAlarm: 0 };
      s.total++;
      if (r.status === "open") s.open++;
      else if (r.outcome === "false_alarm") s.falseAlarm++;
      else if (r.outcome === "cleared_context") s.context++;
      else s.actioned++;
      stats.set(c, s);
    }
  }

  return (
    <div className="wrap-wide admin">
      <a href="/admin">← Queue</a>
      <h1 style={{ marginTop: 12 }}>Safeguarding lexicon</h1>
      <p className="muted">
        {LEXICON_VERSION} · {LEXICON_SIZE} built-in patterns in English, Hindi and Hinglish, plus {terms.filter((t) => t.active).length} active
        reviewer phrase(s). Written answers that match go to a person and never to the engine. Urgent categories alert you to act the same
        day; context such as a negation or a story is shown to you but never silences a match.
      </p>
      {term === "added" && <p className="notice">Phrase added. It applies to every new submission.</p>}
      {term === "updated" && <p className="notice">Updated.</p>}
      {term === "invalid" && <p className="alert">Write a phrase of at least 3 characters and choose a category.</p>}

      <h2>Categories and outcomes so far</h2>
      <table>
        <thead>
          <tr><th>Category</th><th>Default urgency</th><th>Matches</th><th>Open</th><th>Actioned</th><th>Cleared in context</th><th>False alarms</th></tr>
        </thead>
        <tbody>
          {CATS.filter((c) => c !== "custom").map((c) => {
            const s = stats.get(c);
            return (
              <tr key={c}>
                <td>{CATEGORY_LABEL[c]}</td>
                <td>{CATEGORY_SEVERITY[c as Exclude<Category, "custom">]}{c === "physical_abuse" || c === "emotional_abuse" ? " (urgent if an adult or repetition is named)" : ""}</td>
                <td className="num">{s?.total ?? 0}</td>
                <td className="num">{s?.open ?? 0}</td>
                <td className="num">{s?.actioned ?? 0}</td>
                <td className="num">{s?.context ?? 0}</td>
                <td className="num">{s?.falseAlarm ?? 0}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="small muted">A category with many false alarms is a signal to review it with a safeguarding professional — not to switch it off.</p>

      <div className="pair" style={{ marginTop: 32 }}>
        <div className="card">
          <h3>Test a sentence</h3>
          <p className="small">Use example sentences, not a real child’s answer.</p>
          <ActionForm action={adminTestLexicon} submitLabel="Check">
            <textarea name="text" rows={3} required placeholder="e.g. mujhe kabhi kabhi ghar jaane se dar lagta hai" />
          </ActionForm>
        </div>
        <form action={adminAddTerm} className="card">
          <h3>Add a phrase</h3>
          <p className="small">
            Add a word or phrase a child or parent actually used that the lexicon missed — in any language or spelling. An exception can only
            quiet a concern-level match, never an urgent one.
          </p>
          <input type="text" name="phrase" required minLength={3} maxLength={120} placeholder="Phrase, e.g. मुझे घर में डर लगता है" />
          <div className="grid-2">
            <select name="category" defaultValue="distress">
              {CATS.map((c) => (
                <option key={c} value={c}>{CATEGORY_LABEL[c]}</option>
              ))}
            </select>
            <select name="severity" defaultValue="concern">
              <option value="concern">Concern — within 48 hours</option>
              <option value="urgent">Urgent — the same day</option>
            </select>
          </div>
          <select name="kind" defaultValue="match">
            <option value="match">Flag when this appears</option>
            <option value="except">Exception: this phrase is harmless (concern-level only)</option>
          </select>
          <input type="text" name="note" maxLength={300} placeholder="Why (optional), e.g. Chhattisgarhi for ‘beats me’" />
          <div><button className="btn" type="submit">Add</button></div>
        </form>
      </div>

      <h2 style={{ marginTop: 32 }}>Reviewer phrases</h2>
      <table>
        <thead>
          <tr><th>Phrase</th><th>Type</th><th>Category</th><th>Urgency</th><th>Note</th><th>Added</th><th></th></tr>
        </thead>
        <tbody>
          {terms.map((t) => (
            <tr key={t.id} style={{ opacity: t.active ? 1 : 0.5 }}>
              <td>{t.phrase}</td>
              <td>{t.kind === "except" ? "exception" : "flag"}</td>
              <td>{CATEGORY_LABEL[t.category as Category] ?? t.category}</td>
              <td>{t.severity}</td>
              <td className="small">{t.note ?? ""}</td>
              <td className="small">{new Date(t.created_at).toLocaleDateString("en-IN")}</td>
              <td>
                <form action={adminToggleTerm}>
                  <input type="hidden" name="id" value={t.id} />
                  <button className="btn btn-quiet" type="submit">{t.active ? "Disable" : "Enable"}</button>
                </form>
              </td>
            </tr>
          ))}
          {terms.length === 0 && (
            <tr><td colSpan={7} className="muted">None yet.</td></tr>
          )}
        </tbody>
      </table>

      <h2 style={{ marginTop: 32 }}>Who to call</h2>
      <ul className="muted">
        <li>Immediate danger: <strong>112</strong> (Emergency Response Support System).</li>
        <li>Abuse, neglect, child labour, child marriage: <strong>Child Helpline 1098</strong> — 24×7, integrated with ERSS-112.</li>
        <li>Mental-health support for the child or family: <strong>Tele-MANAS 14416</strong> or 1-800-891-4416 — free, 24×7, multilingual.</li>
        <li>Never confront an adult a child has named as harming them; involve the helpline or the school’s child-protection lead.</li>
      </ul>
    </div>
  );
}

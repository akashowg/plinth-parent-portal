import "server-only";
import { allQuestions, SCALE, type Question } from "./questions";
import type { CaseRow, Child, Parent, Submission } from "./cases";
import { educatorIntegrity } from "./integrity";

const SECTION_TITLE = { parent: "PARENT SECTION", student: "STUDENT SECTION", educator: "EDUCATOR SECTION" } as const;

function answerText(q: Question, raw: string): string {
  if (q.type === "choice") return q.options.find((o) => o.value === raw)?.label.en ?? raw;
  if (q.type === "scale") return SCALE.find((o) => o.value === raw)?.label.en ?? raw;
  return raw;
}

export function parentFreeText(sub?: Submission): string {
  if (!sub) return "";
  return Object.values(sub.answers).join("\n");
}

export function educatorFreeText(sub?: Submission): string {
  if (!sub) return "";
  return ["t_engage", "t_challenge", "t_strengths", "t_support", "t_paragraph"].map((k) => sub.answers[k] ?? "").join("\n");
}

/**
 * Plain-text intake in the shape PLINTH Studio's Analyse page accepts ("questions and answers in any layout").
 * Paste it whole into Studio. Question wording is printed in English beside each answer.
 */
export function studioText(c: CaseRow, parent: Parent, child: Child, subs: Submission[]): string {
  const by = Object.fromEntries(subs.map((s) => [s.source, s])) as Partial<Record<Submission["source"], Submission>>;
  const lines: string[] = [];
  lines.push("=== PLINTH HDI INTAKE — exported from the PLINTH Parent Portal ===");
  lines.push(`Case reference: ${c.ref}`);
  lines.push(`Consent: parent/guardian consent given and email verified ${c.verified_at ? new Date(c.verified_at).toISOString() : "—"}`);
  lines.push(`Sources received: ${(["student", "parent", "educator"] as const).map((s) => `${s} ${by[s] ? "yes" : "no"}`).join(", ")}`);
  lines.push("Instrument note: this intake does not ask for marks, screen or device use, or any medical information.");
  lines.push("");
  lines.push("--- STUDENT DETAILS (given by the parent) ---");
  lines.push(`Full name: ${child.name}`);
  lines.push(`Date of birth: ${child.dob}`);
  lines.push(`Current class: ${child.klass}`);
  lines.push(`Described by parent as: ${child.gender}`);
  lines.push(`City: ${child.city}`);
  lines.push(`State: ${child.state}`);
  lines.push(`Parent completing the form: ${parent.name} (${parent.relation})`);
  if (parent.otherParent) lines.push(`Other parent: ${parent.otherParent}`);

  for (const source of ["student", "parent", "educator"] as const) {
    const sub = by[source];
    lines.push("");
    lines.push(`--- ${SECTION_TITLE[source]} ---`);
    if (!sub) {
      lines.push(source === "educator" ? "Not returned: no educator response was received." : "Not returned.");
      continue;
    }
    lines.push(`(Submitted ${new Date(sub.submitted_at).toISOString()} · question set ${sub.question_set})`);
    for (const q of allQuestions(source)) {
      const a = sub.answers[q.id];
      lines.push(`Q: ${q.label.en}`);
      lines.push(`A: ${a ? answerText(q, a) : "(left blank)"}`);
    }
  }

  const edu = by.educator;
  if (edu) {
    const v = educatorIntegrity(educatorFreeText(edu), parentFreeText(by.parent));
    lines.push("");
    lines.push("--- PORTAL SOURCE-INTEGRITY CHECK ---");
    lines.push(
      v.level === "duplicate"
        ? `Educator text closely repeats the parent's text (${Math.round(v.overlap * 100)}% phrase overlap). Treat as NOT an independent educator source.`
        : v.level === "review"
          ? `Educator text partly repeats the parent's text (${Math.round(v.overlap * 100)}% phrase overlap). Check independence before counting it as a third source.`
          : `No meaningful overlap between educator and parent text (${Math.round(v.overlap * 100)}% phrase overlap).`,
    );
  }
  return lines.join("\n");
}

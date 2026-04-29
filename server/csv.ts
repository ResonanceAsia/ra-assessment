import type { Submission } from "@shared/schema";

const escape = (v: unknown): string => {
  if (v === null || v === undefined) return "";
  let s = String(v);
  // Strip control chars and normalize newlines
  s = s.replace(/\r\n?/g, "\n");
  if (/[",\n]/.test(s)) {
    s = `"${s.replace(/"/g, '""')}"`;
  }
  return s;
};

export interface SectionBEntry {
  qId: string;
  choice: string | string[];
  why: string;
}

export function submissionToCsv(s: Submission): string {
  const sectionB: SectionBEntry[] = JSON.parse(s.sectionB);
  const sectionC: { c1: string; c2: string; c3: string } = JSON.parse(s.sectionC);

  const rows: (string | number | boolean)[][] = [];
  // Header row
  rows.push(["Field", "Value"]);
  rows.push(["Submission ID", s.id]);
  rows.push(["Submitted At", s.submittedAt]);
  rows.push(["Client", s.client]);
  rows.push(["Role", s.role]);
  rows.push(["Candidate Name", s.candidateName]);
  rows.push(["Candidate Email", s.candidateEmail]);
  rows.push(["Candidate Mobile", s.candidateMobile]);
  rows.push(["Timezone", s.timezone]);
  rows.push(["Proctor", s.proctor ?? ""]);
  rows.push(["Attestation", s.attestation ? "TRUE" : "FALSE"]);
  rows.push([]);
  rows.push(["Section", "Question", "Choice", "Rationale"]);
  for (const a of sectionB) {
    const choiceStr = Array.isArray(a.choice) ? a.choice.join(" + ") : a.choice;
    rows.push(["B", a.qId, choiceStr, a.why]);
  }
  rows.push([]);
  rows.push(["Section", "Prompt", "Response"]);
  rows.push(["C", "C1 — Board Paper Recommendation", sectionC.c1]);
  rows.push(["C", "C2 — What would change your recommendation", sectionC.c2]);
  rows.push(["C", "C3 — Regulator + HQ scripts", sectionC.c3]);

  return rows.map((r) => r.map(escape).join(",")).join("\n");
}

export function submissionToHtml(s: Submission): string {
  const sectionB: SectionBEntry[] = JSON.parse(s.sectionB);
  const sectionC: { c1: string; c2: string; c3: string } = JSON.parse(s.sectionC);
  const esc = (x: string) =>
    x
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>");

  const bRows = sectionB
    .map((a) => {
      const c = Array.isArray(a.choice) ? a.choice.join(" + ") : a.choice;
      return `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:600;vertical-align:top;width:60px;">${esc(a.qId)}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;vertical-align:top;width:60px;font-family:monospace;">${esc(c)}</td>
          <td style="padding:8px;border-bottom:1px solid #e5e7eb;vertical-align:top;color:#1f2937;">${esc(a.why)}</td>
        </tr>`;
    })
    .join("");

  return `<!doctype html>
<html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#0B1A2E;max-width:760px;margin:0 auto;padding:24px;">
  <div style="background:#0F2A4A;color:#fff;padding:16px 20px;border-radius:8px;margin-bottom:24px;">
    <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;opacity:0.7;">RESONANCE ASIA · Executive Case Study</div>
    <h1 style="margin:6px 0 0;font-size:18px;">Submission ${esc(s.id)}</h1>
  </div>

  <h2 style="font-size:14px;border-bottom:2px solid #3FB6B6;padding-bottom:6px;">Candidate</h2>
  <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:24px;">
    <tr><td style="padding:4px 8px;color:#6b7280;width:140px;">Name</td><td style="padding:4px 8px;">${esc(s.candidateName)}</td></tr>
    <tr><td style="padding:4px 8px;color:#6b7280;">Email</td><td style="padding:4px 8px;">${esc(s.candidateEmail)}</td></tr>
    <tr><td style="padding:4px 8px;color:#6b7280;">Mobile</td><td style="padding:4px 8px;">${esc(s.candidateMobile)}</td></tr>
    <tr><td style="padding:4px 8px;color:#6b7280;">Timezone</td><td style="padding:4px 8px;">${esc(s.timezone)}</td></tr>
    <tr><td style="padding:4px 8px;color:#6b7280;">Client</td><td style="padding:4px 8px;">${esc(s.client)}</td></tr>
    <tr><td style="padding:4px 8px;color:#6b7280;">Role</td><td style="padding:4px 8px;">${esc(s.role)}</td></tr>
    <tr><td style="padding:4px 8px;color:#6b7280;">Proctor</td><td style="padding:4px 8px;">${esc(s.proctor ?? "")}</td></tr>
    <tr><td style="padding:4px 8px;color:#6b7280;">Submitted</td><td style="padding:4px 8px;">${esc(s.submittedAt)}</td></tr>
  </table>

  <h2 style="font-size:14px;border-bottom:2px solid #3FB6B6;padding-bottom:6px;">Section B — 12 MCQ Rationales</h2>
  <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:24px;">
    <thead><tr style="background:#f3f4f6;">
      <th style="padding:8px;text-align:left;">Q</th><th style="padding:8px;text-align:left;">Choice</th><th style="padding:8px;text-align:left;">Rationale</th>
    </tr></thead>
    <tbody>${bRows}</tbody>
  </table>

  <h2 style="font-size:14px;border-bottom:2px solid #3FB6B6;padding-bottom:6px;">Section C — Written Responses</h2>
  <h3 style="font-size:12px;color:#3FB6B6;margin-top:14px;">C1 — Board Paper Recommendation</h3>
  <p style="font-size:13px;line-height:1.55;white-space:pre-wrap;">${esc(sectionC.c1)}</p>
  <h3 style="font-size:12px;color:#3FB6B6;margin-top:14px;">C2 — What would change your recommendation</h3>
  <p style="font-size:13px;line-height:1.55;white-space:pre-wrap;">${esc(sectionC.c2)}</p>
  <h3 style="font-size:12px;color:#3FB6B6;margin-top:14px;">C3 — Regulator + HQ dual-reporting scripts</h3>
  <p style="font-size:13px;line-height:1.55;white-space:pre-wrap;">${esc(sectionC.c3)}</p>

  <p style="font-size:11px;color:#6b7280;margin-top:32px;border-top:1px solid #e5e7eb;padding-top:12px;">
    A full CSV of this submission is attached.<br>
    © Resonance Asia · Confidential
  </p>
</body></html>`;
}

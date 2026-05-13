import { Resend } from "resend";
import type { Submission } from "@shared/schema";
import { submissionToPdf } from "./pdf";

// Same delivery pipe as the weekly APAC Insurance Leadership Movement Digest:
// Resend API → linus@resonanceasia.com.
const RECIPIENT = "linus@resonanceasia.com";
// Sandbox sender — same pattern as the weekly APAC Insurance Leadership
// Movement Digest. Only delivers to the Resend account holder's email
// (linus@resonanceasia.com). Once resonanceasia.com is verified in Resend,
// switch to assessments@resonanceasia.com via RESEND_FROM env var.
const FROM = process.env.RESEND_FROM || "Resonance Asia Assessments <onboarding@resend.dev>";

let cached: Resend | null = null;
function getClient(): Resend | null {
  if (cached) return cached;
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  cached = new Resend(key);
  return cached;
}

export function emailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

export async function sendSubmissionEmail(s: Submission): Promise<void> {
  const client = getClient();
  if (!client) {
    throw new Error("Resend not configured (set RESEND_API_KEY env var)");
  }

  const fullName = `${s.candidateName}${s.candidateSurname ? " " + s.candidateSurname : ""}`.trim();
  const pdf = await submissionToPdf(s);
  const pdfB64 = pdf.toString("base64");
  const filename = `RA-Assessment_${fullName.replace(/[^A-Za-z0-9]+/g, "-") || s.candidateName.replace(/[^A-Za-z0-9]+/g, "-")}_${s.id}.pdf`;

  const subjectTail = [s.role, s.client].filter(Boolean).join(" · ");
  const subject = `New submission · ${fullName}${subjectTail ? " · " + subjectTail : ""}`;
  const elapsed = s.elapsedSeconds ?? 0;
  const mm = Math.floor(elapsed / 60);
  const ss = elapsed % 60;
  const overBudget = elapsed > 45 * 60;
  const elapsedDisplay = elapsed > 0 ? `${mm}m ${String(ss).padStart(2, "0")}s` : "—";

  const html = `<!doctype html>
<html><body style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#0B1A2E;max-width:560px;margin:0 auto;padding:20px;">
  <div style="background:#0F2A4A;color:#fff;padding:14px 18px;border-radius:6px;">
    <div style="font-size:10px;letter-spacing:0.16em;text-transform:uppercase;opacity:0.75;">Resonance Asia · Executive Case Study</div>
    <div style="font-size:16px;font-weight:600;margin-top:4px;">New candidate submission</div>
  </div>
  <table style="width:100%;border-collapse:collapse;font-size:13px;margin-top:16px;">
    <tr><td style="padding:5px 0;color:#6b7280;width:130px;">Candidate</td><td style="padding:5px 0;font-weight:600;">${escape(fullName)}</td></tr>
    <tr><td style="padding:5px 0;color:#6b7280;">Email</td><td style="padding:5px 0;">${escape(s.candidateEmail)}</td></tr>
    <tr><td style="padding:5px 0;color:#6b7280;">Client / Role</td><td style="padding:5px 0;">${escape(s.client || "—")} — ${escape(s.role || "—")}</td></tr>
    <tr><td style="padding:5px 0;color:#6b7280;">Submitted</td><td style="padding:5px 0;">${escape(s.submittedAt)}</td></tr>
    <tr><td style="padding:5px 0;color:#6b7280;">Time on B + C</td><td style="padding:5px 0;color:${overBudget ? "#b45309" : "#0B1A2E"};font-weight:${overBudget ? 600 : 400};">${elapsedDisplay}${overBudget ? " · over 45m budget" : ""}</td></tr>
    <tr><td style="padding:5px 0;color:#6b7280;">Submission ID</td><td style="padding:5px 0;font-family:monospace;font-size:12px;">${escape(s.id)}</td></tr>
  </table>
  <p style="font-size:13px;color:#0B1A2E;margin-top:18px;">The full submission is attached as a branded PDF for review.</p>
  <p style="font-size:11px;color:#6b7280;margin-top:24px;border-top:1px solid #e5e7eb;padding-top:10px;">© Resonance Asia · Confidential</p>
</body></html>`;

  const { data, error } = await client.emails.send({
    from: FROM,
    to: [RECIPIENT],
    replyTo: s.candidateEmail,
    subject,
    html,
    text: `New submission from ${fullName} (${s.candidateEmail})${s.role ? " for " + s.role : ""}${s.client ? " at " + s.client : ""}. Submitted ${s.submittedAt}. Full PDF attached.`,
    attachments: [
      {
        filename,
        content: pdfB64,
        contentType: "application/pdf",
      },
    ],
  });

  if (error) {
    throw new Error(
      `Resend API error: ${error.name ?? "unknown"} — ${error.message ?? JSON.stringify(error)}`
    );
  }
  if (!data?.id) {
    throw new Error("Resend returned no message id");
  }
}

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

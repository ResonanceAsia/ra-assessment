import nodemailer, { type Transporter } from "nodemailer";
import type { Submission } from "@shared/schema";
import { submissionToCsv, submissionToHtml } from "./csv";

const ASSESSMENT_INBOX = "executiveassessments@resonanceasia.com";

let cached: Transporter | null = null;

function getTransport(): Transporter | null {
  if (cached) return cached;
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    return null;
  }
  cached = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, STARTTLS for 587
    auth: { user, pass },
  });
  return cached;
}

export function emailConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

export async function sendSubmissionEmail(s: Submission): Promise<void> {
  const transport = getTransport();
  if (!transport) {
    throw new Error("SMTP not configured (set SMTP_HOST, SMTP_USER, SMTP_PASS env vars)");
  }
  const fromAddr = process.env.SMTP_FROM || process.env.SMTP_USER!;
  const subject = `Case Study Submission — ${s.client} — ${s.role} — ${s.candidateName} — ${s.submittedAt}`;
  const html = submissionToHtml(s);
  const csv = submissionToCsv(s);

  await transport.sendMail({
    from: fromAddr,
    to: ASSESSMENT_INBOX,
    replyTo: s.candidateEmail,
    subject,
    html,
    text: `Submission ${s.id} from ${s.candidateName} (${s.candidateEmail}). See attached CSV.`,
    attachments: [
      {
        filename: `${s.id}.csv`,
        content: csv,
        contentType: "text/csv; charset=utf-8",
      },
    ],
  });
}

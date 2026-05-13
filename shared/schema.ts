import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Stores one row per completed case-study submission. Section B answers and
// Section C responses are stored as JSON strings since SQLite has no array
// type — they are parsed in application code.
export const submissions = sqliteTable("submissions", {
  id: text("id").primaryKey(), // ULID-style id like "RA-2026-0001"
  client: text("client").default(""),
  role: text("role").default(""),
  candidateName: text("candidate_name").notNull(),
  candidateSurname: text("candidate_surname").default(""),
  candidateEmail: text("candidate_email").notNull(),
  candidateMobile: text("candidate_mobile").default(""),
  timezone: text("timezone").default(""),
  proctor: text("proctor").default(""),
  attestation: integer("attestation", { mode: "boolean" }).default(true),
  submittedAt: text("submitted_at").notNull(), // ISO string
  // Section B: JSON array of N entries: { qId, choice (string | string[]), why }.
  // Question count is governed by mcqs.length in client/src/data/case.ts.
  sectionB: text("section_b").notNull(),
  // Section C: JSON object { c1, c2, c3 }
  sectionC: text("section_c").notNull(),
  emailStatus: text("email_status").default("pending"), // pending | sent | failed
  emailError: text("email_error").default(""),
  // Random per-submission token used to gate the CSV download endpoint.
  downloadToken: text("download_token").default(""),
  // Timer: when Section B was opened (ISO string) and total elapsed seconds
  // recorded at submit time. Both optional / nullable for backwards compat.
  timerStartedAt: text("timer_started_at").default(""),
  elapsedSeconds: integer("elapsed_seconds").default(0),
});

export const insertSubmissionSchema = createInsertSchema(submissions).omit({
  id: true,
  submittedAt: true,
  emailStatus: true,
  emailError: true,
  downloadToken: true,
  timerStartedAt: true,
  elapsedSeconds: true,
});

export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = typeof submissions.$inferSelect;

// Client-facing payload that the form posts to /api/submissions.
// Only candidateName, candidateSurname, candidateEmail are required from the
// candidate. Client/role/proctor are filled by the admin invite flow.
export const submissionPayloadSchema = z.object({
  client: z.string().optional().default(""),
  role: z.string().optional().default(""),
  candidateName: z.string().min(1),
  candidateSurname: z.string().min(1),
  candidateEmail: z.string().email(),
  candidateMobile: z.string().optional().default(""),
  timezone: z.string().optional().default(""),
  proctor: z.string().optional().default(""),
  attestation: z.boolean().optional().default(true),
  sectionB: z.array(
    z.object({
      qId: z.string(),
      choice: z.union([z.string(), z.array(z.string())]),
      why: z.string().min(60, "Rationale must be at least 60 characters"),
    })
  ).length(11),
  sectionC: z.object({
    c1: z.string().min(200),
    c2: z.string().min(240),
    c3: z.string().min(180),
  }),
  // Optional timer telemetry — present once Section B has been entered.
  timerStartedAt: z.string().nullable().optional(),
  elapsedSeconds: z.number().int().min(0).optional(),
  // Optional invite token — present when the candidate arrived via an /admin invite link.
  inviteToken: z.string().optional(),
});

export type SubmissionPayload = z.infer<typeof submissionPayloadSchema>;

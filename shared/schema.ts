import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Stores one row per completed case-study submission. Section B answers and
// Section C responses are stored as JSON strings since SQLite has no array
// type — they are parsed in application code.
export const submissions = sqliteTable("submissions", {
  id: text("id").primaryKey(), // ULID-style id like "RA-2026-0001"
  client: text("client").notNull(),
  role: text("role").notNull(),
  candidateName: text("candidate_name").notNull(),
  candidateEmail: text("candidate_email").notNull(),
  candidateMobile: text("candidate_mobile").notNull(),
  timezone: text("timezone").notNull(),
  proctor: text("proctor").default(""),
  attestation: integer("attestation", { mode: "boolean" }).notNull(),
  submittedAt: text("submitted_at").notNull(), // ISO string
  // Section B: JSON array of 12 entries: { qId, choice (string | string[]), why }
  sectionB: text("section_b").notNull(),
  // Section C: JSON object { c1, c2, c3 }
  sectionC: text("section_c").notNull(),
  emailStatus: text("email_status").default("pending"), // pending | sent | failed
  emailError: text("email_error").default(""),
  // Random per-submission token used to gate the CSV download endpoint.
  downloadToken: text("download_token").default(""),
});

export const insertSubmissionSchema = createInsertSchema(submissions).omit({
  id: true,
  submittedAt: true,
  emailStatus: true,
  emailError: true,
  downloadToken: true,
});

export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = typeof submissions.$inferSelect;

// Client-facing payload that the form posts to /api/submissions
export const submissionPayloadSchema = z.object({
  client: z.string().min(1),
  role: z.string().min(1),
  candidateName: z.string().min(2),
  candidateEmail: z.string().email(),
  candidateMobile: z.string().min(5),
  timezone: z.string().min(1),
  proctor: z.string().optional().default(""),
  attestation: z.literal(true),
  sectionB: z.array(
    z.object({
      qId: z.string(),
      choice: z.union([z.string(), z.array(z.string())]),
      why: z.string().min(60, "Rationale must be at least 60 characters"),
    })
  ).length(12),
  sectionC: z.object({
    c1: z.string().min(80),
    c2: z.string().min(60),
    c3: z.string().min(80),
  }),
});

export type SubmissionPayload = z.infer<typeof submissionPayloadSchema>;

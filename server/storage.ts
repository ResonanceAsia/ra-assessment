import { submissions } from '@shared/schema';
import type { Submission, InsertSubmission } from '@shared/schema';
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, desc } from "drizzle-orm";

const sqlite = new Database("data.db");
sqlite.pragma("journal_mode = WAL");

// Create the submissions table on first boot if Drizzle migrations haven't run.
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS submissions (
    id TEXT PRIMARY KEY,
    client TEXT NOT NULL,
    role TEXT NOT NULL,
    candidate_name TEXT NOT NULL,
    candidate_email TEXT NOT NULL,
    candidate_mobile TEXT NOT NULL,
    timezone TEXT NOT NULL,
    proctor TEXT DEFAULT '',
    attestation INTEGER NOT NULL,
    submitted_at TEXT NOT NULL,
    section_b TEXT NOT NULL,
    section_c TEXT NOT NULL,
    email_status TEXT DEFAULT 'pending',
    email_error TEXT DEFAULT '',
    download_token TEXT DEFAULT ''
  );
`);

// Add the download_token column for older databases (e.g. snapshotted) that
// were created before the column existed. SQLite-safe migration.
try {
  const cols = sqlite.prepare(`PRAGMA table_info(submissions)`).all() as { name: string }[];
  if (!cols.some((c) => c.name === "download_token")) {
    sqlite.exec(`ALTER TABLE submissions ADD COLUMN download_token TEXT DEFAULT ''`);
  }
} catch (_) {
  // best-effort
}

export const db = drizzle(sqlite);

export type CreateSubmissionInput = InsertSubmission & {
  id: string;
  submittedAt: string;
  downloadToken: string;
};

export interface IStorage {
  createSubmission(input: CreateSubmissionInput): Promise<Submission>;
  getSubmission(id: string): Promise<Submission | undefined>;
  listSubmissions(limit?: number): Promise<Submission[]>;
  updateEmailStatus(id: string, status: "sent" | "failed", error?: string): Promise<void>;
  countToday(): number;
}

export class DatabaseStorage implements IStorage {
  async createSubmission(
    input: CreateSubmissionInput
  ): Promise<Submission> {
    return db.insert(submissions).values(input).returning().get();
  }

  async getSubmission(id: string): Promise<Submission | undefined> {
    return db.select().from(submissions).where(eq(submissions.id, id)).get();
  }

  async listSubmissions(limit = 50): Promise<Submission[]> {
    return db.select().from(submissions).orderBy(desc(submissions.submittedAt)).limit(limit).all();
  }

  async updateEmailStatus(id: string, status: "sent" | "failed", error = "") {
    db.update(submissions)
      .set({ emailStatus: status, emailError: error })
      .where(eq(submissions.id, id))
      .run();
  }

  countToday(): number {
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const row = sqlite
      .prepare(
        `SELECT COUNT(*) as n FROM submissions WHERE substr(submitted_at,1,10) = ?`
      )
      .get(today) as { n: number } | undefined;
    return row?.n ?? 0;
  }
}

export const storage = new DatabaseStorage();

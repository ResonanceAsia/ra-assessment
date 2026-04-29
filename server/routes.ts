import type { Express, Request, Response } from "express";
import type { Server } from "node:http";
import { randomBytes } from "node:crypto";
import { storage } from "./storage";
import { submissionPayloadSchema } from "@shared/schema";
import { submissionToCsv } from "./csv";
import { sendSubmissionEmail, emailConfigured } from "./email";

function generateId(): string {
  // RA-YYYY-NNNN, where NNNN is today's count + 1 padded.
  const year = new Date().getUTCFullYear();
  const n = storage.countToday() + 1;
  return `RA-${year}-${String(n).padStart(4, "0")}-${Math.random()
    .toString(36)
    .slice(2, 6)
    .toUpperCase()}`;
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, smtp: emailConfigured() });
  });

  // Submit assessment
  app.post("/api/submissions", async (req: Request, res: Response) => {
    const parsed = submissionPayloadSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid payload",
        issues: parsed.error.flatten(),
      });
    }
    const data = parsed.data;
    const id = generateId();
    const submittedAt = new Date().toISOString();
    const downloadToken = randomBytes(24).toString("hex"); // 48-char hex

    const submission = await storage.createSubmission({
      id,
      client: data.client,
      role: data.role,
      candidateName: data.candidateName,
      candidateEmail: data.candidateEmail,
      candidateMobile: data.candidateMobile,
      timezone: data.timezone,
      proctor: data.proctor ?? "",
      attestation: data.attestation,
      submittedAt,
      sectionB: JSON.stringify(data.sectionB),
      sectionC: JSON.stringify(data.sectionC),
      downloadToken,
    });

    // Send email asynchronously, but await briefly so the response can carry status.
    let emailStatus: "sent" | "failed" | "pending" = "pending";
    let emailError = "";
    if (emailConfigured()) {
      try {
        await sendSubmissionEmail(submission);
        emailStatus = "sent";
      } catch (err) {
        emailStatus = "failed";
        emailError = err instanceof Error ? err.message : String(err);
        console.error("[email] send failed", err);
      }
      await storage.updateEmailStatus(id, emailStatus === "sent" ? "sent" : "failed", emailError);
    } else {
      console.warn("[email] SMTP not configured — skipping send for", id);
    }

    res.status(201).json({
      id,
      emailStatus,
      submittedAt,
      downloadToken,
    });
  });

  // CSV download for a single submission. Requires either:
  //   - the per-submission download token returned at submission time, or
  //   - the admin token (if configured).
  // Constant-time compare on tokens to avoid timing attacks.
  app.get("/api/submissions/:id/csv", async (req: Request, res: Response) => {
    const id = String(req.params.id ?? "");
    const sub = await storage.getSubmission(id);
    if (!sub) {
      return res.status(404).json({ error: "Not found" });
    }
    const provided = String(
      req.query.token ??
        req.headers["x-download-token"] ??
        req.headers["x-admin-token"] ??
        ""
    );
    const adminToken = process.env.ADMIN_TOKEN ?? "";
    const expected = sub.downloadToken ?? "";
    const okDownload =
      expected.length > 0 && safeEqual(provided, expected);
    const okAdmin = adminToken.length > 0 && safeEqual(provided, adminToken);
    if (!okDownload && !okAdmin) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${sub.id}.csv"`);
    res.send(submissionToCsv(sub));
  });

  // Lightweight admin list (token-gated). Set ADMIN_TOKEN env var to enable.
  app.get("/api/admin/submissions", async (req: Request, res: Response) => {
    const token = process.env.ADMIN_TOKEN;
    if (!token) {
      return res.status(404).json({ error: "Admin disabled" });
    }
    const provided =
      (req.query.token as string | undefined) ||
      (req.headers["x-admin-token"] as string | undefined);
    if (provided !== token) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const list = await storage.listSubmissions(100);
    res.json({
      count: list.length,
      submissions: list.map((s) => ({
        id: s.id,
        submittedAt: s.submittedAt,
        candidateName: s.candidateName,
        candidateEmail: s.candidateEmail,
        client: s.client,
        role: s.role,
        emailStatus: s.emailStatus,
      })),
    });
  });

  return httpServer;
}

import type { Express, Request, Response } from "express";
import type { Server } from "node:http";
import { randomBytes } from "node:crypto";
import { storage, inviteStore } from "./storage";
import { submissionPayloadSchema } from "@shared/schema";
import { submissionToCsv } from "./csv";
import { sendSubmissionEmail, emailConfigured } from "./email";
import { z } from "zod";

const INVITE_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days

const createInviteSchema = z.object({
  candidateName: z.string().min(2),
  candidateEmail: z.string().email(),
  role: z.string().min(1),
  client: z.string().min(1),
  proctor: z.string().optional().default(""),
  createdBy: z.string().optional().default(""),
});

function inviteStatus(invite: { expiresAt: string; submittedAt: string }): "active" | "used" | "expired" {
  if (invite.submittedAt) return "used";
  if (new Date(invite.expiresAt).getTime() < Date.now()) return "expired";
  return "active";
}

function requireAdmin(req: Request, res: Response): boolean {
  const token = process.env.ADMIN_TOKEN;
  if (!token) {
    res.status(404).json({ error: "Admin disabled" });
    return false;
  }
  // Header only — do NOT accept the admin token via query string, since
  // query strings appear in browser history, proxy/CDN logs, and Referer headers.
  const provided = (req.headers["x-admin-token"] as string | undefined) ?? "";
  if (provided.length !== token.length || !safeEqual(provided, token)) {
    res.status(401).json({ error: "Unauthorized" });
    return false;
  }
  return true;
}

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
    res.json({ ok: true, email: emailConfigured() });
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

    // If an invite token is supplied, validate it before creating the submission.
    let validatedInvite: ReturnType<typeof inviteStore.get> | null = null;
    if (data.inviteToken) {
      const inv = inviteStore.get(data.inviteToken);
      if (!inv) {
        return res.status(404).json({ error: "Invite not found" });
      }
      const status = inviteStatus(inv);
      if (status === "used") {
        return res.status(410).json({ error: "This invite has already been used." });
      }
      if (status === "expired") {
        return res.status(410).json({ error: "This invite has expired." });
      }
      validatedInvite = inv;
    }

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
      timerStartedAt: data.timerStartedAt ?? "",
      elapsedSeconds: data.elapsedSeconds ?? 0,
    });

    if (validatedInvite) {
      inviteStore.markUsed(validatedInvite.token, id);
    }

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
    // Header only for the admin token; the per-submission download token may
    // still be passed as ?token=... since it is single-purpose and rotates per submission.
    const provided = String(
      req.query.token ??
        req.headers["x-download-token"] ??
        ""
    );
    const adminProvided = String(req.headers["x-admin-token"] ?? "");
    const adminToken = process.env.ADMIN_TOKEN ?? "";
    const expected = sub.downloadToken ?? "";
    const okDownload =
      expected.length > 0 &&
      provided.length === expected.length &&
      safeEqual(provided, expected);
    const okAdmin =
      adminToken.length > 0 &&
      adminProvided.length === adminToken.length &&
      safeEqual(adminProvided, adminToken);
    if (!okDownload && !okAdmin) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${sub.id}.csv"`);
    res.send(submissionToCsv(sub));
  });

  // Lightweight admin list (token-gated). Set ADMIN_TOKEN env var to enable.
  app.get("/api/admin/submissions", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
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

  // Create an invite (admin-gated). Returns the link an RA staffer can paste
  // into their own email client.
  app.post("/api/invites", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    const parsed = createInviteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: "Invalid payload",
        issues: parsed.error.flatten(),
      });
    }
    const token = randomBytes(16).toString("hex"); // 32-char hex
    const expiresAt = new Date(Date.now() + INVITE_TTL_MS).toISOString();
    const invite = inviteStore.create({
      token,
      candidateName: parsed.data.candidateName,
      candidateEmail: parsed.data.candidateEmail,
      role: parsed.data.role,
      client: parsed.data.client,
      proctor: parsed.data.proctor,
      createdBy: parsed.data.createdBy,
      expiresAt,
    });
    res.status(201).json({
      token: invite.token,
      expiresAt: invite.expiresAt,
      candidateName: invite.candidateName,
      candidateEmail: invite.candidateEmail,
      role: invite.role,
      client: invite.client,
      proctor: invite.proctor,
    });
  });

  // Public lookup — returns invite metadata if the token is valid (active).
  // Intentionally returns minimal data so the link stays safe to share.
  app.get("/api/invites/:token", async (req: Request, res: Response) => {
    const token = String(req.params.token ?? "");
    const inv = inviteStore.get(token);
    if (!inv) {
      return res.status(404).json({ error: "Invite not found" });
    }
    const status = inviteStatus(inv);
    if (status === "used") {
      return res.status(410).json({ error: "This invite has already been used." });
    }
    if (status === "expired") {
      return res.status(410).json({ error: "This invite has expired." });
    }
    res.json({
      token: inv.token,
      candidateName: inv.candidateName,
      candidateEmail: inv.candidateEmail,
      role: inv.role,
      client: inv.client,
      proctor: inv.proctor,
      expiresAt: inv.expiresAt,
    });
  });

  // Admin invite list — last N invites with derived status.
  app.get("/api/admin/invites", async (req: Request, res: Response) => {
    if (!requireAdmin(req, res)) return;
    const list = inviteStore.list(20);
    res.json({
      count: list.length,
      invites: list.map((i) => ({
        token: i.token,
        candidateName: i.candidateName,
        candidateEmail: i.candidateEmail,
        role: i.role,
        client: i.client,
        createdAt: i.createdAt,
        expiresAt: i.expiresAt,
        status: inviteStatus(i),
        submissionId: i.submissionId,
      })),
    });
  });

  return httpServer;
}

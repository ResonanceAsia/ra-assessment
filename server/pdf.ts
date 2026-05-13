import PDFDocument from "pdfkit";
import type { Submission } from "@shared/schema";
import type { SectionBEntry } from "./csv";

// Resonance Asia brand
const NAVY = "#0F2A4A";
const TEAL = "#3FB6B6";
const INK = "#0B1A2E";
const MUTED = "#6B7280";
const RULE = "#E5E7EB";
const WARN = "#B45309";

const PAGE_MARGIN = 56; // ~0.78"
const CONTENT_WIDTH = 612 - PAGE_MARGIN * 2; // Letter portrait

export async function submissionToPdf(s: Submission): Promise<Buffer> {
  const sectionB: SectionBEntry[] = JSON.parse(s.sectionB);
  const sectionC: { c1: string; c2: string; c3: string } = JSON.parse(s.sectionC);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "LETTER",
      margins: { top: PAGE_MARGIN, bottom: PAGE_MARGIN, left: PAGE_MARGIN, right: PAGE_MARGIN },
      info: {
        Title: `Submission ${s.id} — ${s.candidateName}${s.candidateSurname ? " " + s.candidateSurname : ""}`,
        Author: "Resonance Asia",
        Subject: "Executive Case Study Assessment Submission",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (c) => chunks.push(c as Buffer));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // ---- Header band ----
    doc.rect(0, 0, 612, 96).fill(NAVY);
    doc
      .fillColor("#FFFFFF")
      .font("Helvetica-Bold")
      .fontSize(8)
      .text("RESONANCE ASIA · EXECUTIVE CASE STUDY", PAGE_MARGIN, 28, {
        characterSpacing: 1.6,
      });
    doc
      .fillColor("#FFFFFF")
      .font("Helvetica-Bold")
      .fontSize(18)
      .text("Candidate Submission", PAGE_MARGIN, 46);
    doc
      .fillColor(TEAL)
      .font("Helvetica")
      .fontSize(10)
      .text(s.id, PAGE_MARGIN, 72);

    // Reset cursor below header
    doc.y = 128;
    doc.x = PAGE_MARGIN;

    // ---- Candidate metadata block ----
    sectionTitle(doc, "Candidate");
    const elapsed = s.elapsedSeconds ?? 0;
    const overBudget = elapsed > 45 * 60;
    const elapsedDisplay = elapsed > 0
      ? `${Math.floor(elapsed / 60)}m ${String(elapsed % 60).padStart(2, "0")}s`
      : "—";

    keyValueGrid(doc, [
      ["Name", `${s.candidateName}${s.candidateSurname ? " " + s.candidateSurname : ""}`],
      ["Email", s.candidateEmail],
      ["Client", s.client || "—"],
      ["Role", s.role || "—"],
      ["Proctor", s.proctor || "—"],
      ["Submitted", s.submittedAt],
      ["Section B started", s.timerStartedAt || "—"],
      [
        "Time on B + C",
        elapsedDisplay + (overBudget ? "  · OVER 45m BUDGET" : ""),
        overBudget ? WARN : INK,
      ],
    ]);

    // ---- Section B ----
    doc.moveDown(1.2);
    sectionTitle(doc, "Section B — MCQ rationales");

    sectionB.forEach((a, i) => {
      const choice = Array.isArray(a.choice) ? a.choice.join(" + ") : a.choice;
      mcqBlock(doc, a.qId, choice, a.why, i === sectionB.length - 1);
    });

    // ---- Section C ----
    doc.moveDown(1.2);
    sectionTitle(doc, "Section C — Written responses");
    promptBlock(doc, "C1 — Board Paper Recommendation", sectionC.c1);
    promptBlock(doc, "C2 — What would change your recommendation", sectionC.c2);
    promptBlock(doc, "C3 — Regulator + HQ dual-reporting scripts", sectionC.c3);

    // ---- Footer on every page ----
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc
        .fillColor(MUTED)
        .font("Helvetica")
        .fontSize(8)
        .text(
          `© Resonance Asia · Confidential · Submission ${s.id} · Page ${i - range.start + 1} of ${range.count}`,
          PAGE_MARGIN,
          756,
          { width: CONTENT_WIDTH, align: "center" }
        );
    }

    doc.end();
  });
}

// ---- Helpers ----

function sectionTitle(doc: PDFKit.PDFDocument, label: string) {
  ensureSpace(doc, 36);
  const y = doc.y;
  doc
    .fillColor(INK)
    .font("Helvetica-Bold")
    .fontSize(11)
    .text(label.toUpperCase(), PAGE_MARGIN, y, { characterSpacing: 1.2 });
  // Teal underline rule
  doc
    .moveTo(PAGE_MARGIN, doc.y + 4)
    .lineTo(PAGE_MARGIN + CONTENT_WIDTH, doc.y + 4)
    .lineWidth(1.5)
    .strokeColor(TEAL)
    .stroke();
  doc.y = doc.y + 12;
  doc.x = PAGE_MARGIN;
}

function keyValueGrid(doc: PDFKit.PDFDocument, rows: [string, string, string?][]) {
  const labelW = 130;
  const valueW = CONTENT_WIDTH - labelW - 10;
  for (const [label, value, color] of rows) {
    const labelY = doc.y;
    const valueHeight = doc.heightOfString(value || "—", { width: valueW });
    const rowH = Math.max(valueHeight, 14) + 6;
    ensureSpace(doc, rowH);

    doc
      .fillColor(MUTED)
      .font("Helvetica")
      .fontSize(9)
      .text(label, PAGE_MARGIN, labelY, { width: labelW });
    doc
      .fillColor(color || INK)
      .font(color === WARN ? "Helvetica-Bold" : "Helvetica")
      .fontSize(10)
      .text(value || "—", PAGE_MARGIN + labelW + 10, labelY, { width: valueW });

    // Reset to bottom-most cursor of the two columns
    doc.y = labelY + rowH;
    doc.x = PAGE_MARGIN;

    // Subtle row divider
    doc
      .moveTo(PAGE_MARGIN, doc.y - 3)
      .lineTo(PAGE_MARGIN + CONTENT_WIDTH, doc.y - 3)
      .lineWidth(0.5)
      .strokeColor(RULE)
      .stroke();
  }
}

function mcqBlock(
  doc: PDFKit.PDFDocument,
  qId: string,
  choice: string,
  why: string,
  isLast: boolean
) {
  // Pre-measure for page break
  const headerH = 16;
  const whyH = doc.heightOfString(why || "—", { width: CONTENT_WIDTH - 12 });
  const total = headerH + whyH + 18;
  ensureSpace(doc, total);

  const startY = doc.y;
  // Q-id pill
  doc
    .fillColor(NAVY)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(qId, PAGE_MARGIN, startY, { continued: true })
    .fillColor(MUTED)
    .font("Helvetica")
    .text("   ·   ", { continued: true })
    .fillColor(TEAL)
    .font("Helvetica-Bold")
    .text(`Choice: ${choice}`);
  doc.moveDown(0.25);
  doc
    .fillColor(INK)
    .font("Helvetica")
    .fontSize(10)
    .text(why || "—", PAGE_MARGIN + 12, doc.y, {
      width: CONTENT_WIDTH - 12,
      lineGap: 2,
    });
  doc.moveDown(isLast ? 0.4 : 0.7);
  doc.x = PAGE_MARGIN;
}

function promptBlock(doc: PDFKit.PDFDocument, title: string, body: string) {
  ensureSpace(doc, 60);
  doc
    .fillColor(TEAL)
    .font("Helvetica-Bold")
    .fontSize(10)
    .text(title, PAGE_MARGIN, doc.y, { characterSpacing: 0.3 });
  doc.moveDown(0.3);
  doc
    .fillColor(INK)
    .font("Helvetica")
    .fontSize(10)
    .text(body || "—", PAGE_MARGIN, doc.y, {
      width: CONTENT_WIDTH,
      lineGap: 2.5,
    });
  doc.moveDown(0.9);
  doc.x = PAGE_MARGIN;
}

function ensureSpace(doc: PDFKit.PDFDocument, needed: number) {
  const bottomLimit = 756 - 24;
  if (doc.y + needed > bottomLimit) {
    doc.addPage();
    doc.y = PAGE_MARGIN;
    doc.x = PAGE_MARGIN;
  }
}

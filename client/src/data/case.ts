// Case content for the Regional CEO (APAC) Composite Insurer assessment.
// Sourced verbatim from Resonance-Asia-Executive-Assessment-Regional-CEO-
// Questions-And-Scoring-Guide.pdf. Do not edit answer order — they are
// pre-randomised by the case author.

export type ExhibitId = "E1" | "E2" | "E3" | "E4" | "BRIEF";

// A KeyValue is a labelled value with optional emphasis. The renderer
// places `label` on the left in muted text and `value` on the right in
// foreground weight, and applies tabular numbers so columns align.
export interface KeyValueRow {
  label: string;
  value: string; // supports **bold**
}

export interface SegmentRow {
  segment: string;
  premium: string; // e.g. "USD 1.1bn GWP"
  margin: string; // e.g. "Combined Ratio 104"
  marginTone: "loss" | "watch" | "ok" | "strong";
  detail: string; // e.g. "Loss ratio 78 / Expense 26"
  note: string; // qualitative note
}

// Every exhibit has a structured body. The card renderer chooses the
// layout per type — no markdown table soup, no truncation.
export type ExhibitBody =
  | { kind: "segments"; rows: SegmentRow[] }
  | { kind: "keyValue"; rows: KeyValueRow[]; footnote?: string }
  | { kind: "deal"; sections: { heading: string; rows: KeyValueRow[]; tone?: "neutral" | "warn" }[] }
  | { kind: "prose"; paragraphs: string[] };

export interface Exhibit {
  id: ExhibitId;
  title: string;
  subtitle?: string;
  body: ExhibitBody;
}

export const exhibits: Record<ExhibitId, Exhibit> = {
  E1: {
    id: "E1",
    title: "Segment Snapshot",
    subtitle: "FY2025 actual · by line of business",
    body: {
      kind: "segments",
      rows: [
        {
          segment: "P&C Motor (SEA)",
          premium: "USD 1.1bn GWP",
          margin: "Combined Ratio 104",
          marginTone: "loss",
          detail: "Loss ratio 78 · Expense 26",
          note: "Claims inflation rising; data maturity uneven",
        },
        {
          segment: "P&C Commercial",
          premium: "USD 0.7bn GWP",
          margin: "Combined Ratio 94",
          marginTone: "watch",
          detail: "Cat exposure meaningful",
          note: "Reinsurance renewal in 10 weeks",
        },
        {
          segment: "Health (SEA)",
          premium: "USD 0.9bn GWP",
          margin: "MLR 76",
          marginTone: "watch",
          detail: "Medical inflation 8–12%",
          note: "Provider contracting immature",
        },
        {
          segment: "Life (HK/SG)",
          premium: "USD 0.6bn APE",
          margin: "VNB margin 32%",
          marginTone: "strong",
          detail: "CSM growing",
          note: "Heavy reliance on banca",
        },
      ],
    },
  },
  E2: {
    id: "E2",
    title: "Hong Kong Capital Position",
    subtitle: "HKRBC, simplified",
    body: {
      kind: "keyValue",
      rows: [
        { label: "HKRBC Solvency ratio", value: "**115% of PCA**" },
        { label: "Minimum Capital Amount (MCA)", value: "**50% of PCA**" },
        { label: "IA informal expectation", value: "**~120%** as comfortable operating floor" },
        { label: "ORSA filing", value: "**not yet submitted** · due in 6 weeks" },
      ],
    },
  },
  E3: {
    id: "E3",
    title: "P&C Motor Early Development",
    subtitle: "Current year · 6 months of experience",
    body: {
      kind: "keyValue",
      rows: [
        { label: "Paid loss ratio at 6 months", value: "**67%**" },
        { label: "Actuarial range — ultimate LR", value: "**78% – 95%**" },
        { label: "Base case ultimate LR", value: "**86%**" },
      ],
      footnote: "Paid loss ratio is a leading-but-immature indicator; ultimate range is the binding constraint for reserving.",
    },
  },
  E4: {
    id: "E4",
    title: "Bancassurance Renewal",
    subtitle: "Multi-product · 10-year term",
    body: {
      kind: "deal",
      sections: [
        {
          heading: "Partner bank proposes",
          tone: "neutral",
          rows: [
            { label: "Upfront exclusivity fee", value: "**USD 180m**" },
            { label: "Commission share · yr 1", value: "**60%** of first-year premiums" },
            { label: "Minimum annual premium by year 3", value: "**USD 250m**" },
          ],
        },
        {
          heading: "Internal estimate if P&C and Health are included",
          tone: "warn",
          rows: [
            { label: "P&C bank-distributed Combined Ratio", value: "could reach **108**" },
            { label: "Health bank-distributed MLR", value: "could rise to **82** without provider controls" },
          ],
        },
      ],
    },
  },
  BRIEF: {
    id: "BRIEF",
    title: "Case Context Recap",
    body: {
      kind: "prose",
      paragraphs: [
        "You are incoming **Regional CEO, APAC** for Aurora Composite Insurance Group (Life + Health + P&C) operating in Hong Kong, Singapore, Thailand, Vietnam, Indonesia.",
        "Group HQ (Europe) is pressuring for growth and dividends. APAC regulators have recently signaled heightened scrutiny on capital adequacy, conduct, and operational resilience.",
        "You have **three weeks** to present a board paper covering capital allocation, a bancassurance renewal, motor remediation, and earnings implications.",
      ],
    },
  },
};

export const caseBrief = {
  title: "Regional CEO (APAC) — Composite Insurer",
  intro: `You are incoming **Regional CEO, APAC** for *Aurora Composite Insurance Group* (Life + Health + P&C) operating in Hong Kong, Singapore, Thailand, Vietnam, Indonesia. Group HQ (Europe) is pressuring for growth and dividends. APAC regulators have recently signaled heightened scrutiny on **capital adequacy, conduct, and operational resilience**.`,
  task: `You have **three weeks** to present a board paper covering:
1. capital allocation and solvency headroom,
2. a bancassurance renewal decision,
3. actions on a deteriorating P&C motor portfolio,
4. near-term earnings implications under a tightening risk environment.`,
};

export type SelectKind = "single" | "multi";

export interface MCQ {
  id: string; // Q1..Q12
  topic: string;
  stem: string;
  kind: SelectKind;
  multiMax?: number; // for kind === "multi"
  options: { key: "A" | "B" | "C" | "D"; text: string }[];
  whyPrompt: string;
  exhibits: ExhibitId[]; // exhibits to display alongside this question
}

export const mcqs: MCQ[] = [
  {
    id: "Q1",
    topic: "Capital redeployment under regulatory signal",
    stem: "HQ requests you transfer capital from HK to fund Indonesia growth. What is your best next step?",
    kind: "single",
    options: [
      { key: "A", text: "Approve transfer that keeps solvency at 110% (above MCA), disclose in next quarterly filing" },
      { key: "B", text: "Commission ORSA stress update; only propose transfer that stays above ~120% base-case and above MCA adverse-case; brief IA before board" },
      { key: "C", text: "Reject any transfer until next year; focus only on meeting legal minimums" },
      { key: "D", text: "Transfer immediately; plan to restore solvency later through reinsurance savings" },
    ],
    whyPrompt: "What specific regulator communication would you initiate before the board, and what condition would cause you to recommend no transfer?",
    exhibits: ["E2"],
  },
  {
    id: "Q2",
    topic: "Motor portfolio decision under immature data",
    stem: "Given Exhibit 3 and a board meeting in 5 days, what do you do? (select up to TWO)",
    kind: "multi",
    multiMax: 2,
    options: [
      { key: "A", text: "Use base ultimate 86%, present range to board; pause 25% growth until 12-month development" },
      { key: "B", text: "Allow +10% growth only in lowest-loss subsegments; set 90-day checkpoint and growth gate tied to reserve update" },
      { key: "C", text: "Defer both reserve and growth decisions until 12-month data" },
      { key: "D", text: "Approve +25% growth now; revisit at year-end" },
    ],
    whyPrompt: "Which metric is a red herring here, and what is the minimum information threshold you need?",
    exhibits: ["E3"],
  },
  {
    id: "Q3",
    topic: "Combined ratio interpretation",
    stem: "A segment combined ratio of 104 most directly implies:",
    kind: "single",
    options: [
      { key: "A", text: "Underwriting profit (before investment income)" },
      { key: "B", text: "Underwriting loss (before investment income)" },
      { key: "C", text: "Investment income is insufficient" },
      { key: "D", text: "Reserve strengthening is always required" },
    ],
    whyPrompt: "Name two drivers you would test to diagnose whether this is fixable in 6–12 months.",
    exhibits: ["E1"],
  },
  {
    id: "Q4",
    topic: "Bancassurance deal structure",
    stem: "What is the most CEO-appropriate way to evaluate Exhibit 4?",
    kind: "single",
    options: [
      { key: "A", text: "Decide based on total group premium uplift" },
      { key: "B", text: "Segment economics separately (Life vs P&C vs Health), define walk-away thresholds, explore performance-linked fee tranches and product-scope limits" },
      { key: "C", text: "Accept the deal; competitors are doing mega-deals" },
      { key: "D", text: "Reject the deal; exclusivity fees are always value destructive" },
    ],
    whyPrompt: "State your walk-away criterion in one sentence (must include a financial metric).",
    exhibits: ["E4"],
  },
  {
    id: "Q5",
    topic: "Stakeholder mapping",
    stem: "Which stakeholder map is most complete for this decision set?",
    kind: "single",
    options: [
      { key: "A", text: "Board, HQ, customers" },
      { key: "B", text: "Board, regulators, HQ, distribution partners, rating agencies, policyholders" },
      { key: "C", text: "Regulators only (they decide)" },
      { key: "D", text: "Sales and underwriting only (they execute)" },
    ],
    whyPrompt: "Identify one second-order consequence if you mishandle the bank negotiation.",
    exhibits: ["BRIEF"],
  },
  {
    id: "Q6",
    topic: "Decision velocity calibration",
    stem: "Which decision is most appropriate to treat as a 'one-way door' (harder to reverse)?",
    kind: "single",
    options: [
      { key: "A", text: "90-day motor pricing change" },
      { key: "B", text: "Signing a 10-year exclusive bancassurance agreement with large upfront fee" },
      { key: "C", text: "Launching a 3-month claims triage pilot" },
      { key: "D", text: "Adding a dashboard KPI pack" },
    ],
    whyPrompt: "What governance approvals are required before you decide?",
    exhibits: ["E4"],
  },
  {
    id: "Q7",
    topic: "Bias interruption",
    stem: "Your underwriting head argues: 'Paid LR is 67%, we are clearly profitable, approve growth.' Best response?",
    kind: "single",
    options: [
      { key: "A", text: "Approve; underwriting has local knowledge" },
      { key: "B", text: "Ask for the ultimate LR range and scenario-weighted expected value; articulate downside; set growth gate" },
      { key: "C", text: "Defer to actuary; no CEO view needed" },
      { key: "D", text: "Reject growth permanently; motor is always bad" },
    ],
    whyPrompt: "Name the bias risk in the underwriting head's argument and your countermeasure.",
    exhibits: ["E3"],
  },
  {
    id: "Q8",
    topic: "Capital allocation prioritisation",
    stem: "Given constrained capital and three initiatives (motor remediation, banca renewal, health cost controls), what sequencing is best?",
    kind: "single",
    options: [
      { key: "A", text: "Fund all three simultaneously to show momentum" },
      { key: "B", text: "Prioritise the initiative with the highest short-term premium growth" },
      { key: "C", text: "Sequence by regulatory/solvency constraint first, then stabilise underwriting leakage, then fund growth options with clear gates" },
      { key: "D", text: "Freeze investment until volatility subsides" },
    ],
    whyPrompt: "What KPI would you use as your 'go/no-go' gate for Phase 2 growth?",
    exhibits: ["E1", "E2"],
  },
  {
    id: "Q9",
    topic: "Regulatory-cultural navigation",
    stem: "In APAC consensus boards, the biggest risk of 'no objections' is:",
    kind: "single",
    options: [
      { key: "A", text: "Faster execution" },
      { key: "B", text: "Silent dissent leading to later reversal or passive resistance" },
      { key: "C", text: "Reduced documentation burden" },
      { key: "D", text: "Improved accountability" },
    ],
    whyPrompt: "Write the exact question you would ask in the boardroom to surface silent dissent.",
    exhibits: ["BRIEF"],
  },
  {
    id: "Q10",
    topic: "Communication under contestation",
    stem: "A board member challenges your reserve caution: 'You're killing growth.' Best approach:",
    kind: "single",
    options: [
      { key: "A", text: "Soften the recommendation to maintain harmony" },
      { key: "B", text: "Restate decision declaratively, explain rationale and what new evidence would change it, assign accountable owners for next checkpoints" },
      { key: "C", text: "Escalate disagreement to HQ immediately" },
      { key: "D", text: "Avoid committing until everyone agrees" },
    ],
    whyPrompt: "What evidence would legitimately change your view?",
    exhibits: ["E3"],
  },
  {
    id: "Q11",
    topic: "Learning loop",
    stem: "You discover last year's motor remediation failed despite strong planning. Best CEO response:",
    kind: "single",
    options: [
      { key: "A", text: "Treat as bad luck; move on" },
      { key: "B", text: "Conduct structured post-mortem: which assumption failed, leading indicators missed, and process changes for next cycle" },
      { key: "C", text: "Replace the team" },
      { key: "D", text: "Stop writing plans" },
    ],
    whyPrompt: "Give one example of a leading indicator you would track next time.",
    exhibits: ["BRIEF"],
  },
  {
    id: "Q12",
    topic: "Related-party governance",
    stem: "If the bank partner is also a major shareholder in one market subsidiary, you should:",
    kind: "single",
    options: [
      { key: "A", text: "Treat their demands as non-negotiable" },
      { key: "B", text: "Run related-party transaction governance: independent committee review, document terms, protect minority shareholders" },
      { key: "C", text: "Hide the conflict to avoid tension" },
      { key: "D", text: "Move the deal to informal channels" },
    ],
    whyPrompt: "What governance safeguard would you implement immediately?",
    exhibits: ["E4"],
  },
];

export interface SectionCPrompt {
  id: "c1" | "c2" | "c3";
  label: string;
  description: string;
  maxWords: number;
  minChars: number;
}

export const sectionCPrompts: SectionCPrompt[] = [
  {
    id: "c1",
    label: "C1 — Board Paper Recommendation",
    description:
      "Provide your integrated recommendation across (a) the HK capital transfer request, (b) motor growth/reserving stance, and (c) the bancassurance renewal approach. Include **one explicit decision gate** and **one risk you are intentionally accepting**.",
    maxWords: 200,
    minChars: 80,
  },
  {
    id: "c2",
    label: "C2 — What would change your recommendation?",
    description:
      "List **three** data points (financial / regulatory / operational) that would cause you to materially revise your plan within the next 90 days.",
    maxWords: 120,
    minChars: 60,
  },
  {
    id: "c3",
    label: "C3 — Regulator + HQ dual-reporting script",
    description:
      "Draft two short scripts: (1) what you say to the **local regulator relationship team**, (2) what you say to **Group CFO/HQ** — to handle the capital pressure while maintaining governance credibility.",
    maxWords: 150,
    minChars: 80,
  },
];

export const TIMEZONES = [
  "Asia/Hong_Kong",
  "Asia/Singapore",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Asia/Kuala_Lumpur",
  "Asia/Jakarta",
  "Asia/Bangkok",
  "Asia/Manila",
  "Asia/Ho_Chi_Minh",
  "Australia/Sydney",
  "Asia/Kolkata",
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
];

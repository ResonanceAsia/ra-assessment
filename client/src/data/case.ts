// Case content for the Regional CEO (APAC) Composite Insurer assessment.
// Version 2 — May 2026.
// Reworked to (a) incorporate Paul Beresford's expert review (May 2026),
// and (b) tag each MCQ to the Resonance Asia 10-dimension Executive Decision
// Evaluation Rubric (v1.0, March 2026). Question bank focuses on D1, D4,
// D5 and D10 as primary dimensions; D3, D6 and D8 carried as secondaries.
// Do not re-randomise answer order without re-checking the scoring key.

export type ExhibitId = "E1" | "E2" | "E3" | "E4" | "BRIEF";

export type DimensionId =
  | "D1" // Decision Quality Under Ambiguity
  | "D2" // Decision Speed and Decisiveness
  | "D3" // Cognitive Bias Awareness and Mitigation
  | "D4" // Stakeholder and Risk Integration
  | "D5" // Decision Communication and Commitment
  | "D6" // Learning Orientation and Decision Review
  | "D7" // Hot/Cold Executive Function Balance
  | "D8" // Decision Architecture Process
  | "D9" // Derailer-to-Decision Mapping
  | "D10"; // APAC Regulatory and Cultural Decision Context

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
          note: "Provider contracting immature; not bank-distributed",
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
        { label: "ORSA filing", value: "**last filed Apr 2025** · next due in 11 months" },
        { label: "HQ ask (Indonesia growth)", value: "**USD 220m** capital transfer · 3-yr deployment" },
      ],
      footnote: "Current ORSA cycle is mid-year. The next formal stress refresh is not scheduled until Q4. HQ has asked for an answer in three weeks.",
    },
  },
  E3: {
    id: "E3",
    title: "P&C Motor Early Development",
    subtitle: "Current accident year · 6 months of experience",
    body: {
      kind: "keyValue",
      rows: [
        { label: "Paid loss ratio at 6 months", value: "**67%**" },
        { label: "Actuarial range — ultimate LR", value: "**78% – 95%**" },
        { label: "Base case ultimate LR", value: "**86%**" },
        { label: "Prior 3-yr UW estimate vs ultimate", value: "**−4 to −9 pts** (consistently optimistic)" },
        { label: "Reserving percentile (current)", value: "**75th** vs expected ultimate" },
      ],
      footnote: "Paid loss ratio is a leading-but-immature indicator; ultimate range is the binding constraint for reserving. Methodology is audited and calibrated to a target percentile relative to expected ultimate.",
    },
  },
  E4: {
    id: "E4",
    title: "Bancassurance Renewal",
    subtitle: "Life savings + retail P&C · 10-year term",
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
            { label: "Scope", value: "Life savings + retail motor/home (Health excluded)" },
          ],
        },
        {
          heading: "Internal estimate at proposed terms",
          tone: "warn",
          rows: [
            { label: "Life savings VNB margin (post-fee)", value: "drops from **32% → 19%**" },
            { label: "Retail P&C bank-distributed Combined Ratio", value: "could reach **108**" },
            { label: "Payback on upfront fee", value: "**6–8 yrs** depending on lapse" },
            { label: "Bank also holds", value: "**30% of our Indonesia subsidiary**" },
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
        "You have **three weeks** to present a board paper covering capital allocation, a bancassurance renewal, motor remediation, and earnings implications. Your board has 9 directors (3 independent, 2 IA-appointed observers, 4 group-nominated).",
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
4. near-term earnings implications under a tightening risk environment.

Your board has 9 directors (3 independent, 2 IA-appointed observers, 4 group-nominated).`,
};

export type SelectKind = "single" | "multi";

export interface MCQ {
  id: string; // Q1..Q11
  topic: string;
  stem: string;
  kind: SelectKind;
  multiMax?: number; // for kind === "multi"
  options: { key: "A" | "B" | "C" | "D" | "E"; text: string }[];
  whyPrompt: string;
  whyRequirement?: string; // explicit requirement shown beneath the prompt
  exhibits: ExhibitId[]; // exhibits to display alongside this question
  primaryDimension: DimensionId;
  secondaryDimensions?: DimensionId[];
}

export const mcqs: MCQ[] = [
  {
    id: "Q1",
    topic: "Capital redeployment — information you need first",
    stem: "Group HQ has asked you to transfer USD 220m from HK to fund Indonesia growth over three years (Exhibit 2). Before recommending anything to your board, which **information set** would you commission first?",
    kind: "single",
    options: [
      {
        key: "A",
        text: "3-yr HKRBC projection under base / adverse / severe scenarios; IA relationship team's view; current and projected Indonesia profitability range; chief actuary's view on HK loss-ratio trajectory",
      },
      {
        key: "B",
        text: "Year-end HKRBC ratio and HQ's preferred transfer amount; defer regulator engagement until the transfer is approved",
      },
      {
        key: "C",
        text: "Reinsurance market quotes to fund the transfer through capital relief; assume IA will accept anything above MCA",
      },
      {
        key: "D",
        text: "Legal opinion on whether the transfer is permitted at MCA; proceed if permitted",
      },
    ],
    whyPrompt:
      "Name the **two** scenarios under which you would recommend the board reject the transfer outright, and the **single** financial threshold that defines each.",
    whyRequirement:
      "Required: (1) one specific metric from Exhibit 2, (2) one explicit assumption you are making about Indonesia, and (3) one regulator-engagement step you would take before the board meeting.",
    exhibits: ["E2"],
    primaryDimension: "D1",
    secondaryDimensions: ["D10", "D4"],
  },
  {
    id: "Q2",
    topic: "Motor reserving — moving the percentile, not the point estimate",
    stem: "Your reserving methodology is audited and calibrated to a **75th-percentile** estimate relative to expected ultimate (Exhibit 3). Recent paid experience is favourable but immature. The board paper needs a single reserve number plus PBT/capital scenarios. What do you recommend? (select up to TWO)",
    kind: "multi",
    multiMax: 2,
    options: [
      {
        key: "A",
        text: "Hold the reserve at 75th percentile of the actuarial range; present PBT and capital under base (86%) and adverse (95%) ultimates; pause the 25% growth ask until next quarterly review",
      },
      {
        key: "B",
        text: "Allow +10% growth only in lowest-loss sub-segments; tie any further growth to a 90-day reserve-adequacy gate informed by underwriter-vs-ultimate history",
      },
      {
        key: "C",
        text: "Move the reserve to the 50th percentile to reflect the favourable paid experience; redirect the released capital to Indonesia",
      },
      {
        key: "D",
        text: "Approve +25% growth now; revisit reserve at year-end",
      },
    ],
    whyPrompt:
      "Which **single metric** in Exhibit 3 is most likely to mislead a non-technical board member, and how would you frame it instead?",
    whyRequirement:
      "Required: (1) name the metric, (2) state the assumption it tempts the reader to make, (3) state what evidence would justify moving the reserve percentile down (not just the point estimate).",
    exhibits: ["E3"],
    primaryDimension: "D1",
    secondaryDimensions: ["D3", "D5"],
  },
  {
    id: "Q3",
    topic: "Reading the segment economics",
    stem: "Restricting your attention to the **P&C Motor (SEA)** row in Exhibit 1, a combined ratio of 104 most directly implies:",
    kind: "single",
    options: [
      { key: "A", text: "Underwriting profit before investment income" },
      { key: "B", text: "Underwriting loss before investment income" },
      { key: "C", text: "Investment income is insufficient to cover claims" },
      { key: "D", text: "Reserve strengthening is required this quarter" },
    ],
    whyPrompt:
      "Name **two drivers** you would test first to diagnose whether the 104 is fixable inside 6–12 months, and the one driver you would deprioritise.",
    whyRequirement:
      "Required: (1) reference at least one figure from Exhibits 1 or 3, (2) name one assumption, (3) state what would cause you to escalate beyond a remediation plan.",
    exhibits: ["E1", "E3"],
    primaryDimension: "D1",
    secondaryDimensions: ["D4"],
  },
  {
    id: "Q4",
    topic: "Bancassurance — segmented economics and walk-away",
    stem: "Exhibit 4 sets out the bank's proposed 10-year exclusive renewal across life savings and retail P&C (health excluded). The bank also owns 30% of your Indonesia subsidiary. What is the most CEO-appropriate way to evaluate this proposal?",
    kind: "single",
    options: [
      {
        key: "A",
        text: "Decide on total group premium uplift across all lines",
      },
      {
        key: "B",
        text: "Segment economics separately for life savings and retail P&C; define a walk-away threshold on each; explore performance-linked fee tranches and scope limits; run independent related-party governance because the bank is a 30% shareholder in Indonesia",
      },
      {
        key: "C",
        text: "Accept; competitors are signing similar 10-year deals and the upfront fee is in market",
      },
      {
        key: "D",
        text: "Reject; exclusivity fees of this scale are always value-destructive",
      },
    ],
    whyPrompt:
      "Write your **one-sentence walk-away criterion** for each of the two segments (life savings and retail P&C). Each must include a financial metric and a time horizon.",
    whyRequirement:
      "Required: (1) one figure from Exhibit 4, (2) one explicit assumption about lapse or claims behaviour, (3) the related-party safeguard you would set up before signing.",
    exhibits: ["E4"],
    primaryDimension: "D4",
    secondaryDimensions: ["D1", "D10"],
  },
  {
    id: "Q5",
    topic: "Stakeholder prioritisation — who first, why, how",
    stem: "You arrive in week one. With only ~3 hours per week of unbooked time, which **three** stakeholder groups would you invest in 1:1 first, ahead of the three-week board paper?",
    kind: "single",
    options: [
      {
        key: "A",
        text: "The 3 independent directors + IA relationship team + chief actuary",
      },
      {
        key: "B",
        text: "Group CFO + the 4 group-nominated directors + bank counterparty",
      },
      {
        key: "C",
        text: "Customers + sales heads + brokers (revenue first)",
      },
      {
        key: "D",
        text: "The CRO + head of compliance + internal audit (risk first)",
      },
    ],
    whyPrompt:
      "Pick your option above and write the **exact opening question** you would ask each of the three groups in their first meeting. Keep each to one sentence.",
    whyRequirement:
      "Required: (1) name one piece of information you expect each group to surface that the formal pack will not, (2) state the second-order consequence if you skip any one of the three.",
    exhibits: ["BRIEF"],
    primaryDimension: "D4",
    secondaryDimensions: ["D10", "D5"],
  },
  {
    id: "Q6",
    topic: "Pre-clearing decisions — governance map under time pressure",
    stem: "Four decisions sit on your three-week runway: (i) 90-day motor pricing change, (ii) signing the 10-year exclusive banca agreement with USD 180m upfront, (iii) launching a 3-month claims-triage pilot, (iv) the HQ capital transfer ask. Which is most appropriate to treat as a **one-way door** AND what is the minimum governance you would pre-clear before tabling it?",
    kind: "single",
    options: [
      {
        key: "A",
        text: "(i) — pre-clear with chief actuary and pricing committee",
      },
      {
        key: "B",
        text: "(ii) — pre-clear with board risk committee, IA relationship team, related-party committee (bank owns 30% of Indonesia sub), and group legal — before any signal of intent to the bank",
      },
      {
        key: "C",
        text: "(iii) — pre-clear with COO and head of claims",
      },
      {
        key: "D",
        text: "(iv) — pre-clear with group CFO only; IA can be informed after transfer",
      },
    ],
    whyPrompt:
      "For the three decisions you did **not** mark as a one-way door, name the lightest-weight governance you would still apply to each. One line each.",
    whyRequirement:
      "Required: (1) one assumption you are making about how reversible each decision really is, (2) one change-condition that would make a reversible decision irreversible in practice.",
    exhibits: ["BRIEF", "E4"],
    primaryDimension: "D10",
    secondaryDimensions: ["D4", "D8"],
  },
  {
    id: "Q7",
    topic: "Bias interruption — anchoring on the underwriter's view",
    stem: "Your motor underwriting head argues: 'Paid LR is 67%, we are clearly profitable, approve growth.' Best response:",
    kind: "single",
    options: [
      { key: "A", text: "Approve; underwriting has local knowledge" },
      {
        key: "B",
        text: "Pull the **3-year history of this underwriter's own estimates vs ultimate** (Exhibit 3 shows −4 to −9 pts of optimism), ask for the ultimate-LR range and scenario-weighted expected value, articulate the downside in PBT and capital terms, and set a growth gate tied to reserve update",
      },
      { key: "C", text: "Defer to the actuary; no CEO view needed" },
      { key: "D", text: "Reject growth permanently; motor is structurally bad" },
    ],
    whyPrompt:
      "Name the **bias** in the underwriter's argument, your **countermeasure**, and the **change-condition** that would legitimately move you toward approving growth.",
    whyRequirement:
      "Required: (1) cite the underwriter-vs-ultimate history figure from Exhibit 3, (2) name one assumption you would force into the open, (3) state what you would say to the underwriter so they re-engage rather than disengage.",
    exhibits: ["E3"],
    primaryDimension: "D3",
    secondaryDimensions: ["D1", "D5"],
  },
  {
    id: "Q8",
    topic: "Sequencing under a counterparty clock",
    stem: "Capital is constrained. Three initiatives compete: motor remediation, banca renewal (bank wants signal of intent in 6 weeks or it goes to a competitor), health cost controls. What sequencing is best?",
    kind: "single",
    options: [
      {
        key: "A",
        text: "Fund all three simultaneously to show momentum",
      },
      {
        key: "B",
        text: "Prioritise the initiative with the highest short-term premium growth",
      },
      {
        key: "C",
        text: "Engage the IA in week 1 on solvency expectations; in parallel, scope the banca walk-away within the bank's 6-week clock; sequence motor remediation behind the regulator answer because it determines capital headroom for growth; defer health cost controls to a Q+1 workstream",
      },
      {
        key: "D",
        text: "Freeze investment until volatility subsides",
      },
    ],
    whyPrompt:
      "What single **KPI** would you use as a go/no-go gate before committing capital to any growth initiative — and why this KPI rather than premium growth?",
    whyRequirement:
      "Required: (1) reference one figure from Exhibits 1 or 2, (2) state one assumption about IA appetite, (3) name a counterparty action that would force you to break the sequence.",
    exhibits: ["E1", "E2"],
    primaryDimension: "D10",
    secondaryDimensions: ["D4", "D8"],
  },
  {
    id: "Q9",
    topic: "Board relationship building under limited time",
    stem: "Your board has 9 directors (3 independent, 2 IA-appointed observers, 4 group-nominated). You cannot have a deep 1:1 with all 9 before the three-week paper. Which **three** would you invest in first, and what is the biggest risk if you read the other six as 'no objection = alignment'?",
    kind: "single",
    options: [
      {
        key: "A",
        text: "The 4 group-nominated directors; risk is HQ surprise",
      },
      {
        key: "B",
        text: "The independent director chairing the risk committee + the IA-appointed observer most active on capital + the group-nominated director closest to the bank counterparty; risk of silent dissent leading to later reversal or passive resistance in execution",
      },
      {
        key: "C",
        text: "Whichever directors respond fastest to email; risk is none",
      },
      {
        key: "D",
        text: "None; treat the board as a single audience to manage on the day",
      },
    ],
    whyPrompt:
      "Write the **exact question** you would ask in the boardroom to surface silent dissent on the capital transfer recommendation. Keep it under 25 words.",
    whyRequirement:
      "Required: (1) one second-order consequence of misreading silence as alignment, (2) one face-saving framing you would use, (3) one signal you would treat as evidence of genuine alignment vs polite silence.",
    exhibits: ["BRIEF"],
    primaryDimension: "D10",
    secondaryDimensions: ["D5", "D4"],
  },
  {
    id: "Q10",
    topic: "Holding a position under board challenge",
    stem: "A board member challenges your reserve caution: 'You're killing growth.' Best approach:",
    kind: "single",
    options: [
      { key: "A", text: "Soften the recommendation to maintain harmony" },
      {
        key: "B",
        text: "Restate the decision declaratively, anchor on the audited reserving methodology and the 75th-percentile calibration, name the new evidence that would change your view, and assign accountable owners for next checkpoints",
      },
      { key: "C", text: "Escalate disagreement to HQ immediately" },
      { key: "D", text: "Avoid committing until everyone agrees" },
      {
        key: "E",
        text: "Hold the position in the room and propose an offline session — facilitated by you, attended by the chief actuary and the challenging director — to walk through the methodology before the next meeting",
      },
    ],
    whyPrompt:
      "What is the **single piece of evidence** that would legitimately move you to release reserves — and how would you tell the difference between that evidence arriving and social pressure to soften?",
    whyRequirement:
      "Required: (1) name the evidence (must be quantitative, not directional), (2) one assumption behind your current position, (3) the chief actuary's role in the offline session.",
    exhibits: ["E3"],
    primaryDimension: "D5",
    secondaryDimensions: ["D3", "D1"],
  },
  {
    id: "Q11",
    topic: "Learning loop — what the CEO owns vs the actuary owns",
    stem: "You discover last year's motor remediation failed: the loss ratio is back where it started despite a detailed remediation plan. Best CEO response:",
    kind: "single",
    options: [
      { key: "A", text: "Treat as bad luck; move on" },
      {
        key: "B",
        text: "Require the chief actuary to run a structured assumption-failure review (which assumption broke, what leading indicator was missed, what changes in development factor selection or pricing model are required) — and hold the CEO-owned questions to: governance gaps, sponsorship gaps, and whether the team has the capability to execute the next attempt",
      },
      { key: "C", text: "Replace the underwriting team" },
      { key: "D", text: "Stop writing remediation plans" },
    ],
    whyPrompt:
      "Name **one leading indicator** you would have tracked monthly to catch the failure earlier, and the **decision threshold** that would have triggered escalation to you.",
    whyRequirement:
      "Required: (1) one figure from Exhibit 1 or 3, (2) what the chief actuary should have surfaced unprompted, (3) what action you would have taken at the threshold.",
    exhibits: ["E1", "E3"],
    primaryDimension: "D6",
    secondaryDimensions: ["D4", "D5"],
  },
];

export interface SectionCPrompt {
  id: "c1" | "c2" | "c3";
  label: string;
  description: string;
  maxWords: number;
  minChars: number;
  subSections?: { heading: string; guidance: string }[];
}

export const sectionCPrompts: SectionCPrompt[] = [
  {
    id: "c1",
    label: "C1 — Capital section of the board paper",
    description:
      "Draft the **Capital Allocation** section of your three-week board paper, responding to HQ's USD 220m capital transfer ask. Write it as if it will appear verbatim in the board pack: a recommendation, the assumptions it rests on, the risks you are intentionally accepting, and the monitoring metrics you commit to.",
    subSections: [
      {
        heading: "Recommendation",
        guidance:
          "One declarative sentence: do you support the transfer, support a phased/conditional transfer, or recommend no transfer. State the headline number.",
      },
      {
        heading: "Key assumptions",
        guidance:
          "Three bullets, each naming the assumption and its current value (e.g., HKRBC base-case projected ratio, Indonesia 3-yr ROE, IA's informal 120% floor).",
      },
      {
        heading: "Risks intentionally accepted",
        guidance:
          "Two bullets — risks you are knowingly carrying as part of this recommendation, with the change-condition that would force you to revisit.",
      },
      {
        heading: "Monitoring metrics",
        guidance:
          "Three bullets — the leading indicators you will report to the board quarterly, with the threshold that would trigger an intra-quarter escalation.",
      },
    ],
    maxWords: 220,
    minChars: 200,
  },
  {
    id: "c2",
    label: "C2 — Motor & Bancassurance section of the board paper",
    description:
      "Draft a combined **Motor remediation + Bancassurance renewal** section. The board will read these together because both compete for capital and management bandwidth. Cover each in turn under the same four headings as C1 — recommendation, key assumptions, risks accepted, monitoring metrics.",
    subSections: [
      {
        heading: "Motor — recommendation, assumptions, risks accepted, monitoring",
        guidance:
          "Cover the four headings in four short paragraphs or grouped bullets. Reference the 75th-percentile reserving calibration and the underwriter-vs-ultimate history.",
      },
      {
        heading: "Bancassurance — recommendation, assumptions, risks accepted, monitoring",
        guidance:
          "Cover the four headings, segment economics separately for life savings and retail P&C, and state explicitly how you will handle the related-party governance because the bank owns 30% of the Indonesia subsidiary.",
      },
    ],
    maxWords: 320,
    minChars: 240,
  },
  {
    id: "c3",
    label: "C3 — Regulator + Group CFO talking points",
    description:
      "Draft **bullet-point talking points** (not full scripts) for two conversations to be held in week 1: (1) with the **IA relationship team** to flag the HQ capital ask before the board paper lands, and (2) with the **Group CFO** to position your recommendation. Lead each bullet with the message; do not narrate.",
    subSections: [
      {
        heading: "IA relationship team — 4–6 bullets",
        guidance:
          "Lead with your read of HKRBC headroom, the HQ ask, and what you are asking from the IA (informal view / no surprises). One bullet on what you commit to share back.",
      },
      {
        heading: "Group CFO — 4–6 bullets",
        guidance:
          "Lead with the commercial logic you accept, the constraint you cannot move (regulatory headroom), the structure you would support (e.g., phased transfer, conditional on metric), and the date you commit to a board recommendation.",
      },
    ],
    maxWords: 240,
    minChars: 180,
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

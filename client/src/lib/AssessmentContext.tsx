import { createContext, useContext, useState, type ReactNode } from "react";

export interface CandidateDetails {
  client: string;
  role: string;
  candidateName: string;
  candidateEmail: string;
  candidateMobile: string;
  timezone: string;
  proctor: string;
  attestation: boolean;
}

export type SectionBAnswer = {
  qId: string;
  choice: string | string[];
  why: string;
};

export interface SectionCAnswers {
  c1: string;
  c2: string;
  c3: string;
}

export interface AssessmentState {
  candidate: CandidateDetails;
  sectionB: Record<string, SectionBAnswer>;
  sectionC: SectionCAnswers;
}

const blank: AssessmentState = {
  candidate: {
    client: "",
    role: "Regional CEO (APAC) — Composite Insurer",
    candidateName: "",
    candidateEmail: "",
    candidateMobile: "",
    timezone: "Asia/Hong_Kong",
    proctor: "",
    attestation: false,
  },
  sectionB: {},
  sectionC: { c1: "", c2: "", c3: "" },
};

interface Ctx {
  state: AssessmentState;
  setCandidate: (c: CandidateDetails) => void;
  setSectionBAnswer: (a: SectionBAnswer) => void;
  setSectionC: (c: SectionCAnswers) => void;
  reset: () => void;
}

const AssessmentContext = createContext<Ctx | null>(null);

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AssessmentState>(blank);

  const setCandidate = (candidate: CandidateDetails) =>
    setState((s) => ({ ...s, candidate }));

  const setSectionBAnswer = (a: SectionBAnswer) =>
    setState((s) => ({ ...s, sectionB: { ...s.sectionB, [a.qId]: a } }));

  const setSectionC = (sectionC: SectionCAnswers) =>
    setState((s) => ({ ...s, sectionC }));

  const reset = () => setState(blank);

  return (
    <AssessmentContext.Provider
      value={{ state, setCandidate, setSectionBAnswer, setSectionC, reset }}
    >
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const ctx = useContext(AssessmentContext);
  if (!ctx) throw new Error("useAssessment must be used inside AssessmentProvider");
  return ctx;
}

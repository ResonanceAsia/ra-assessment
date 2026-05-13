import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export const TIMER_DURATION_SECONDS = 45 * 60;

export interface CandidateDetails {
  client: string;
  role: string;
  candidateName: string;
  candidateSurname: string;
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

export interface InviteMeta {
  token: string;
  candidateName: string;
  candidateEmail: string;
  role: string;
  client: string;
  proctor: string;
  expiresAt: string;
}

export interface AssessmentState {
  candidate: CandidateDetails;
  sectionB: Record<string, SectionBAnswer>;
  sectionC: SectionCAnswers;
  /** ISO timestamp when the candidate first opened Section B; null until then. */
  timerStartedAt: string | null;
  /** ISO timestamp when the candidate clicked Submit; null until then. */
  timerSubmittedAt: string | null;
  /** Invite metadata when the candidate arrived via an admin-generated link. */
  invite: InviteMeta | null;
}

const blank: AssessmentState = {
  candidate: {
    client: "",
    role: "",
    candidateName: "",
    candidateSurname: "",
    candidateEmail: "",
    candidateMobile: "",
    timezone: "",
    proctor: "",
    // No-AI confirmation is recorded server-side; the candidate-facing form
    // no longer asks for an explicit tick-box.
    attestation: true,
  },
  sectionB: {},
  sectionC: { c1: "", c2: "", c3: "" },
  timerStartedAt: null,
  timerSubmittedAt: null,
  invite: null,
};

interface Ctx {
  state: AssessmentState;
  setCandidate: (c: CandidateDetails) => void;
  setSectionBAnswer: (a: SectionBAnswer) => void;
  setSectionC: (c: SectionCAnswers) => void;
  /** Called the first time the candidate opens Section B. Idempotent. */
  startTimerIfNeeded: () => void;
  /** Called when the candidate submits. */
  markTimerSubmitted: () => void;
  /** Live elapsed seconds since the timer started; 0 before start, frozen at submit. */
  elapsedSeconds: number;
  /** Apply an invite — stores metadata and pre-fills locked candidate fields. */
  applyInvite: (invite: InviteMeta) => void;
  reset: () => void;
}

const AssessmentContext = createContext<Ctx | null>(null);

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AssessmentState>(blank);
  const [now, setNow] = useState(() => Date.now());

  // Tick once a second only while the timer is running and not yet submitted.
  useEffect(() => {
    if (!state.timerStartedAt || state.timerSubmittedAt) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [state.timerStartedAt, state.timerSubmittedAt]);

  const elapsedSeconds = (() => {
    if (!state.timerStartedAt) return 0;
    const start = new Date(state.timerStartedAt).getTime();
    const end = state.timerSubmittedAt
      ? new Date(state.timerSubmittedAt).getTime()
      : now;
    return Math.max(0, Math.floor((end - start) / 1000));
  })();

  const setCandidate = (candidate: CandidateDetails) =>
    setState((s) => ({ ...s, candidate }));

  const applyInvite = (invite: InviteMeta) => {
    // The invite carries one "candidateName" string from the admin form.
    // Split it into first / surname on the last space so the candidate form
    // can pre-fill both fields. If there is no space, treat the whole value
    // as the first name and leave surname empty for the candidate to fill.
    const full = (invite.candidateName ?? "").trim();
    const lastSpace = full.lastIndexOf(" ");
    const first = lastSpace > 0 ? full.slice(0, lastSpace).trim() : full;
    const surname = lastSpace > 0 ? full.slice(lastSpace + 1).trim() : "";
    setState((s) => ({
      ...s,
      invite,
      candidate: {
        ...s.candidate,
        candidateName: first,
        candidateSurname: surname,
        candidateEmail: invite.candidateEmail,
        role: invite.role,
        client: invite.client,
        proctor: invite.proctor || s.candidate.proctor,
      },
    }));
  };

  const setSectionBAnswer = (a: SectionBAnswer) =>
    setState((s) => ({ ...s, sectionB: { ...s.sectionB, [a.qId]: a } }));

  const setSectionC = (sectionC: SectionCAnswers) =>
    setState((s) => ({ ...s, sectionC }));

  const startTimerIfNeeded = () =>
    setState((s) =>
      s.timerStartedAt ? s : { ...s, timerStartedAt: new Date().toISOString() }
    );

  const markTimerSubmitted = () =>
    setState((s) =>
      s.timerSubmittedAt ? s : { ...s, timerSubmittedAt: new Date().toISOString() }
    );

  const reset = () => setState(blank);

  return (
    <AssessmentContext.Provider
      value={{
        state,
        setCandidate,
        setSectionBAnswer,
        setSectionC,
        startTimerIfNeeded,
        markTimerSubmitted,
        elapsedSeconds,
        applyInvite,
        reset,
      }}
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

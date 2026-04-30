import { useAssessment, TIMER_DURATION_SECONDS } from "@/lib/AssessmentContext";

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

/**
 * Persistent timer chip shown in the shell header on Sections B and C.
 * Starts at 0 once the candidate enters Section B; counts up; turns amber
 * once 75% of the budget is gone, red once over budget. Never auto-submits
 * — judgement under pressure is part of the exercise.
 */
export function TimerBadge() {
  const { state, elapsedSeconds } = useAssessment();
  // Hide once not started yet (Welcome / Details / Section A) or after submit (Done).
  if (!state.timerStartedAt || state.timerSubmittedAt) return null;

  const remaining = Math.max(0, TIMER_DURATION_SECONDS - elapsedSeconds);
  const overBudget = elapsedSeconds >= TIMER_DURATION_SECONDS;
  const warn = !overBudget && elapsedSeconds >= TIMER_DURATION_SECONDS * 0.75;

  // Choose color treatment for the chip's interior label.
  const tone = overBudget
    ? "bg-destructive/15 border-destructive/40 text-destructive"
    : warn
    ? "bg-amber-400/15 border-amber-400/50 text-amber-200"
    : "bg-white/10 border-white/20 text-white";

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md border text-xs font-medium ${tone}`}
      data-testid="timer-badge"
      aria-label={
        overBudget
          ? `Time elapsed ${fmt(elapsedSeconds)} (over the 45-minute budget)`
          : `Time remaining ${fmt(remaining)}`
      }
    >
      <svg
        viewBox="0 0 24 24"
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2 2" />
        <path d="M9 2h6" />
      </svg>
      {overBudget ? (
        <span data-testid="timer-overbudget">
          <span className="opacity-70 font-normal mr-1">Over by</span>
          <span className="tabular-nums">{fmt(elapsedSeconds - TIMER_DURATION_SECONDS)}</span>
        </span>
      ) : (
        <span>
          <span className="opacity-70 font-normal mr-1">Time left</span>
          <span className="tabular-nums" data-testid="timer-remaining">
            {fmt(remaining)}
          </span>
        </span>
      )}
    </div>
  );
}

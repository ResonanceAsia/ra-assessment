import { useState, useMemo, useEffect, type ReactNode } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AssessmentShell } from "@/components/AssessmentShell";
import { ExhibitCard } from "@/components/ExhibitCard";
import { mcqs, exhibits, type MCQ } from "@/data/case";
import { useAssessment } from "@/lib/AssessmentContext";

const MIN_WHY = 60;

// Tiny inline-markdown renderer: turns **word** into <strong>word</strong>.
// Leaves all other text as plain. Safe — splits on the literal asterisk pairs.
function renderInlineMd(text: string): ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} className="font-semibold text-foreground">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default function SectionB() {
  const [, setLocation] = useLocation();
  const { state, setSectionBAnswer, startTimerIfNeeded } = useAssessment();

  // Start the 45-minute clock the first time Section B mounts.
  useEffect(() => {
    startTimerIfNeeded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [idx, setIdx] = useState(() => {
    // resume on first unanswered
    const firstMissing = mcqs.findIndex((q) => !state.sectionB[q.id]);
    return firstMissing === -1 ? 0 : firstMissing;
  });
  const [error, setError] = useState<string | null>(null);

  const q = mcqs[idx];
  const existing = state.sectionB[q.id];
  const [choice, setChoice] = useState<string | string[]>(
    existing?.choice ?? (q.kind === "multi" ? [] : "")
  );
  const [why, setWhy] = useState<string>(existing?.why ?? "");

  const exhibitObjs = useMemo(
    () => q.exhibits.map((id) => exhibits[id]).filter(Boolean),
    [q]
  );

  const reset = (next: MCQ) => {
    const cur = state.sectionB[next.id];
    setChoice(cur?.choice ?? (next.kind === "multi" ? [] : ""));
    setWhy(cur?.why ?? "");
    setError(null);
  };

  const goTo = (n: number) => {
    setIdx(n);
    reset(mcqs[n]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const validateAndSave = (): boolean => {
    if (q.kind === "single" && !choice) {
      setError("Pick one option to continue.");
      return false;
    }
    if (q.kind === "multi") {
      const arr = choice as string[];
      if (arr.length === 0) {
        setError("Pick at least one option (up to two).");
        return false;
      }
      if (arr.length > (q.multiMax ?? 2)) {
        setError(`Pick no more than ${q.multiMax ?? 2}.`);
        return false;
      }
    }
    if (why.trim().length < MIN_WHY) {
      setError(`Rationale must be at least ${MIN_WHY} characters (you have ${why.trim().length}).`);
      return false;
    }
    setSectionBAnswer({ qId: q.id, choice, why: why.trim() });
    setError(null);
    return true;
  };

  const onNext = () => {
    if (!validateAndSave()) return;
    if (idx === mcqs.length - 1) {
      setLocation("/section-c");
    } else {
      goTo(idx + 1);
    }
  };

  const onPrev = () => {
    // save current draft if valid-ish (don't block backward navigation)
    if (q.kind === "single" ? !!choice : (choice as string[]).length > 0 || why.length >= MIN_WHY) {
      // best-effort save (allow incomplete)
      setSectionBAnswer({ qId: q.id, choice, why });
    }
    if (idx === 0) setLocation("/section-a");
    else goTo(idx - 1);
  };

  const toggleMulti = (key: string) => {
    const arr = (choice as string[]) || [];
    const max = q.multiMax ?? 2;
    if (arr.includes(key)) {
      setChoice(arr.filter((k) => k !== key));
    } else if (arr.length < max) {
      setChoice([...arr, key]);
    }
  };

  return (
    <AssessmentShell step={3}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-baseline justify-between mb-1">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent">
            Section B · Question {idx + 1} of {mcqs.length}
          </div>
          <div className="text-xs text-muted-foreground">{q.topic}</div>
        </div>

        {/* Question nav */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {mcqs.map((m, i) => {
            const answered = !!state.sectionB[m.id];
            const isCurrent = i === idx;
            return (
              <button
                key={m.id}
                onClick={() => {
                  if (i !== idx) {
                    // save draft and jump
                    setSectionBAnswer({ qId: q.id, choice, why });
                    goTo(i);
                  }
                }}
                className={[
                  "h-7 w-7 rounded text-[11px] font-semibold transition-colors",
                  isCurrent
                    ? "bg-primary text-primary-foreground"
                    : answered
                    ? "bg-accent/20 text-foreground border border-accent/40"
                    : "bg-muted text-muted-foreground border border-transparent",
                ].join(" ")}
                data-testid={`button-jump-${m.id}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {/* Exhibit(s) for this question */}
        {exhibitObjs.length > 0 && (
          <details className="mb-4 ra-card-elevated rounded-lg overflow-hidden" open>
            <summary className="cursor-pointer select-none px-4 py-3 text-sm font-semibold text-foreground bg-muted/50 hover-elevate">
              📊 Relevant exhibit{exhibitObjs.length > 1 ? "s" : ""}: {q.exhibits.join(", ")}
            </summary>
            <div className={`p-4 grid gap-4 ${exhibitObjs.length === 1 ? "" : "sm:grid-cols-2"}`}>
              {exhibitObjs.map((ex) => (
                <ExhibitCard key={ex.id} exhibit={ex} compact />
              ))}
            </div>
          </details>
        )}

        {/* Question block — stem in its own card, normal weight, only **bold** spans rendered bold */}
        <div className="ra-card-elevated rounded-lg p-4 sm:p-5 mb-5">
          <h1 className="text-lg font-normal text-foreground/90 leading-relaxed">
            {renderInlineMd(q.stem)}
          </h1>
          {q.kind === "multi" && (
            <p className="text-xs text-accent font-medium mt-3">
              Multi-select: pick up to {q.multiMax ?? 2} options.
            </p>
          )}
        </div>

        {/* Options */}
        <div className="space-y-2 mb-6">
          {q.options.map((opt) => {
            const selected =
              q.kind === "single"
                ? choice === opt.key
                : (choice as string[]).includes(opt.key);
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => {
                  if (q.kind === "single") setChoice(opt.key);
                  else toggleMulti(opt.key);
                }}
                className={[
                  "w-full text-left rounded-lg border p-4 transition-colors",
                  selected
                    ? "border-accent bg-accent/8 ring-2 ring-accent/40"
                    : "border-card-border bg-card hover-elevate",
                ].join(" ")}
                data-testid={`option-${q.id}-${opt.key}`}
              >
                <div className="flex gap-3">
                  <div
                    className={[
                      "h-6 w-6 flex-shrink-0 flex items-center justify-center text-xs font-bold",
                      q.kind === "single" ? "rounded-full" : "rounded-md",
                      selected
                        ? "bg-accent text-accent-foreground"
                        : "bg-muted text-muted-foreground border border-border",
                    ].join(" ")}
                  >
                    {opt.key}
                  </div>
                  <div className="text-sm text-foreground/90 leading-relaxed pt-0.5">
                    {renderInlineMd(opt.text)}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Mandatory rationale */}
        <div className="ra-card-elevated rounded-lg p-4 sm:p-5 mb-6 border-l-4 border-l-accent">
          <label
            htmlFor={`why-${q.id}`}
            className="block font-semibold text-foreground mb-1"
          >
            Your rationale <span className="text-destructive">*</span>
          </label>
          <p className="text-xs text-muted-foreground mb-2">{renderInlineMd(q.whyPrompt)}</p>
          <p className="text-xs text-foreground/70 mb-3">
            <strong className="text-accent">Required:</strong> include (1) a specific metric from
            the exhibits, (2) an explicit assumption or uncertainty, and (3) a change-condition.
          </p>
          <Textarea
            id={`why-${q.id}`}
            value={why}
            onChange={(e) => setWhy(e.target.value)}
            placeholder="e.g. Combined ratio of 104 (E1) implies underwriting loss; I am assuming claims inflation persists at current rate; my view changes if the 12-month motor ultimate range narrows below 85%..."
            rows={5}
            className="font-sans"
            data-testid={`textarea-why-${q.id}`}
          />
          <div className="mt-2 flex items-center justify-between text-xs">
            <span
              className={
                why.trim().length < MIN_WHY ? "text-destructive" : "text-muted-foreground"
              }
            >
              {why.trim().length} / {MIN_WHY} min characters
            </span>
            <span className="text-muted-foreground">
              {why.trim().split(/\s+/).filter(Boolean).length} words
            </span>
          </div>
        </div>

        {error && (
          <div
            className="mb-4 rounded-md bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive"
            data-testid="text-error"
          >
            {error}
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between gap-3 items-stretch sm:items-center">
          <Button variant="ghost" onClick={onPrev} data-testid="button-prev">
            ← Previous
          </Button>
          <Button
            size="lg"
            className="bg-primary text-primary-foreground"
            onClick={onNext}
            data-testid="button-next"
          >
            {idx === mcqs.length - 1 ? "Continue to Section C →" : "Next question →"}
          </Button>
        </div>
      </div>
    </AssessmentShell>
  );
}

import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AssessmentShell } from "@/components/AssessmentShell";
import { sectionCPrompts } from "@/data/case";
import { useAssessment } from "@/lib/AssessmentContext";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { inline } from "@/lib/md";

const wordCount = (s: string) => s.trim().split(/\s+/).filter(Boolean).length;

export default function SectionC() {
  const [, setLocation] = useLocation();
  const { state, setSectionC, markTimerSubmitted, elapsedSeconds } = useAssessment();
  const { toast } = useToast();
  const [answers, setAnswers] = useState(state.sectionC);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = useMutation({
    mutationFn: async () => {
      const sectionB = Object.values(state.sectionB);
      const payload = {
        ...state.candidate,
        attestation: true as const,
        sectionB,
        sectionC: answers,
        timerStartedAt: state.timerStartedAt,
        elapsedSeconds,
        ...(state.invite ? { inviteToken: state.invite.token } : {}),
      };
      const res = await apiRequest("POST", "/api/submissions", payload);
      return await res.json();
    },
    onSuccess: (data: { id: string; emailStatus: string; downloadToken: string }) => {
      setSectionC(answers);
      markTimerSubmitted();
      sessionState.lastId = data.id;
      sessionState.lastEmailStatus = data.emailStatus;
      sessionState.lastDownloadToken = data.downloadToken;
      sessionState.lastElapsedSeconds = elapsedSeconds;
      setLocation("/done");
    },
    onError: (err: Error) => {
      toast({
        title: "Submission failed",
        description: err.message,
        variant: "destructive",
      });
    },
  });

  const validate = () => {
    const e: Record<string, string> = {};
    sectionCPrompts.forEach((p) => {
      const v = answers[p.id];
      if (v.trim().length < p.minChars) {
        e[p.id] = `At least ${p.minChars} characters required.`;
      } else if (wordCount(v) > p.maxWords) {
        e[p.id] = `Limit is ${p.maxWords} words; you have ${wordCount(v)}.`;
      }
    });
    // sanity-check Section B is fully complete
    if (Object.keys(state.sectionB).length < 12) {
      e._sectionB = "You have not completed all 12 MCQs.";
    }
    if (!state.candidate.candidateName) {
      e._cand = "Candidate details are missing — please return to the start.";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = () => {
    if (!validate()) return;
    setSectionC(answers);
    submit.mutate();
  };

  return (
    <AssessmentShell step={4}>
      <div className="max-w-3xl mx-auto">
        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent mb-2">
          Section C · Written Responses
        </div>
        <h1 className="text-xl font-semibold text-foreground mb-2">Three short prompts</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Tight, declarative prose. Word counts shown live. Quotes count as words.
        </p>

        <div className="space-y-6">
          {sectionCPrompts.map((p) => {
            const v = answers[p.id];
            const wc = wordCount(v);
            const overWord = wc > p.maxWords;
            const tooShort = v.trim().length < p.minChars && v.length > 0;
            return (
              <div key={p.id} className="ra-card-elevated rounded-lg p-5">
                <label
                  htmlFor={`c-${p.id}`}
                  className="block font-semibold text-foreground mb-1"
                >
                  {p.label}
                </label>
                <p
                  className="text-xs text-muted-foreground mb-3"
                  dangerouslySetInnerHTML={{ __html: inline(p.description) }}
                />
                <Textarea
                  id={`c-${p.id}`}
                  value={v}
                  onChange={(e) =>
                    setAnswers((a) => ({ ...a, [p.id]: e.target.value }))
                  }
                  rows={p.id === "c1" ? 8 : 6}
                  className="font-sans"
                  data-testid={`textarea-${p.id}`}
                />
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span
                    className={
                      tooShort ? "text-destructive" : "text-muted-foreground"
                    }
                  >
                    {v.trim().length} chars (min {p.minChars})
                  </span>
                  <span
                    className={
                      overWord ? "text-destructive font-medium" : "text-muted-foreground"
                    }
                  >
                    {wc} / {p.maxWords} words
                  </span>
                </div>
                {errors[p.id] && (
                  <p className="text-xs text-destructive mt-1">{errors[p.id]}</p>
                )}
              </div>
            );
          })}
        </div>

        {(errors._sectionB || errors._cand) && (
          <div className="mt-6 rounded-md bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
            {errors._cand || errors._sectionB}
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
          <Button
            variant="ghost"
            onClick={() => setLocation("/section-b")}
            data-testid="button-back-to-b"
            disabled={submit.isPending}
          >
            ← Back to Section B
          </Button>
          <Button
            size="lg"
            className="bg-primary text-primary-foreground"
            onClick={onSubmit}
            disabled={submit.isPending}
            data-testid="button-submit"
          >
            {submit.isPending ? "Submitting…" : "Submit assessment →"}
          </Button>
        </div>
      </div>
    </AssessmentShell>
  );
}

// Tiny non-storage in-memory bridge to the Done page (works inside the
// session but not across reloads — adequate for a same-session submit flow).
export const sessionState: {
  lastId?: string;
  lastEmailStatus?: string;
  lastDownloadToken?: string;
  lastElapsedSeconds?: number;
} = {};

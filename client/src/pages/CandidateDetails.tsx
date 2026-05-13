import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AssessmentShell } from "@/components/AssessmentShell";
import { useAssessment } from "@/lib/AssessmentContext";

// The candidate-facing form deliberately asks for only three things:
// first name, surname, and email. Client / role / proctor are filled in
// server-side from the admin invite when one is used; otherwise they
// remain blank and are tagged later in the admin view.
export default function CandidateDetails() {
  const [, setLocation] = useLocation();
  const { state, setCandidate } = useAssessment();
  const [form, setForm] = useState(state.candidate);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const invite = state.invite;

  // When the candidate arrived via an invite we already know their name
  // (the admin entered it). Lock those fields so they cannot be edited.
  const isLocked = (key: "candidateName" | "candidateEmail") => {
    if (!invite) return false;
    return true;
  };

  const update = (k: keyof typeof form, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v as never }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.candidateName.trim().length < 1) e.candidateName = "Required";
    if (form.candidateSurname.trim().length < 1) e.candidateSurname = "Required";
    if (!/^\S+@\S+\.\S+$/.test(form.candidateEmail)) e.candidateEmail = "Valid email required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onContinue = () => {
    if (!validate()) return;
    setCandidate(form);
    setLocation("/section-a");
  };

  return (
    <AssessmentShell step={1}>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-xl font-semibold text-foreground mb-2">Candidate Details</h1>
        <p className="text-sm text-muted-foreground mb-8">
          We use these details to label your submission to the Resonance Asia assessor team. Your
          email is used only for follow-up.
        </p>

        <div className="grid gap-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field
              label="First name"
              id="candidateName"
              error={errors.candidateName}
              locked={isLocked("candidateName")}
            >
              <Input
                id="candidateName"
                value={form.candidateName}
                onChange={(e) => update("candidateName", e.target.value)}
                disabled={isLocked("candidateName")}
                data-testid="input-candidate-name"
                autoComplete="given-name"
              />
            </Field>
            <Field
              label="Surname"
              id="candidateSurname"
              error={errors.candidateSurname}
              locked={isLocked("candidateName")}
            >
              <Input
                id="candidateSurname"
                value={form.candidateSurname}
                onChange={(e) => update("candidateSurname", e.target.value)}
                disabled={isLocked("candidateName")}
                data-testid="input-candidate-surname"
                autoComplete="family-name"
              />
            </Field>
          </div>

          <Field
            label="Email"
            id="candidateEmail"
            error={errors.candidateEmail}
            locked={isLocked("candidateEmail")}
          >
            <Input
              id="candidateEmail"
              type="email"
              value={form.candidateEmail}
              onChange={(e) => update("candidateEmail", e.target.value)}
              disabled={isLocked("candidateEmail")}
              data-testid="input-candidate-email"
              autoComplete="email"
            />
          </Field>
        </div>

        <div className="mt-8 flex justify-between items-center">
          <Button variant="ghost" onClick={() => setLocation("/")} data-testid="button-back">
            ← Back
          </Button>
          <Button
            size="lg"
            className="bg-primary text-primary-foreground"
            onClick={onContinue}
            data-testid="button-continue-to-section-a"
          >
            Continue to Section A →
          </Button>
        </div>
      </div>
    </AssessmentShell>
  );
}

function Field({
  label,
  id,
  error,
  locked,
  children,
}: {
  label: string;
  id?: string;
  error?: string;
  locked?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <Label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
        </Label>
        {locked && (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-accent/10 text-accent border border-accent/20">
            Pre-filled
          </span>
        )}
      </div>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AssessmentShell } from "@/components/AssessmentShell";
import { useAssessment } from "@/lib/AssessmentContext";
import { TIMEZONES } from "@/data/case";

export default function CandidateDetails() {
  const [, setLocation] = useLocation();
  const { state, setCandidate } = useAssessment();
  const [form, setForm] = useState(state.candidate);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const invite = state.invite;
  const isLocked = (key: "client" | "role" | "candidateName" | "candidateEmail" | "proctor") => {
    if (!invite) return false;
    if (key === "proctor") return invite.proctor.length > 0;
    return true;
  };

  const update = (k: keyof typeof form, v: string | boolean) =>
    setForm((f) => ({ ...f, [k]: v as never }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.client.trim()) e.client = "Required";
    if (!form.role.trim()) e.role = "Required";
    if (form.candidateName.trim().length < 2) e.candidateName = "Required";
    if (!/^\S+@\S+\.\S+$/.test(form.candidateEmail)) e.candidateEmail = "Valid email required";
    if (form.candidateMobile.trim().length < 5) e.candidateMobile = "Required";
    if (!form.attestation) e.attestation = "You must agree to the attestation";
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
            <Field label="Client" id="client" error={errors.client} locked={isLocked("client")}>
              <Input
                id="client"
                placeholder="e.g. Aurora Composite Insurance Group"
                value={form.client}
                onChange={(e) => update("client", e.target.value)}
                disabled={isLocked("client")}
                data-testid="input-client"
              />
            </Field>
            <Field label="Role being assessed for" id="role" error={errors.role} locked={isLocked("role")}>
              <Input
                id="role"
                value={form.role}
                onChange={(e) => update("role", e.target.value)}
                disabled={isLocked("role")}
                data-testid="input-role"
              />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Your full name" id="candidateName" error={errors.candidateName} locked={isLocked("candidateName")}>
              <Input
                id="candidateName"
                value={form.candidateName}
                onChange={(e) => update("candidateName", e.target.value)}
                disabled={isLocked("candidateName")}
                data-testid="input-candidate-name"
              />
            </Field>
            <Field label="Your email" id="candidateEmail" error={errors.candidateEmail} locked={isLocked("candidateEmail")}>
              <Input
                id="candidateEmail"
                type="email"
                value={form.candidateEmail}
                onChange={(e) => update("candidateEmail", e.target.value)}
                disabled={isLocked("candidateEmail")}
                data-testid="input-candidate-email"
              />
            </Field>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Mobile (with country code)" id="candidateMobile" error={errors.candidateMobile}>
              <Input
                id="candidateMobile"
                placeholder="+852 ..."
                value={form.candidateMobile}
                onChange={(e) => update("candidateMobile", e.target.value)}
                data-testid="input-candidate-mobile"
              />
            </Field>
            <Field label="Timezone">
              <Select value={form.timezone} onValueChange={(v) => update("timezone", v)}>
                <SelectTrigger data-testid="select-timezone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Resonance proctor / contact (optional)" locked={isLocked("proctor")}>
            <Input
              value={form.proctor}
              onChange={(e) => update("proctor", e.target.value)}
              placeholder="Name of the Resonance partner who scheduled this"
              disabled={isLocked("proctor")}
              data-testid="input-proctor"
            />
          </Field>

          <div
            className={`ra-card-elevated rounded-lg p-4 ${
              errors.attestation ? "border-destructive" : ""
            }`}
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <Checkbox
                checked={form.attestation}
                onCheckedChange={(v) => update("attestation", !!v)}
                data-testid="checkbox-attestation"
              />
              <span className="text-sm text-foreground">
                <strong>I confirm</strong> that I will complete this assessment using only the
                exhibits provided in Section A. I will not consult external sources, generative AI
                tools, colleagues, or prior knowledge of the case during my response. I understand
                that my answers will be reviewed by Resonance Asia assessors and shared with the
                hiring client.
              </span>
            </label>
            {errors.attestation && (
              <p className="text-xs text-destructive mt-2">{errors.attestation}</p>
            )}
          </div>
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

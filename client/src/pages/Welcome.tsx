import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { AssessmentShell } from "@/components/AssessmentShell";
import { RALogo } from "@/components/RALogo";

export default function Welcome() {
  const [, setLocation] = useLocation();

  return (
    <AssessmentShell step={0}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-medium text-foreground mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span>APAC Insurance · Regional CEO</span>
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2 leading-tight">
            Executive Case Study Assessment
          </h1>
          <p className="text-base text-muted-foreground">
            A 90-minute scenario-based decision exercise designed by Resonance Asia to evaluate
            executive judgement under regulatory and capital pressure.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 mb-8">
          {[
            { n: "A", t: "Case + 4 Exhibits", d: "Read the brief and supporting data." },
            { n: "B", t: "12 MCQs", d: "Each requires a short rationale." },
            { n: "C", t: "3 Written Prompts", d: "Strategic recommendation, change-conditions, comms." },
          ].map((s) => (
            <div key={s.n} className="ra-card-elevated rounded-lg p-4">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-accent mb-1">
                Section {s.n}
              </div>
              <div className="font-semibold text-foreground mb-1">{s.t}</div>
              <div className="text-xs text-muted-foreground">{s.d}</div>
            </div>
          ))}
        </div>

        <div className="ra-card-elevated rounded-lg p-5 sm:p-6 mb-8">
          <h2 className="font-semibold text-foreground mb-3">Before you begin</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">No external research.</strong> Work only from the
              exhibits provided. We are not testing memorisation; we are testing how you reason.
            </li>
            <li>
              <strong className="text-foreground">Every MCQ rationale must include three things:</strong>{" "}
              (1) a specific metric from the exhibits, (2) an explicit assumption or
              uncertainty, and (3) a condition that would change your decision.
            </li>
            <li>
              <strong className="text-foreground">Calculator and pen-and-paper notes are fine.</strong>{" "}
              You may break and resume in the same browser session.
            </li>
            <li>
              <strong className="text-foreground">Allocate ~90 minutes.</strong> 25 mins to read
              Section A, 35 mins for the 12 MCQs, 30 mins for the three written prompts.
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:opacity-95"
            onClick={() => setLocation("/details")}
            data-testid="button-begin"
          >
            Begin Assessment →
          </Button>
          <p className="text-xs text-muted-foreground">
            By continuing you confirm you are the named candidate and that no other person will
            assist you.
          </p>
        </div>

        <div className="mt-12 pt-6 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-3">
            <RALogo variant="mark" className="h-6 w-6" />
            <span>Resonance Asia · executive search & talent advisory</span>
          </div>
          <div>v1.0</div>
        </div>
      </div>
    </AssessmentShell>
  );
}

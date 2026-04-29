import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { AssessmentShell } from "@/components/AssessmentShell";
import { ExhibitCard } from "@/components/ExhibitCard";
import { caseBrief, exhibits } from "@/data/case";

export default function SectionA() {
  const [, setLocation] = useLocation();
  return (
    <AssessmentShell step={2}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent mb-2">
            Section A · Case Brief & Exhibits
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">{caseBrief.title}</h1>
        </div>

        <div className="ra-card-elevated rounded-lg p-5 sm:p-7 mb-8">
          <p className="text-sm text-foreground/90 leading-relaxed mb-4"
             dangerouslySetInnerHTML={{ __html: bold(caseBrief.intro) }} />
          <p className="text-sm text-foreground/90 leading-relaxed"
             dangerouslySetInnerHTML={{ __html: bold(caseBrief.task) }} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 mb-8">
          <ExhibitCard exhibit={exhibits.E1} />
          <ExhibitCard exhibit={exhibits.E2} />
          <ExhibitCard exhibit={exhibits.E3} />
          <ExhibitCard exhibit={exhibits.E4} />
        </div>

        <div className="ra-card-elevated rounded-lg p-5 mb-8 border-l-4 border-l-accent">
          <h3 className="text-sm font-semibold text-foreground mb-2">
            Reminder before Section B
          </h3>
          <p className="text-sm text-muted-foreground">
            Each MCQ requires a short written rationale. To score above the "Proficient" cap, every
            rationale must explicitly include:
          </p>
          <ol className="mt-2 grid sm:grid-cols-3 gap-2 text-xs">
            <li className="bg-muted rounded-md px-3 py-2">
              <strong className="text-foreground">1. A specific metric</strong>{" "}
              <span className="text-muted-foreground">from the exhibits.</span>
            </li>
            <li className="bg-muted rounded-md px-3 py-2">
              <strong className="text-foreground">2. An assumption</strong>{" "}
              <span className="text-muted-foreground">or uncertainty you are accepting.</span>
            </li>
            <li className="bg-muted rounded-md px-3 py-2">
              <strong className="text-foreground">3. A change-condition</strong>{" "}
              <span className="text-muted-foreground">— what evidence would shift your view.</span>
            </li>
          </ol>
        </div>

        <div className="flex justify-between items-center">
          <Button variant="ghost" onClick={() => setLocation("/details")} data-testid="button-back">
            ← Back
          </Button>
          <Button
            size="lg"
            className="bg-primary text-primary-foreground"
            onClick={() => setLocation("/section-b")}
            data-testid="button-continue-to-section-b"
          >
            Continue to Section B (12 MCQs) →
          </Button>
        </div>
      </div>
    </AssessmentShell>
  );
}

function bold(s: string): string {
  // escape HTML then convert **x** to <strong>x</strong>
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

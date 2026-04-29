import { type ReactNode } from "react";
import { RALogo } from "./RALogo";

interface ShellProps {
  children: ReactNode;
  step?: number; // 0..5: Welcome, Details, A, B, C, Done
}

const STEPS = [
  { key: "welcome", label: "Welcome" },
  { key: "details", label: "Candidate" },
  { key: "section-a", label: "Section A" },
  { key: "section-b", label: "Section B" },
  { key: "section-c", label: "Section C" },
  { key: "done", label: "Submit" },
];

export function AssessmentShell({ children, step }: ShellProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Top brand bar */}
      <header className="ra-gradient-navy border-b border-[hsl(213_50%_22%)]">
        <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
          <div className="text-white">
            <RALogo variant="horizontal" className="h-9 w-auto" monoColor="white" />
          </div>
          <div className="text-[11px] uppercase tracking-[0.18em] text-white/70 hidden sm:block">
            Executive Case Study Assessment
          </div>
        </div>
      </header>

      {/* Progress strip */}
      {typeof step === "number" && (
        <div className="border-b border-border bg-card">
          <div className="mx-auto max-w-5xl px-4 py-3">
            <ol className="flex items-center gap-1 sm:gap-2 overflow-x-auto" aria-label="progress">
              {STEPS.map((s, i) => {
                const active = i === step;
                const done = i < step;
                return (
                  <li key={s.key} className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <div
                      className={[
                        "h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold border",
                        active
                          ? "bg-primary text-primary-foreground border-transparent"
                          : done
                          ? "bg-accent text-accent-foreground border-transparent"
                          : "bg-muted text-muted-foreground border-border",
                      ].join(" ")}
                      data-testid={`step-indicator-${i}`}
                    >
                      {done ? "✓" : i + 1}
                    </div>
                    <span
                      className={[
                        "text-xs whitespace-nowrap hidden sm:inline",
                        active ? "text-foreground font-medium" : "text-muted-foreground",
                      ].join(" ")}
                    >
                      {s.label}
                    </span>
                    {i < STEPS.length - 1 && (
                      <div className="w-4 sm:w-8 h-px bg-border" />
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-5xl px-4 py-8 sm:py-12">{children}</main>

      <footer className="border-t border-border mt-16 py-6">
        <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-muted-foreground">
          <div>© 2026 Resonance Asia. Confidential — for the named candidate only.</div>
          <div>Hong Kong · Singapore · APAC</div>
        </div>
      </footer>
    </div>
  );
}

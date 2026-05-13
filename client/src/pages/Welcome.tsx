import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { AssessmentShell } from "@/components/AssessmentShell";
import { RALogo } from "@/components/RALogo";
import { useAssessment } from "@/lib/AssessmentContext";

const API_BASE = "__PORT_5000__".startsWith("__") ? "" : "__PORT_5000__";

function readInviteToken(): string | null {
  if (typeof window === "undefined") return null;
  // The invite token is carried as a regular query string before the hash,
  // e.g. "https://app.example.com/?invite=abc123#/". Hash routing does not
  // capture the query, so we read it from window.location.search.
  const search = window.location.search || "";
  if (search) {
    const qs = new URLSearchParams(search);
    const t = qs.get("invite");
    if (t) return t;
  }
  // Backwards-compatible fallback: "#/?invite=abc123"
  const hash = window.location.hash || "";
  const qIndex = hash.indexOf("?");
  if (qIndex !== -1) {
    const t = new URLSearchParams(hash.slice(qIndex + 1)).get("invite");
    if (t) return t;
  }
  return null;
}

export default function Welcome() {
  const [, setLocation] = useLocation();
  const { state, applyInvite } = useAssessment();
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    const token = readInviteToken();
    if (!token || state.invite?.token === token) return;
    let cancelled = false;
    setInviteLoading(true);
    setInviteError(null);
    fetch(`${API_BASE}/api/invites/${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!res.ok) {
          let msg = "This invite is no longer valid.";
          try {
            const body = await res.json();
            if (body?.error) msg = body.error;
          } catch {}
          throw new Error(msg);
        }
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;
        applyInvite({
          token: data.token,
          candidateName: data.candidateName,
          candidateEmail: data.candidateEmail,
          role: data.role,
          client: data.client,
          proctor: data.proctor ?? "",
          expiresAt: data.expiresAt,
        });
      })
      .catch((err) => {
        if (!cancelled) setInviteError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setInviteLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const invite = state.invite;

  return (
    <AssessmentShell step={0}>
      <div className="max-w-3xl mx-auto">
        {invite && (
          <div
            className="mb-6 ra-card-elevated rounded-lg p-4 border-accent/40"
            data-testid="banner-invite"
          >
            <div className="text-[10px] font-semibold uppercase tracking-wider text-accent mb-1">
              Invited by Resonance Asia
            </div>
            <div className="font-semibold text-foreground">
              Welcome, {invite.candidateName}
            </div>
            <div className="text-sm text-muted-foreground mt-0.5">
              {invite.role} · {invite.client}
            </div>
          </div>
        )}
        {inviteError && (
          <div
            className="mb-6 rounded-lg p-4 border border-destructive/40 bg-destructive/5 text-sm text-destructive"
            data-testid="banner-invite-error"
          >
            {inviteError.replace(/\.?$/, ".")} You can still proceed and enter your details manually.
          </div>
        )}
        {inviteLoading && (
          <div className="mb-6 text-sm text-muted-foreground">Loading invite…</div>
        )}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-medium text-foreground mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span>APAC Insurance · Regional CEO</span>
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2 leading-tight">
            Executive Case Study Assessment
          </h1>
          <p className="text-base text-muted-foreground">
            A 45-minute scenario-based decision exercise designed by Resonance Asia to evaluate
            executive judgement under regulatory and capital pressure.
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 mb-8">
          {[
            { n: "A", t: "Case + 4 Exhibits", d: "Read the brief and supporting data." },
            { n: "B", t: "11 MCQs", d: "Each requires a short rationale." },
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
              <strong className="text-foreground">Allocate ~45 minutes for Sections B + C.</strong>{" "}
              Read Section A at your own pace beforehand — the 45-minute clock starts only when
              you click into Section B. Plan ~25 mins for the 11 MCQs and ~20 mins for the three
              written prompts.
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
          <div>v2.0</div>
        </div>
      </div>
    </AssessmentShell>
  );
}

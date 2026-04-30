import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { AssessmentShell } from "@/components/AssessmentShell";
import { sessionState } from "./SectionC";
import { useAssessment } from "@/lib/AssessmentContext";
import { apiRequest } from "@/lib/queryClient";

export default function Done() {
  const [, setLocation] = useLocation();
  const { state, reset } = useAssessment();
  const id = sessionState.lastId;
  const emailStatus = sessionState.lastEmailStatus;
  const downloadToken = sessionState.lastDownloadToken;
  const elapsed = sessionState.lastElapsedSeconds;

  const downloadCsv = async () => {
    if (!id) return;
    // Fetch via apiRequest to inherit the __PORT_5000__ rewrite for production,
    // then create a blob URL so the file downloads with the correct name.
    try {
      const url = `/api/submissions/${encodeURIComponent(id)}/csv?token=${encodeURIComponent(downloadToken ?? "")}`;
      const res = await apiRequest("GET", url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = `${id}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error(err);
      alert("Could not download CSV. Please contact Resonance Asia.");
    }
  };

  if (!id) {
    return (
      <AssessmentShell step={5}>
        <div className="max-w-xl mx-auto text-center py-8">
          <h1 className="text-xl font-semibold text-foreground mb-3">
            No submission found in this session
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            If you navigated here directly without submitting, please start the assessment from
            the beginning.
          </p>
          <Button onClick={() => setLocation("/")} className="bg-primary text-primary-foreground">
            Start over
          </Button>
        </div>
      </AssessmentShell>
    );
  }

  return (
    <AssessmentShell step={5}>
      <div className="max-w-2xl mx-auto py-4">
        <div className="ra-card-elevated rounded-xl p-6 sm:p-8 text-center">
          <div className="h-16 w-16 mx-auto rounded-full bg-accent/15 flex items-center justify-center mb-4">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="hsl(180 49% 48%)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2">
            Submission received
          </h1>
          <p className="text-sm text-muted-foreground mb-1">
            Thank you, <strong className="text-foreground">{state.candidate.candidateName}</strong>.
            Your assessment has been logged.
          </p>
          <p className="text-xs text-muted-foreground mb-1">
            Submission ID: <span className="font-mono text-foreground">{id}</span>
          </p>
          {typeof elapsed === "number" && (
            <p className="text-xs text-muted-foreground mb-6" data-testid="text-elapsed">
              Time on Sections B + C:{" "}
              <span className="font-medium text-foreground">
                {Math.floor(elapsed / 60)}m {elapsed % 60}s
              </span>{" "}
              <span className="text-muted-foreground/70">(45-minute budget)</span>
            </p>
          )}
          {typeof elapsed !== "number" && <div className="mb-6" />}

          <div className="rounded-md bg-muted px-4 py-3 text-left text-sm text-foreground mb-6">
            {emailStatus === "sent" ? (
              <>
                ✓ A copy has been sent to{" "}
                <strong>executiveassessments@resonanceasia.com</strong>. A Resonance Asia
                consultant will review and follow up within 5 business days.
              </>
            ) : emailStatus === "failed" ? (
              <>
                ⚠ Your responses are saved on our servers, but the automated email to
                Resonance Asia did not deliver. Please download the CSV below and forward it to{" "}
                <strong>executiveassessments@resonanceasia.com</strong>.
              </>
            ) : (
              <>
                Your responses are saved. A Resonance Asia consultant will review and follow up
                within 5 business days.
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground"
              onClick={downloadCsv}
              data-testid="button-download-csv"
            >
              Download my responses (CSV)
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                reset();
                setLocation("/");
              }}
              data-testid="button-finish"
            >
              Close
            </Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          You may now close this window. Resonance Asia will be in touch.
        </p>
      </div>
    </AssessmentShell>
  );
}

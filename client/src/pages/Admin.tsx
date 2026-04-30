import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { AssessmentShell } from "@/components/AssessmentShell";

interface InviteResponse {
  token: string;
  expiresAt: string;
  candidateName: string;
  candidateEmail: string;
  role: string;
  client: string;
  proctor: string;
}

interface InviteListItem {
  token: string;
  candidateName: string;
  candidateEmail: string;
  role: string;
  client: string;
  createdAt: string;
  expiresAt: string;
  status: "active" | "used" | "expired";
  submissionId: string;
}

const API_BASE = "__PORT_5000__".startsWith("__") ? "" : "__PORT_5000__";

function formatDate(iso: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function Admin() {
  const { toast } = useToast();
  const [adminToken, setAdminToken] = useState("");
  const [form, setForm] = useState({
    candidateName: "",
    candidateEmail: "",
    role: "Regional CEO (APAC) — Composite Insurer",
    client: "Aurora Composite Insurance Group",
    proctor: "",
    createdBy: "",
  });
  const [generated, setGenerated] = useState<InviteResponse | null>(null);
  const [generating, setGenerating] = useState(false);
  const [list, setList] = useState<InviteListItem[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const origin =
    typeof window !== "undefined" ? window.location.origin + window.location.pathname : "";

  const generatedLink = useMemo(() => {
    if (!generated) return "";
    if (typeof window === "undefined") return "";
    // Build a clean link without our own /admin path or query: schemed origin + base path + ?invite=...#/
    const url = new URL(window.location.href);
    url.hash = "#/";
    url.search = `?invite=${encodeURIComponent(generated.token)}`;
    return url.toString();
  }, [generated]);

  const fetchList = async () => {
    if (!adminToken) return;
    setListLoading(true);
    setListError(null);
    try {
      const res = await fetch(`${API_BASE}/api/admin/invites`, {
        headers: { "x-admin-token": adminToken },
      });
      if (!res.ok) {
        throw new Error(`${res.status} ${await res.text()}`);
      }
      const data = await res.json();
      setList(data.invites ?? []);
    } catch (err) {
      setListError(err instanceof Error ? err.message : String(err));
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    if (adminToken) fetchList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminToken]);

  const update = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const onGenerate = async () => {
    if (!adminToken) {
      toast({ title: "Admin token required", description: "Enter your admin token first." });
      return;
    }
    if (!form.candidateName || !form.candidateEmail || !form.role || !form.client) {
      toast({ title: "Missing fields", description: "Name, email, role and client are required." });
      return;
    }
    setGenerating(true);
    try {
      const res = await fetch(`${API_BASE}/api/invites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        throw new Error(`${res.status} ${await res.text()}`);
      }
      const data = (await res.json()) as InviteResponse;
      setGenerated(data);
      toast({ title: "Invite created", description: `Expires ${formatDate(data.expiresAt)}` });
      fetchList();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast({ title: "Could not create invite", description: msg, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const copyLink = async () => {
    if (!generatedLink) return;
    try {
      await navigator.clipboard.writeText(generatedLink);
      toast({ title: "Copied", description: "Invite link copied to clipboard." });
    } catch {
      toast({ title: "Copy failed", description: "Select the text manually." });
    }
  };

  return (
    <AssessmentShell step={0}>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-xs font-medium text-foreground mb-4">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            <span>Resonance Asia · Admin</span>
          </div>
          <h1 className="text-xl font-semibold text-foreground mb-2 leading-tight">
            Generate Candidate Invite
          </h1>
          <p className="text-base text-muted-foreground">
            Create a one-time-use link, valid for 14 days, that pre-fills the candidate's name,
            role, and client. Copy the link into your own email to the candidate — no domain set-up
            required.
          </p>
        </div>

        <div className="ra-card-elevated rounded-lg p-5 sm:p-6 mb-6">
          <Field label="Admin token" id="adminToken">
            <Input
              id="adminToken"
              type="password"
              autoComplete="off"
              value={adminToken}
              onChange={(e) => setAdminToken(e.target.value)}
              placeholder="Set via the ADMIN_TOKEN environment variable"
              data-testid="input-admin-token"
            />
          </Field>
          <p className="text-xs text-muted-foreground mt-1.5">
            The token is held in this tab only — it is not saved.
          </p>
        </div>

        <div className="ra-card-elevated rounded-lg p-5 sm:p-6 mb-6">
          <h2 className="font-semibold text-foreground mb-4">Candidate details</h2>
          <div className="grid gap-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Candidate name" id="candidateName">
                <Input
                  id="candidateName"
                  value={form.candidateName}
                  onChange={(e) => update("candidateName", e.target.value)}
                  data-testid="input-invite-name"
                />
              </Field>
              <Field label="Candidate email" id="candidateEmail">
                <Input
                  id="candidateEmail"
                  type="email"
                  value={form.candidateEmail}
                  onChange={(e) => update("candidateEmail", e.target.value)}
                  data-testid="input-invite-email"
                />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Role" id="role">
                <Input
                  id="role"
                  value={form.role}
                  onChange={(e) => update("role", e.target.value)}
                  data-testid="input-invite-role"
                />
              </Field>
              <Field label="Client" id="client">
                <Input
                  id="client"
                  value={form.client}
                  onChange={(e) => update("client", e.target.value)}
                  data-testid="input-invite-client"
                />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Resonance proctor (optional)" id="proctor">
                <Input
                  id="proctor"
                  value={form.proctor}
                  onChange={(e) => update("proctor", e.target.value)}
                  data-testid="input-invite-proctor"
                />
              </Field>
              <Field label="Created by (optional)" id="createdBy">
                <Input
                  id="createdBy"
                  value={form.createdBy}
                  onChange={(e) => update("createdBy", e.target.value)}
                  placeholder="Your name"
                  data-testid="input-invite-createdby"
                />
              </Field>
            </div>
          </div>
          <div className="mt-6">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:opacity-95"
              onClick={onGenerate}
              disabled={generating}
              data-testid="button-generate-invite"
            >
              {generating ? "Generating…" : "Generate invite link"}
            </Button>
          </div>
        </div>

        {generated && (
          <div className="ra-card-elevated rounded-lg p-5 sm:p-6 mb-8 border-accent/40">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-accent mb-1">
              Invite ready
            </div>
            <div className="font-semibold text-foreground mb-3">
              {generated.candidateName} · expires {formatDate(generated.expiresAt)}
            </div>
            <Label className="text-sm font-medium text-foreground">Invite link</Label>
            <textarea
              readOnly
              value={generatedLink}
              className="mt-1.5 w-full font-mono text-xs bg-muted/40 border border-border rounded-md p-3 h-24 text-foreground"
              data-testid="textarea-invite-link"
              onFocus={(e) => e.currentTarget.select()}
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <Button onClick={copyLink} data-testid="button-copy-link">
                Copy link
              </Button>
              <Button
                variant="ghost"
                onClick={() => setGenerated(null)}
                data-testid="button-clear-invite"
              >
                Clear
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Paste this link into your email to the candidate. The link can only be used once and
              expires in 14 days.
            </p>
          </div>
        )}

        <div className="ra-card-elevated rounded-lg p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground">Recent invites</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchList}
              disabled={!adminToken || listLoading}
              data-testid="button-refresh-invites"
            >
              {listLoading ? "Loading…" : "Refresh"}
            </Button>
          </div>
          {!adminToken && (
            <p className="text-sm text-muted-foreground">Enter your admin token above to load invites.</p>
          )}
          {listError && <p className="text-sm text-destructive">{listError}</p>}
          {adminToken && !listError && list.length === 0 && !listLoading && (
            <p className="text-sm text-muted-foreground">No invites yet.</p>
          )}
          {list.length > 0 && (
            <div className="overflow-x-auto -mx-2">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-2 py-2 font-medium">Candidate</th>
                    <th className="px-2 py-2 font-medium">Role</th>
                    <th className="px-2 py-2 font-medium">Created</th>
                    <th className="px-2 py-2 font-medium">Expires</th>
                    <th className="px-2 py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((i) => (
                    <tr key={i.token} className="border-t border-border" data-testid={`row-invite-${i.token}`}>
                      <td className="px-2 py-2">
                        <div className="font-medium text-foreground">{i.candidateName}</div>
                        <div className="text-xs text-muted-foreground">{i.candidateEmail}</div>
                      </td>
                      <td className="px-2 py-2 text-muted-foreground">{i.role}</td>
                      <td className="px-2 py-2 text-muted-foreground">{formatDate(i.createdAt)}</td>
                      <td className="px-2 py-2 text-muted-foreground">{formatDate(i.expiresAt)}</td>
                      <td className="px-2 py-2">
                        <span
                          className={
                            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium " +
                            (i.status === "active"
                              ? "bg-accent/15 text-accent"
                              : i.status === "used"
                              ? "bg-muted text-muted-foreground"
                              : "bg-destructive/10 text-destructive")
                          }
                        >
                          {i.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AssessmentShell>
  );
}

function Field({
  label,
  id,
  children,
}: {
  label: string;
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      {children}
    </div>
  );
}

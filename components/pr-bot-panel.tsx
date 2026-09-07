"use client";

import * as React from "react";
import { Card, Button, Input } from "@/components/ui-elements";
import {
  GitPullRequest, Plus, Trash2, ToggleLeft, ToggleRight,
  Copy, CheckCircle2, Loader2, ExternalLink, ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PRBotConfig {
  id: string;
  repoFullName: string;
  enabled: boolean;
  webhookSecret: string;
  createdAt: string;
}

interface SetupInstructions {
  webhookUrl: string;
  webhookSecret: string;
  instructions: string[];
}

export function PRBotPanel() {
  const [configs, setConfigs] = React.useState<PRBotConfig[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [repoInput, setRepoInput] = React.useState("");
  const [connecting, setConnecting] = React.useState(false);
  const [setup, setSetup] = React.useState<SetupInstructions | null>(null);
  const [copied, setCopied] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchConfigs();
  }, []);

  async function fetchConfigs() {
    try {
      const res = await fetch("/api/pr-bot");
      if (res.ok) {
        const data = await res.json();
        setConfigs(data.configs || []);
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!repoInput.includes("/")) {
      setError("Repository must be in owner/repo format (e.g. inkand-paper/Optimizer)");
      return;
    }
    setConnecting(true);
    try {
      const res = await fetch("/api/pr-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoFullName: repoInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to connect repository");
        return;
      }
      setSetup(data.setup);
      setRepoInput("");
      fetchConfigs();
    } catch {
      setError("Network error — please try again");
    } finally {
      setConnecting(false);
    }
  }

  async function handleToggle(configId: string, enabled: boolean) {
    await fetch("/api/pr-bot", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ configId, enabled: !enabled }),
    });
    fetchConfigs();
  }

  async function handleDelete(configId: string) {
    await fetch("/api/pr-bot", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ configId }),
    });
    setConfigs((prev) => prev.filter((c) => c.id !== configId));
  }

  function copyText(text: string, key: string) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">

      {/* ── Header ── */}
      <Card className="p-6 bg-gradient-to-r from-np-gold/5 via-background to-background border-np-gold/20">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-ui bg-np-gold/10 border border-np-gold/30 flex items-center justify-center text-np-gold">
            <GitPullRequest className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold uppercase tracking-tight">PR Code Review Bot</h2>
              <span className="bg-np-gold/20 text-np-gold font-bold text-[9px] uppercase tracking-widest px-2 py-0.5 rounded border border-np-gold/30">AI</span>
            </div>
            <p className="text-[12px] text-muted-foreground mt-0.5">
              Auto-audit pull requests and post a quality score comment directly on GitHub.
            </p>
          </div>
        </div>
      </Card>

      {/* ── Connect Repo ── */}
      <Card className="p-6 space-y-4">
        <h3 className="text-[13px] font-semibold uppercase tracking-wider flex items-center gap-2">
          <Plus className="h-4 w-4 text-np-gold" />
          Connect a Repository
        </h3>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-ui bg-np-crimson/10 border border-np-crimson/30 text-np-crimson text-[12px]">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleConnect} className="flex gap-2">
          <Input
            placeholder="owner/repo  (e.g. inkand-paper/Optimizer)"
            value={repoInput}
            onChange={(e) => setRepoInput(e.target.value)}
            className="flex-1 font-mono text-[13px]"
          />
          <Button type="submit" disabled={connecting || !repoInput}>
            {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-1.5" />Connect</>}
          </Button>
        </form>

        {/* ── Setup Instructions ── */}
        {setup && (
          <div className="mt-2 p-5 rounded-ui bg-muted/30 border border-np-teal/20 space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center gap-2 text-np-teal">
              <CheckCircle2 className="h-4 w-4" />
              <h4 className="text-[12px] font-bold uppercase tracking-wider">Repository Connected — Complete GitHub Webhook Setup</h4>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold">Payload URL</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-[12px] p-2.5 bg-background rounded-ui border border-border text-np-gold truncate">
                  {setup.webhookUrl}
                </code>
                <Button size="sm" variant="outline" onClick={() => copyText(setup.webhookUrl, "url")}>
                  {copied === "url" ? <CheckCircle2 className="h-3.5 w-3.5 text-np-teal" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold">Webhook Secret</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-[12px] p-2.5 bg-background rounded-ui border border-border text-np-teal truncate">
                  {setup.webhookSecret}
                </code>
                <Button size="sm" variant="outline" onClick={() => copyText(setup.webhookSecret, "secret")}>
                  {copied === "secret" ? <CheckCircle2 className="h-3.5 w-3.5 text-np-teal" /> : <Copy className="h-3.5 w-3.5" />}
                </Button>
              </div>
            </div>

            <div className="space-y-1.5">
              <p className="text-[11px] text-muted-foreground uppercase tracking-widest font-semibold">Steps</p>
              <ol className="space-y-1">
                {setup.instructions.map((step, i) => (
                  <li key={i} className="text-[12px] text-muted-foreground flex items-start gap-2">
                    <span className="text-np-gold font-bold font-mono shrink-0">{i + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <p className="text-[11px] text-muted-foreground border-t border-border pt-3">
              When a PR is opened or updated, NexPulse will automatically audit the changes and post a detailed quality score comment.
            </p>
          </div>
        )}
      </Card>

      {/* ── Connected Repos ── */}
      <Card className="p-6 space-y-4">
        <h3 className="text-[13px] font-semibold uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-np-gold" />
          Connected Repositories
        </h3>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : configs.length === 0 ? (
          <div className="py-10 text-center border border-dashed border-border rounded-ui">
            <GitPullRequest className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-[13px] font-semibold text-muted-foreground">No repositories connected</p>
            <p className="text-[11px] text-muted-foreground/60 mt-1">Connect a repository above to start auto-reviewing pull requests.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {configs.map((config) => (
              <div
                key={config.id}
                className={cn(
                  "flex items-center justify-between p-3.5 rounded-ui border transition-all",
                  config.enabled
                    ? "bg-muted/20 border-border hover:border-np-gold/30"
                    : "bg-muted/10 border-border/50 opacity-60"
                )}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    "h-8 w-8 rounded bg-background border flex items-center justify-center shrink-0",
                    config.enabled ? "border-np-gold/30 text-np-gold" : "border-border text-muted-foreground"
                  )}>
                    <GitPullRequest className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold font-mono truncate">{config.repoFullName}</p>
                    <p className="text-[10px] text-muted-foreground">
                      Connected {new Date(config.createdAt).toLocaleDateString()}
                      {" · "}
                      <span className={config.enabled ? "text-np-teal" : "text-muted-foreground"}>
                        {config.enabled ? "Active" : "Paused"}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <a
                    href={`https://github.com/${config.repoFullName}/settings/hooks`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-ui text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title="View on GitHub"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <button
                    onClick={() => handleToggle(config.id, config.enabled)}
                    className="p-2 rounded-ui text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                    title={config.enabled ? "Pause" : "Resume"}
                  >
                    {config.enabled
                      ? <ToggleRight className="h-4 w-4 text-np-teal" />
                      : <ToggleLeft className="h-4 w-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(config.id)}
                    className="p-2 rounded-ui text-muted-foreground hover:text-np-crimson hover:bg-np-crimson/10 transition-colors"
                    title="Disconnect"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

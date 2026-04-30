"use client";

import * as React from "react";
import { Card, Button, Input } from "./ui-elements";
import { Webhook, Plus, Trash2, Copy, CheckCircle2, ShieldCheck, Zap, Globe, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface WebhookItem { id: string; url: string; events: string[]; secret: string; createdAt: string; }
interface Props { onLimitReached?: () => void; }

const EVENT_OPTIONS = [
  { id: "REVALIDATE_SUCCESS", label: "Revalidation success" },
  { id: "REVALIDATE_FAILURE", label: "Revalidation failure" },
  { id: "MONITOR_DOWN",       label: "Monitor offline"      },
  { id: "MONITOR_UP",         label: "Monitor restored"     },
];

export function WebhookManager({ onLimitReached }: Props) {
  const [webhooks, setWebhooks]         = React.useState<WebhookItem[]>([]);
  const [loading, setLoading]           = React.useState(true);
  const [isAdding, setIsAdding]         = React.useState(false);
  const [url, setUrl]                   = React.useState("");
  const [selectedEvents, setSelected]   = React.useState<string[]>(["MONITOR_DOWN", "REVALIDATE_SUCCESS"]);
  const [copiedId, setCopiedId]         = React.useState<string | null>(null);

  const fetchWebhooks = async () => {
    try {
      const r = await fetch("/api/webhooks", { credentials: "include" });
      const d = await r.json();
      if (r.ok) setWebhooks(d.webhooks);
    } catch {}
    finally { setLoading(false); }
  };

  React.useEffect(() => { fetchWebhooks(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ url, events: selectedEvents }),
      });
      if (r.ok) { setIsAdding(false); setUrl(""); fetchWebhooks(); }
      else if (r.status === 403) { onLimitReached?.(); }
      else { const d = await r.json(); alert(d.message || "Failed"); }
    } catch { alert("Error provisioning webhook"); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this webhook?")) return;
    try {
      const r = await fetch(`/api/webhooks/${id}`, { method: "DELETE", credentials: "include" });
      if (r.ok) setWebhooks(webhooks.filter((w) => w.id !== id));
    } catch {}
  };

  const toggleEvent = (id: string) =>
    setSelected((prev) => prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]);

  const copySecret = (id: string, secret: string) => {
    navigator.clipboard.writeText(secret);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading && webhooks.length === 0) {
    return (
      <Card className="p-10 text-center">
        <Webhook className="h-6 w-6 animate-pulse mx-auto mb-3 text-np-gold opacity-40" />
        <p className="label-category">Loading webhooks…</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: "0.5px solid var(--border)" }}>
        <div className="flex items-center gap-2">
          <Webhook className="h-4 w-4 text-np-gold" />
          <span className="text-[13px] font-semibold">Outgoing Webhooks</span>
        </div>
        <Button size="sm" variant="outline" onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? "Cancel" : <><Plus className="h-3.5 w-3.5 mr-1.5" />Add webhook</>}
        </Button>
      </div>

      {/* Add form */}
      {isAdding && (
        <div className="p-5 space-y-4" style={{ borderBottom: "0.5px solid var(--border)", background: "var(--muted)" }}>
          <div className="space-y-1.5">
            <label className="label-category text-[10px]">Target URL</label>
            <Input placeholder="https://your-server.com/webhooks" value={url} onChange={(e) => setUrl(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <label className="label-category text-[10px]">Trigger matrix</label>
            <div className="grid grid-cols-2 gap-2">
              {EVENT_OPTIONS.map((ev) => {
                const active = selectedEvents.includes(ev.id);
                return (
                  <button
                    key={ev.id}
                    onClick={() => toggleEvent(ev.id)}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2.5 rounded-ui text-[12px] font-medium text-left transition-all",
                      active
                        ? "text-np-gold"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                    style={{
                      border: active ? "0.5px solid var(--np-gold)" : "0.5px solid var(--border)",
                      background: active ? "rgba(180,140,60,0.08)" : "var(--card)",
                    }}
                  >
                    <Zap className="h-3.5 w-3.5 shrink-0" style={{ color: active ? "var(--np-gold)" : "var(--np-slate)" }} />
                    {ev.label}
                  </button>
                );
              })}
            </div>
          </div>

          <Button className="w-full" onClick={handleAdd as any} disabled={!url || selectedEvents.length === 0 || loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Register webhook"}
          </Button>
        </div>
      )}

      {/* List */}
      <div className="divide-y divide-border">
        {webhooks.length === 0 ? (
          <p className="p-8 text-center text-[13px] text-muted-foreground">No webhooks configured.</p>
        ) : (
          webhooks.map((w) => (
            <div key={w.id} className="p-5 space-y-3 group hover:bg-muted/20 transition-colors">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="h-3.5 w-3.5 text-np-slate shrink-0" />
                    <p className="text-[13px] font-medium truncate">{w.url}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {w.events.map((ev) => (
                      <span key={ev} className="np-badge-warning text-[10px]">
                        {ev.replace("_", " ")}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(w.id)}
                  className="np-btn-danger h-8 px-3 text-[12px] opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Secret — mono as per spec */}
              <div
                className="flex items-center gap-3 px-3 py-2.5 rounded-ui"
                style={{ background: "var(--np-obsidian)", border: "0.5px solid rgba(255,255,255,0.07)" }}
              >
                <ShieldCheck className="h-3.5 w-3.5 text-np-teal shrink-0" />
                <span className="mono-gold flex-1 truncate">
                  {w.secret.substring(0, 20)}…
                </span>
                <button
                  onClick={() => copySecret(w.id, w.secret)}
                  className="text-np-slate hover:text-np-gold transition-colors shrink-0"
                >
                  {copiedId === w.id
                    ? <CheckCircle2 className="h-4 w-4 text-np-teal" />
                    : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

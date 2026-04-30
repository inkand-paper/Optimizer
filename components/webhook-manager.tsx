import * as React from "react";
import { Card, Button, Input } from "./ui-elements";
import { 
  Webhook, 
  Plus, 
  Trash2, 
  Copy, 
  CheckCircle2,
  ShieldCheck,
  Zap,
  Globe,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface WebhookItem {
  id: string;
  url: string;
  events: string[];
  secret: string;
  createdAt: string;
}

interface WebhookManagerProps {
  onLimitReached?: () => void;
}

/**
 * [PRODUCTION-GRADE] - Webhook Manager
 * Sovereign Obsidian Aesthetic
 */
export function WebhookManager({ onLimitReached }: WebhookManagerProps) {
  const [webhooks, setWebhooks] = React.useState<WebhookItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isAdding, setIsAdding] = React.useState(false);
  const [url, setUrl] = React.useState("");
  const [selectedEvents, setSelectedEvents] = React.useState<string[]>(['MONITOR_DOWN', 'REVALIDATE_SUCCESS']);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const events = [
    { id: 'REVALIDATE_SUCCESS', label: 'REVALIDATION SUCCESS' },
    { id: 'REVALIDATE_FAILURE', label: 'REVALIDATION FAILURE' },
    { id: 'MONITOR_DOWN', label: 'MONITOR OFFLINE' },
    { id: 'MONITOR_UP', label: 'MONITOR RESTORED' },
  ];

  const fetchWebhooks = async () => {
    try {
      const res = await fetch("/api/webhooks", { credentials: 'include' });
      const data = await res.json();
      if (res.ok) setWebhooks(data.webhooks);
    } catch (err) {
      console.error("Failed to fetch webhooks", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchWebhooks();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/webhooks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ url, events: selectedEvents }),
      });
      if (res.ok) {
        setIsAdding(false);
        setUrl("");
        fetchWebhooks();
      } else if (res.status === 403) {
        if (onLimitReached) onLimitReached();
        else alert("Infrastructure Limit Reached.");
      } else {
        const data = await res.json();
        alert(data.message || "Webhook registration failed.");
      }
    } catch (err) {
      alert("Error provisioning webhook endpoint.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Decommission this webhook?")) return;
    try {
      const res = await fetch(`/api/webhooks/${id}`, { method: "DELETE", credentials: 'include' });
      if (res.ok) setWebhooks(webhooks.filter(w => w.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleEvent = (id: string) => {
    if (selectedEvents.includes(id)) {
      setSelectedEvents(selectedEvents.filter(e => e !== id));
    } else {
      setSelectedEvents([...selectedEvents, id]);
    }
  };

  const copySecret = (id: string, secret: string) => {
    navigator.clipboard.writeText(secret);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading && webhooks.length === 0) {
    return (
      <Card className="p-12 text-center bg-zinc-50 dark:bg-black border-zinc-200 dark:border-zinc-800">
        <Webhook className="h-8 w-8 animate-pulse mx-auto mb-4 text-blue-600 opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Syncing Webhook Registry...</p>
      </Card>
    );
  }

  return (
    <Card className="p-0 overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
      <div className="p-5 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Webhook className="h-4 w-4 text-blue-600" />
          <span className="font-black text-xs uppercase tracking-widest text-zinc-900 dark:text-white">Outgoing Endpoints</span>
        </div>
        <Button size="sm" variant="ghost" className="h-8 px-4 text-[9px] font-black uppercase tracking-widest" onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? "Cancel" : <><Plus className="h-3 w-3 mr-2" /> Provision Webhook</>}
        </Button>
      </div>

      {isAdding && (
        <div className="p-6 bg-zinc-50/50 dark:bg-zinc-950/30 border-b border-zinc-100 dark:border-zinc-900 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Target Endpoint URL</label>
            <Input 
              placeholder="https://infrastructure-gateway.io/webhooks" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-12 bg-white dark:bg-black font-bold"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Trigger Matrix</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {events.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => toggleEvent(ev.id)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-3 rounded-md border text-[9px] font-black uppercase tracking-widest transition-all text-left",
                    selectedEvents.includes(ev.id) 
                      ? "bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-zinc-900" 
                      : "bg-white border-zinc-200 text-zinc-500 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-500 hover:border-zinc-400"
                  )}
                >
                  <Zap className={cn("h-3 w-3", selectedEvents.includes(ev.id) ? "text-blue-500" : "opacity-20")} />
                  {ev.label}
                </button>
              ))}
            </div>
          </div>
          <Button className="w-full h-12 font-black uppercase tracking-widest text-xs" onClick={handleAdd} disabled={!url || selectedEvents.length === 0}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Deploy Webhook Sequence"}
          </Button>
        </div>
      )}

      <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
        {webhooks.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 font-bold text-[10px] uppercase tracking-[0.2em]">
            Registry empty. No webhooks configured.
          </div>
        ) : (
          webhooks.map((w) => (
            <div key={w.id} className="p-6 space-y-4 group">
              <div className="flex items-center justify-between gap-6">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Globe className="h-3.5 w-3.5 text-blue-600 shrink-0" />
                    <p className="text-xs font-black uppercase tracking-tight break-all text-zinc-900 dark:text-white">{w.url}</p>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {w.events.map(ev => (
                      <span key={ev} className="text-[8px] bg-zinc-100 dark:bg-zinc-900 text-zinc-500 px-2 py-0.5 rounded-sm uppercase font-black tracking-widest border border-zinc-200 dark:border-zinc-800">
                        {ev.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
                <Button 
                  onClick={() => handleDelete(w.id)}
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-zinc-200 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-950 p-3 rounded-md border border-zinc-100 dark:border-zinc-900">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                <span className="text-[9px] font-mono font-black text-zinc-400 flex-1 truncate uppercase tracking-widest">
                  SECRET: {w.secret.substring(0, 16)}...
                </span>
                <button 
                  onClick={() => copySecret(w.id, w.secret)}
                  className="text-zinc-400 hover:text-blue-600 transition-colors"
                >
                  {copiedId === w.id ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="p-4 bg-zinc-50/50 dark:bg-zinc-950/50 border-t border-zinc-100 dark:border-zinc-900 text-center">
        <p className="text-[9px] text-zinc-400 font-black uppercase tracking-[0.2em]">End of Registered Webhooks</p>
      </div>
    </Card>
  );
}

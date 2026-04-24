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

export function WebhookManager() {
  const [webhooks, setWebhooks] = React.useState<WebhookItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isAdding, setIsAdding] = React.useState(false);
  const [url, setUrl] = React.useState("");
  const [selectedEvents, setSelectedEvents] = React.useState<string[]>(['MONITOR_DOWN', 'REVALIDATE_SUCCESS']);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const events = [
    { id: 'REVALIDATE_SUCCESS', label: 'Revalidation Success' },
    { id: 'REVALIDATE_FAILURE', label: 'Revalidation Failure' },
    { id: 'MONITOR_DOWN', label: 'Monitor Offline' },
    { id: 'MONITOR_UP', label: 'Monitor Restored' },
  ];

  const fetchWebhooks = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("/api/webhooks", {
        headers: { Authorization: `Bearer ${token}` }
      });
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
    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      const res = await fetch("/api/webhooks", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ url, events: selectedEvents }),
      });
      if (res.ok) {
        setIsAdding(false);
        setUrl("");
        fetchWebhooks();
      }
    } catch (err) {
      alert("Failed to add webhook");
    } finally {
      setLoading(false);
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
    return <div className="p-4 text-center text-zinc-500 animate-pulse">Loading webhooks...</div>;
  }

  return (
    <Card className="p-0 overflow-hidden border-zinc-200 dark:border-zinc-800">
      <div className="p-4 border-b bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Webhook className="h-4 w-4 text-zinc-400" />
          <span className="font-bold text-sm">Outgoing Webhooks</span>
        </div>
        <Button size="sm" variant="ghost" className="h-7 text-[10px]" onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? "Cancel" : <><Plus className="h-3 w-3 mr-1" /> New Webhook</>}
        </Button>
      </div>

      {isAdding && (
        <div className="p-4 bg-zinc-50/50 dark:bg-zinc-900/30 border-b space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Payload URL</label>
            <Input 
              placeholder="https://your-api.com/webhooks/njo" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Trigger Events</label>
            <div className="grid grid-cols-2 gap-2">
              {events.map((ev) => (
                <button
                  key={ev.id}
                  onClick={() => toggleEvent(ev.id)}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-md border text-[10px] transition-all",
                    selectedEvents.includes(ev.id) 
                      ? "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-400" 
                      : "bg-white border-zinc-200 text-zinc-600 dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-400"
                  )}
                >
                  <Zap className={cn("h-3 w-3", selectedEvents.includes(ev.id) ? "fill-current" : "opacity-30")} />
                  {ev.label}
                </button>
              ))}
            </div>
          </div>
          <Button className="w-full h-9 text-xs" onClick={handleAdd} disabled={!url || selectedEvents.length === 0}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Activate Webhook"}
          </Button>
        </div>
      )}

      <div className="divide-y divide-zinc-100 dark:divide-zinc-900">
        {webhooks.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 italic text-[10px]">
            No webhooks configured.
          </div>
        ) : (
          webhooks.map((w) => (
            <div key={w.id} className="p-4 space-y-3 group">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="h-3 w-3 text-zinc-400" />
                    <p className="text-[11px] font-bold truncate">{w.url}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {w.events.map(ev => (
                      <span key={ev} className="text-[8px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded uppercase font-medium">
                        {ev.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
              
              <div className="flex items-center gap-2 bg-zinc-100/50 dark:bg-zinc-900/50 p-2 rounded-lg border border-zinc-200 dark:border-zinc-800">
                <ShieldCheck className="h-3 w-3 text-green-500" />
                <span className="text-[9px] font-mono text-zinc-500 flex-1 truncate">
                  Secret: {w.secret.substring(0, 12)}...
                </span>
                <button 
                  onClick={() => copySecret(w.id, w.secret)}
                  className="text-[9px] text-zinc-400 hover:text-blue-500 flex items-center gap-1"
                >
                  {copiedId === w.id ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}

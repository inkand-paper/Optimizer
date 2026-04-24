import * as React from "react";
import { Card, Button, Input } from "./ui-elements";
import { 
  Activity, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  Globe,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Monitor {
  id: string;
  name: string;
  url: string;
  status: 'UP' | 'DOWN' | 'DEGRADED';
  lastChecked: string;
  checks: any[];
}

export function MonitoringDashboard() {
  const [monitors, setMonitors] = React.useState<Monitor[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isAdding, setIsAdding] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newUrl, setNewUrl] = React.useState("");

  const fetchMonitors = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("/api/monitors", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setMonitors(data.monitors);
    } catch (err) {
      console.error("Failed to fetch monitors", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchMonitors();
    const interval = setInterval(fetchMonitors, 60000); // Every minute
    return () => clearInterval(interval);
  }, []);

  const handleAddMonitor = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    setLoading(true);

    try {
      const res = await fetch("/api/monitors", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: newName, url: newUrl }),
      });
      if (res.ok) {
        setIsAdding(false);
        setNewName("");
        setNewUrl("");
        fetchMonitors();
      }
    } catch (err) {
      alert("Failed to add monitor");
    } finally {
      setLoading(false);
    }
  };

  if (loading && monitors.length === 0) {
    return (
      <Card className="p-12 text-center text-zinc-500">
        <Activity className="h-8 w-8 animate-pulse mx-auto mb-4 opacity-20" />
        <p className="text-sm font-bold">Initializing Health Checks...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-bold font-display">Real-Time Monitoring</h2>
        </div>
        <Button size="sm" onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? "Cancel" : <><Plus className="h-4 w-4 mr-1" /> Add Target</>}
        </Button>
      </div>

      {isAdding && (
        <Card className="p-4 border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50">
          <form onSubmit={handleAddMonitor} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input 
              placeholder="Service Name (e.g. Production API)" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              required
            />
            <Input 
              placeholder="https://api.myapp.com/health" 
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              required
            />
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Deploy Monitor"}
            </Button>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {monitors.map((m) => (
          <Card key={m.id} className="p-0 overflow-hidden group">
            <div className="p-4 flex items-center justify-between border-b bg-white dark:bg-zinc-950">
              <div className="flex items-center gap-3 min-w-0">
                <div className={cn(
                  "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                  m.status === 'UP' ? "bg-green-50 dark:bg-green-900/10 text-green-600" : "bg-red-50 dark:bg-red-900/10 text-red-600"
                )}>
                  {m.status === 'UP' ? <CheckCircle2 className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5 animate-pulse" />}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-sm truncate">{m.name}</h3>
                  <div className="flex items-center gap-1.5">
                    <Globe className="h-3 w-3 text-zinc-400" />
                    <p className="text-[10px] text-zinc-500 truncate">{m.url}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={cn(
                  "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest",
                  m.status === 'UP' ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                )}>
                  {m.status}
                </div>
                <p className="text-[9px] text-zinc-400 mt-1 font-mono">
                  {m.checks[0]?.latency || 0}ms
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-zinc-50/30 dark:bg-zinc-900/10 flex items-center gap-4">
              <div className="flex-1 space-y-1">
                <div className="flex justify-between text-[9px] text-zinc-500 mb-1">
                  <span>Last 10 Checks</span>
                  <span>99.9% Uptime</span>
                </div>
                <div className="flex gap-1 h-6 items-end">
                  {m.checks.slice().reverse().map((c: any, i: number) => (
                    <div 
                      key={i} 
                      className={cn(
                        "flex-1 rounded-sm transition-all hover:scale-110",
                        c.status === 'UP' ? "bg-green-500/40" : "bg-red-500"
                      )}
                      style={{ height: `${Math.min((c.latency / 2000) * 100, 100)}%`, minHeight: '4px' }}
                      title={`${c.status} - ${c.latency}ms at ${new Date(c.createdAt).toLocaleTimeString()}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {monitors.length === 0 && !isAdding && (
        <div className="p-12 text-center border-2 border-dashed rounded-2xl bg-zinc-50/50 dark:bg-zinc-900/20">
          <Activity className="h-8 w-8 text-zinc-300 mx-auto mb-4" />
          <h3 className="font-bold text-zinc-600 dark:text-zinc-400">No monitoring targets active</h3>
          <p className="text-xs text-zinc-500 mt-1">Add your website or API URL to start tracking uptime and performance.</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => setIsAdding(true)}>
            Add First Monitor
          </Button>
        </div>
      )}
    </div>
  );
}

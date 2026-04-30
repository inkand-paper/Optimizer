import * as React from "react";
import { Card, Button, Input } from "./ui-elements";
import { 
  Activity, 
  Plus, 
  Globe,
  Trash2,
  Edit2,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  X,
  Crown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PricingModal } from "./pricing-modal";

interface Monitor {
  id: string;
  name: string;
  url: string;
  status: 'UP' | 'DOWN' | 'DEGRADED';
  lastChecked: string;
  checks: any[];
}

/**
 * [PRODUCTION-GRADE] - Monitoring Dashboard
 * Sovereign Obsidian Aesthetic
 */
export function MonitoringDashboard() {
  const [monitors, setMonitors] = React.useState<Monitor[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isAdding, setIsAdding] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newUrl, setNewUrl] = React.useState("");

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [showPricing, setShowPricing] = React.useState(false);
  const [currentUserPlan, setCurrentUserPlan] = React.useState("FREE");
  const [currentUserRole, setCurrentUserRole] = React.useState("DEVELOPER");

  React.useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.plan) setCurrentUserPlan(u.plan);
        if (u.role) setCurrentUserRole(u.role);
      } catch (e) {}
    }
  }, []);

  const fetchMonitors = async () => {
    try {
      const res = await fetch("/api/monitors", { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setMonitors(data.monitors || []);
      }
    } catch (err) {
      console.error("Failed to fetch monitors", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchMonitors();
    const interval = setInterval(fetchMonitors, 10000); 
    return () => clearInterval(interval);
  }, []);

  const handleAddMonitor = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/monitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ name: newName, url: newUrl }),
      });
      
      if (res.ok) {
        setIsAdding(false);
        setNewName("");
        setNewUrl("");
        setErrorMessage(null);
        fetchMonitors();
      } else if (res.status === 403) {
        if (currentUserRole === 'ADMIN') {
          setErrorMessage("Infrastructure Provisioning Error: Check Permissions.");
        } else {
          setShowPricing(true);
          setErrorMessage(null); 
        }
      } else {
        setErrorMessage("Deployment Failed: Infrastructure mismatch.");
      }
    } catch (err) {
      setErrorMessage("Network Interrupt: Deployment stalled.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMonitor = async (id: string) => {
    if (!confirm("Are you sure you want to decommission this monitor?")) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/monitors/${id}`, { method: "DELETE", credentials: 'include' });
      if (res.ok) setMonitors(monitors.filter(m => m.id !== id));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditSubmit = async (id: string, e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/monitors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ name: editName })
      });
      if (res.ok) {
        const data = await res.json();
        setMonitors(monitors.map(m => m.id === id ? { ...m, name: data.monitor.name } : m));
        setEditingId(null);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading && monitors.length === 0) {
    return (
      <Card className="p-12 text-center bg-zinc-50 dark:bg-black border-zinc-200 dark:border-zinc-800">
        <Activity className="h-8 w-8 animate-pulse mx-auto mb-4 text-blue-600 opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Initializing Infrastructure Checks...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight">Real-Time Infrastructure</h2>
            <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Global Asset Monitoring</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setIsAdding(!isAdding)} className="h-10 px-6 font-black uppercase tracking-widest text-[10px]">
          {isAdding ? "Cancel" : <><Plus className="h-3 w-3 mr-2" /> Provision Target</>}
        </Button>
      </div>

      {isAdding && (
        <Card className="p-6 bg-zinc-50 dark:bg-black border-zinc-200 dark:border-zinc-800 animate-in fade-in slide-in-from-top-4">
          <form onSubmit={handleAddMonitor} className="flex flex-col sm:grid sm:grid-cols-3 gap-3">
            <Input 
              placeholder="Infrastructure ID (e.g. Production)" 
              value={newName}
              onChange={(e) => { setNewName(e.target.value); setErrorMessage(null); }}
              className="h-12 bg-white dark:bg-zinc-950 font-bold"
              required
            />
            <Input 
              placeholder="https://infrastructure-endpoint.io" 
              value={newUrl}
              onChange={(e) => { setNewUrl(e.target.value); setErrorMessage(null); }}
              className="h-12 bg-white dark:bg-zinc-950 font-bold"
              required
            />
            <Button type="submit" disabled={loading} className="h-12 font-black uppercase tracking-widest text-xs">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Execute Provisioning"}
            </Button>
          </form>
          
          {errorMessage && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-md">
              <p className="text-[10px] font-black uppercase tracking-widest text-red-600">{errorMessage}</p>
            </div>
          )}
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {monitors.map((m) => (
          <Card key={m.id} className="p-0 overflow-hidden bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 shadow-sm group">
            <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 dark:border-zinc-900 relative gap-6">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className={cn(
                  "h-14 w-14 rounded-md flex items-center justify-center shrink-0 border",
                  m.status === 'UP' 
                    ? "bg-zinc-50 dark:bg-zinc-950 border-emerald-500/20 text-emerald-500" 
                    : "bg-red-50 dark:bg-red-950/20 border-red-500/20 text-red-500"
                )}>
                  {m.status === 'UP' ? <CheckCircle2 className="h-7 w-7" /> : <AlertTriangle className="h-7 w-7 animate-pulse" />}
                </div>
                
                <div className="min-w-0 flex-1">
                  {editingId === m.id ? (
                    <form onSubmit={(e) => handleEditSubmit(m.id, e)} className="flex items-center gap-2">
                      <Input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8 font-bold text-xs" autoFocus />
                      <Button size="sm" type="submit" disabled={isProcessing} className="h-8 px-4 text-[9px] font-black uppercase tracking-widest">Save</Button>
                      <Button size="sm" type="button" variant="ghost" onClick={() => setEditingId(null)} className="h-8 w-8"><X className="h-4 w-4"/></Button>
                    </form>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h3 className="font-black text-lg uppercase tracking-tight truncate">{m.name}</h3>
                      <button onClick={() => { setEditingId(m.id); setEditName(m.name); }} className="p-1 text-zinc-300 hover:text-blue-600 transition-colors">
                        <Edit2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 mt-1">
                    <Globe className="h-3 w-3 text-zinc-400" />
                    <p className="text-[10px] text-zinc-500 font-bold tracking-tight truncate">{m.url}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2">
                <div className={cn(
                  "text-[9px] font-black px-3 py-1 rounded-sm uppercase tracking-[0.2em] border",
                  m.status === 'UP' 
                    ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500" 
                    : "bg-red-500/5 border-red-500/20 text-red-500"
                )}>
                  {m.status}
                </div>
                <p className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">
                  {new Date(m.lastChecked).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
              </div>

              <button 
                onClick={() => handleDeleteMonitor(m.id)}
                className="absolute top-2 right-2 p-1.5 text-zinc-200 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
            
            <div className="p-6 bg-zinc-50/50 dark:bg-zinc-950/50 flex flex-col gap-4">
              <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest text-zinc-500">
                <span>Infrastructure Latency Matrix</span>
                <span className="text-zinc-900 dark:text-zinc-100 tabular-nums">
                  {m.checks.length > 0 ? `${m.checks[0].latency}ms` : 'NO DATA'}
                </span>
              </div>
              <div className="flex gap-[1px] h-14 items-end relative group/chart">
                {(() => {
                  const visibleChecks = m.checks.slice(0, 60).reverse();
                  const maxLatency = Math.max(...visibleChecks.map(c => c.latency), 100);
                  
                  return visibleChecks.map((c: any, i: number) => {
                    const heightPct = Math.max(10, (c.latency / maxLatency) * 100);
                    return (
                      <div 
                        key={i} 
                        className={cn(
                          "flex-1 rounded-t-[1px] transition-all duration-300",
                          c.status === 'UP' ? "bg-emerald-500/30" : "bg-red-600"
                        )}
                        style={{ height: `${heightPct}%` }}
                      />
                    );
                  });
                })()}
                {m.checks.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black uppercase tracking-widest text-zinc-500">
                    <Loader2 className="h-3 w-3 animate-spin mr-2" />
                    Gathering Metrics...
                  </div>
                )}
              </div>
              <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-zinc-400">
                <span>HISTORICAL</span>
                <span>REAL-TIME</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} currentPlan={currentUserPlan} />
    </div>
  );
}

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

export function MonitoringDashboard() {
  const [monitors, setMonitors] = React.useState<Monitor[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isAdding, setIsAdding] = React.useState(false);
  const [newName, setNewName] = React.useState("");
  const [newUrl, setNewUrl] = React.useState("");

  // Edit state
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
      
      if (!res.ok) {
        const text = await res.text();
        console.error("Monitor fetch error:", res.status, text);
        return;
      }

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
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
    // High-frequency polling for "Live" feel (every 10 seconds)
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
          setErrorMessage("Admin Permission Error: Please check your database role.");
        } else {
          setShowPricing(true);
          setErrorMessage(null); 
        }
      } else {
        setErrorMessage("Failed to add monitor. Please try again.");
      }
    } catch (err) {
      setErrorMessage("A network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMonitor = async (id: string) => {
    if (!confirm("Are you sure you want to delete this monitor? All historical data will be lost.")) return;
    
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/monitors/${id}`, {
        method: "DELETE",
        credentials: 'include'
      });
      if (res.ok) {
        setMonitors(monitors.filter(m => m.id !== id));
      } else {
        alert("Failed to delete monitor");
      }
    } catch (err) {
      console.error(err);
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
      } else {
        alert("Failed to update monitor");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
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
        <Card className="p-4 border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 transition-all duration-300 animate-in fade-in slide-in-from-top-4">
          <form onSubmit={handleAddMonitor} className="flex flex-col sm:grid sm:grid-cols-3 gap-3">
            <Input 
              placeholder="Service Name (e.g. Production API)" 
              value={newName}
              onChange={(e) => { setNewName(e.target.value); setErrorMessage(null); }}
              className="h-10 sm:h-9"
              required
            />
            <Input 
              placeholder="https://api.myapp.com/health" 
              value={newUrl}
              onChange={(e) => { setNewUrl(e.target.value); setErrorMessage(null); }}
              className="h-10 sm:h-9"
              required
            />
            <Button type="submit" disabled={loading} className="h-10 sm:h-9">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Deploy Monitor"}
            </Button>
          </form>
          
          <p className="mt-2 text-[10px] text-zinc-400 italic">
            Note: Target URL must start with **https://** for secure monitoring.
          </p>
          
          {errorMessage && (
            <div className="mt-4 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/30 rounded-2xl animate-in zoom-in-95">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-rose-700 dark:text-rose-400 mb-1">{errorMessage}</p>
                  
                  {/* [MONETIZATION] Only show upgrade prompts to non-admins */}
                  {currentUserRole !== 'ADMIN' ? (
                    <>
                      <p className="text-[10px] text-rose-600/70 dark:text-rose-500/70 leading-relaxed mb-3">
                        Your current plan has reached its capacity. Upgrade to unlock more slots and higher frequency monitoring.
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-2 rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 cursor-pointer hover:bg-blue-700 transition-colors">
                          <p className="text-[9px] font-black uppercase tracking-widest opacity-80 mb-0.5">Recommended</p>
                          <p className="text-xs font-bold">Upgrade to PRO</p>
                        </div>
                        <div className="p-2 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 cursor-pointer hover:bg-zinc-50 transition-colors">
                          <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">Enterprise</p>
                          <p className="text-xs font-bold">View Business</p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-[10px] text-rose-600/70 dark:text-rose-500/70 leading-relaxed mb-3 italic">
                      Admin Hint: Check the URL format. It must start with **https://**.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {monitors.map((m) => (
          <Card key={m.id} className="p-0 overflow-hidden group hover:shadow-md transition-shadow relative">
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between border-b bg-white dark:bg-zinc-950 relative gap-4">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className={cn(
                  "h-12 w-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                  m.status === 'UP' ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400" : "bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400"
                )}>
                  {m.status === 'UP' ? <CheckCircle2 className="h-6 w-6" /> : <AlertTriangle className="h-6 w-6 animate-pulse" />}
                </div>
                
                <div className="min-w-0 flex-1">
                  {editingId === m.id ? (
                    <form onSubmit={(e) => handleEditSubmit(m.id, e)} className="flex items-center gap-2 max-w-sm">
                      <Input 
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)} 
                        className="h-7 text-sm" 
                        autoFocus
                      />
                      <Button size="sm" type="submit" disabled={isProcessing} className="h-7 px-2 bg-blue-600 text-white">Save</Button>
                      <Button size="sm" type="button" variant="ghost" onClick={() => setEditingId(null)} className="h-7 px-2"><X className="h-4 w-4"/></Button>
                    </form>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base truncate">{m.name}</h3>
                      <button 
                        onClick={() => { setEditingId(m.id); setEditName(m.name); }}
                        className="p-1 text-zinc-400 hover:text-blue-500 transition-opacity"
                        title="Edit Name"
                      >
                        <Edit2 className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Globe className="h-3 w-3 text-zinc-400" />
                    <p className="text-xs text-zinc-500 truncate max-w-[150px] sm:max-w-none">{m.url}</p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-0 border-zinc-100 dark:border-zinc-900">
                <div className={cn(
                  "text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest",
                  m.status === 'UP' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                )}>
                  {m.status}
                </div>
                {m.lastChecked && (
                  <p className="text-[10px] text-zinc-400">
                    {new Date(m.lastChecked).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>

              {/* Delete Button (absolute positioning top-right, visible on hover) */}
              <button 
                onClick={() => handleDeleteMonitor(m.id)}
                disabled={isProcessing}
                className="absolute top-2 right-2 p-1.5 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 rounded-md opacity-0 group-hover:opacity-100 transition-all"
                title="Delete Monitor"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-4 bg-zinc-50/50 dark:bg-zinc-900/10 flex flex-col gap-3">
              <div className="flex justify-between items-end text-xs text-zinc-500">
                <span className="font-medium">Recent Check Latency</span>
                <span className="font-mono text-zinc-700 dark:text-zinc-300">
                  {m.checks.length > 0 ? `${m.checks[0].latency}ms` : 'No data'}
                </span>
              </div>
              <div className="flex gap-[2px] h-16 items-end border-b border-zinc-200 dark:border-zinc-800/50 pb-1 relative group/chart">
                {(() => {
                  const visibleChecks = m.checks.slice(0, 40).reverse();
                  const maxLatency = Math.max(...visibleChecks.map(c => c.latency), 100); // Dynamic ceiling
                  
                  return visibleChecks.map((c: any, i: number) => {
                    const heightPct = Math.max(8, (c.latency / maxLatency) * 100);
                    const isLatest = i === visibleChecks.length - 1;
                    
                    return (
                      <div 
                        key={i} 
                        className={cn(
                          "flex-1 rounded-t-sm transition-all duration-500 hover:brightness-110 relative",
                          c.status === 'UP' 
                            ? "bg-gradient-to-t from-emerald-500/10 to-emerald-500/40" 
                            : "bg-rose-500",
                          isLatest && "animate-pulse brightness-125 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                        )}
                        style={{ height: `${heightPct}%` }}
                        title={`${c.status} - ${c.latency}ms at ${new Date(c.createdAt).toLocaleTimeString()}`}
                      />
                    );
                  });
                })()}
                {m.checks.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-[10px] font-medium text-zinc-400 uppercase tracking-tighter">
                    <Loader2 className="h-3 w-3 animate-spin mr-2" />
                    Gathering Intelligence...
                  </div>
                )}
              </div>
              <div className="flex justify-between text-[10px] text-zinc-400">
                <span>Older</span>
                <span>Now</span>
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

      <PricingModal 
        isOpen={showPricing} 
        onClose={() => setShowPricing(false)} 
        currentPlan={currentUserPlan} 
      />
    </div>
  );
}


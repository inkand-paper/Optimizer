"use client";

import * as React from "react";
import { Card, Button, Input, StatusDot, Badge } from "./ui-elements";
import { 
  Activity, 
  Globe, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Plus, 
  Loader2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MonitorItem {
  id: string;
  name: string;
  url: string;
  status: "UP" | "DOWN";
  latencyHistory: number[];
  lastChecked: string;
}

export function MonitoringDashboard() {
  const [monitors, setMonitors] = React.useState<MonitorItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isAdding, setIsAdding] = React.useState(false);
  
  const [name, setName] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [addingState, setAddingState] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  const fetchMonitors = async () => {
    try {
      const res = await fetch("/api/monitors", { credentials: 'include' });
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
    const interval = setInterval(fetchMonitors, 60000); 
    return () => clearInterval(interval);
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingState(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/monitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ name, url }),
      });
      if (res.ok) {
        setIsAdding(false);
        setName("");
        setUrl("");
        fetchMonitors();
      } else {
        const data = await res.json();
        setErrorMessage(data.message || "Failed to provision asset.");
      }
    } catch (err) {
      setErrorMessage("Network anomaly. Provisioning aborted.");
    } finally {
      setAddingState(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Decommission this asset?")) return;
    try {
      const res = await fetch(`/api/monitors/${id}`, { method: "DELETE", credentials: 'include' });
      if (res.ok) setMonitors(monitors.filter(m => m.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading && monitors.length === 0) {
    return (
      <Card className="p-12 text-center bg-card border-border">
        <Activity className="h-8 w-8 animate-pulse mx-auto mb-4 text-np-gold opacity-20" />
        <p className="label-category text-muted-foreground">Initializing Infrastructure Checks...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-card p-4 rounded-card border border-border shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-ui bg-np-gold/10 flex items-center justify-center text-np-gold border border-np-gold/20">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-[16px] font-semibold tracking-tight uppercase">Real-Time Infrastructure</h2>
            <p className="label-category text-[10px] mt-0.5">Global Asset Monitoring</p>
          </div>
        </div>
        <Button size="sm" onClick={() => setIsAdding(!isAdding)} className="h-10 px-6 font-semibold uppercase tracking-widest text-[11px]">
          {isAdding ? "Cancel" : <><Plus className="h-3 w-3 mr-1.5" /> Provision Target</>}
        </Button>
      </div>

      {isAdding && (
        <Card className="p-6 bg-muted border-border animate-in fade-in slide-in-from-top-4">
          <form onSubmit={handleAdd} className="space-y-5 max-w-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="label-category text-[10px]">Asset Identity</label>
                <Input 
                  placeholder="e.g. Primary Gateway" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 bg-card font-semibold uppercase text-[12px]"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="label-category text-[10px]">Endpoint URL</label>
                <Input 
                  placeholder="https://api.gateway.com/health" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="h-11 bg-card font-mono text-[12px]"
                  required
                />
              </div>
            </div>
            
            {errorMessage && (
              <div className="p-3 bg-np-crimson/10 border border-np-crimson/20 rounded-ui flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-np-crimson" />
                <p className="text-[11px] font-semibold uppercase tracking-widest text-np-crimson">{errorMessage}</p>
              </div>
            )}

            <Button type="submit" className="w-full h-11 uppercase tracking-widest text-[11px]" disabled={!name || !url || addingState}>
              {addingState ? <Loader2 className="h-4 w-4 animate-spin" /> : "Deploy Monitoring Probe"}
            </Button>
          </form>
        </Card>
      )}

      <div className="space-y-4">
        {monitors.length === 0 ? (
          <Card className="p-16 text-center border-dashed">
            <p className="label-category text-muted-foreground">No assets provisioned. Infrastructure empty.</p>
          </Card>
        ) : (
          monitors.map((m) => {
            const history = m.latencyHistory || [];
            const currentLatency = history.length > 0 ? history[history.length - 1] : 0;
            return (
              <Card key={m.id} className="p-0 overflow-hidden bg-card border-border shadow-sm group">
                <div className="p-5 flex items-center justify-between border-b border-border bg-muted/20">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "h-12 w-12 rounded-ui border flex items-center justify-center shrink-0",
                      m.status === 'UP' ? "bg-np-teal/10 border-np-teal/20 text-np-teal" : "bg-np-crimson/10 border-np-crimson/20 text-np-crimson"
                    )}>
                      {m.status === 'UP' ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-[18px] font-bold tracking-tight uppercase">{m.name}</h3>
                        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                      </div>
                      <p className="text-[11px] text-muted-foreground font-mono flex items-center gap-2">
                        {m.url}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-3">
                      <Badge variant={m.status === 'UP' ? 'success' : 'danger'} className="text-[10px] px-2.5 py-1">
                        {m.status}
                      </Badge>
                      <button 
                        onClick={() => handleDelete(m.id)}
                        className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-np-crimson transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mono-gold text-[10px] opacity-70">
                      {new Date(m.lastChecked).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </p>
                  </div>
                </div>

                {/* Graph Area */}
                <div className="p-6 bg-np-obsidian">
                  <div className="flex items-center justify-between mb-4">
                    <span className="label-category text-[9px] text-np-slate">Infrastructure Latency Matrix</span>
                    <span className="mono-gold text-[12px] font-bold">{currentLatency}MS</span>
                  </div>
                  
                  <div className="h-16 flex items-end gap-1 w-full mt-2">
                    {/* Render exact history if exists, else filler */}
                    {history.length > 0 ? (
                      history.map((lat, i) => {
                        const heightPercent = Math.max(10, Math.min(100, (lat / 1000) * 100));
                        const isHigh = lat > 800;
                        return (
                          <div 
                            key={i} 
                            className={cn(
                              "flex-1 rounded-t-[2px] transition-all duration-500",
                              isHigh ? "bg-np-crimson" : "bg-np-teal"
                            )}
                            style={{ height: `${heightPercent}%`, opacity: (i + 1) / history.length }}
                            title={`${lat}ms`}
                          />
                        )
                      })
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] uppercase font-bold text-np-slate tracking-widest border border-dashed border-np-slate/20">
                        Gathering Telemetry...
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-between mt-3 text-[8px] font-black uppercase tracking-[0.2em] text-np-slate">
                    <span>Historical</span>
                    <span>Real-Time</span>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  );
}

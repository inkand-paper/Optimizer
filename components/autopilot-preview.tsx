"use client";

import * as React from "react";
import { Card, Button, Badge } from "@/components/ui-elements";
import { Cpu, ShieldCheck, AlertTriangle, Zap, Check, RotateCcw, Activity, RefreshCw, Globe, ArrowDown, Database } from "lucide-react";
import { cn } from "@/lib/utils";

type AutopilotMode = "observe" | "recommend" | "autopilot";

interface Incident {
  id: string;
  title: string;
  severity: string;
  status: string;
  mode: string;
  targetNode: string;
  impact: string;
  rootCause: string;
  confidence: number;
  recommendedFix: string;
  actionTaken?: string | null;
}

export function AutopilotPreview() {
  const [mode, setMode] = React.useState<AutopilotMode>("recommend");
  const [incidents, setIncidents] = React.useState<Incident[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionStatus, setActionStatus] = React.useState<string | null>(null);
  const [executing, setExecuting] = React.useState(false);

  const activeIncident = incidents.find((i) => i.status === "OPEN") || incidents[0];

  React.useEffect(() => {
    fetchIncidents();
  }, []);

  async function fetchIncidents() {
    try {
      const res = await fetch("/api/autopilot/incidents");
      if (res.ok) {
        const data = await res.json();
        setIncidents(data.incidents || []);
      }
    } catch (err) {
      console.error("[AUTOPILOT_FETCH_ERR]", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(actionName: string, status = "REMEDIATED") {
    if (!activeIncident) return;
    setExecuting(true);

    try {
      const res = await fetch("/api/autopilot/incidents", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          incidentId: activeIncident.id,
          actionTaken: actionName,
          status,
        }),
      });

      if (res.ok) {
        setActionStatus(`Executed: ${actionName}`);
        fetchIncidents();
        setTimeout(() => setActionStatus(null), 4000);
      }
    } catch (err) {
      console.error("[AUTOPILOT_ACTION_ERR]", err);
    } finally {
      setExecuting(false);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* ── Mode Header ── */}
      <Card className="p-6 bg-gradient-to-r from-np-gold/5 via-background to-background border-np-gold/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-ui bg-np-gold/10 border border-np-gold/30 flex items-center justify-center text-np-gold">
              <Cpu className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold uppercase tracking-tight">NexPulse Autopilot</h2>
                <span className="bg-np-gold/20 text-np-gold font-bold text-[9px] uppercase tracking-widest px-2 py-0.5 rounded border border-np-gold/30">Engine v2.0</span>
              </div>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                Autonomous root-cause detection & remediation guardrails.
              </p>
            </div>
          </div>

          {/* Mode selector */}
          <div className="flex items-center bg-muted/40 p-1 rounded-ui border border-border">
            {(["observe", "recommend", "autopilot"] as AutopilotMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "px-3 py-1.5 rounded-ui text-[11px] font-bold uppercase tracking-wider transition-all",
                  mode === m
                    ? "bg-np-gold text-black shadow-md"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Current Protocol: <strong className="text-foreground uppercase">{mode} MODE</strong>
          </span>
          <span>
            {mode === "observe" && "AI observes telemetry without making changes."}
            {mode === "recommend" && "AI proposes fixes requiring 1-click human confirmation."}
            {mode === "autopilot" && "AI automatically executes pre-approved safe remediations."}
          </span>
        </div>
      </Card>

      {/* ── Active Incident & Root Cause Graph ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Root Cause Graph */}
        <Card className="lg:col-span-7 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-[13px] font-semibold uppercase tracking-wider flex items-center gap-2">
              <Activity className="h-4 w-4 text-np-gold" />
              Root Cause Correlation Graph
            </h3>
            <span className="text-[10px] font-mono text-np-teal bg-np-teal/10 px-2 py-0.5 rounded border border-np-teal/20">
              Confidence: {activeIncident?.confidence || 89}%
            </span>
          </div>

          {/* Topology diagram */}
          <div className="p-5 bg-black/40 rounded-ui border border-border font-mono text-[11px] space-y-4">
            <div className="flex items-center justify-between text-muted-foreground pb-2 border-b border-border/40 text-[10px]">
              <span>NODE AGGREGATION</span>
              <span>LATENCY IMPACT</span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded bg-muted/20 border border-border/40">
                <span className="text-foreground font-semibold flex items-center gap-2">
                  <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  Edge Router (Cloudflare)
                </span>
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  42ms · Normal
                </span>
              </div>

              <div className="flex justify-center text-muted-foreground">
                <ArrowDown className="h-4 w-4" />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded bg-muted/20 border border-border/40">
                <span className="text-foreground font-semibold flex items-center gap-2">
                  <Zap className="h-3.5 w-3.5 text-np-gold" />
                  API Service ({activeIncident?.targetNode || "/api/products"})
                </span>
                <span className="text-np-crimson font-bold flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-np-crimson animate-pulse" />
                  1.8s · Degradation
                </span>
              </div>

              <div className="flex justify-center text-muted-foreground">
                <ArrowDown className="h-4 w-4" />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded bg-np-crimson/10 border border-np-crimson/30">
                <div>
                  <span className="text-np-crimson font-bold flex items-center gap-2">
                    <Database className="h-3.5 w-3.5" />
                    PostgreSQL (Query Regression)
                  </span>
                  <p className="text-[10px] text-muted-foreground font-sans mt-0.5">
                    {activeIncident?.rootCause || "Introduced in deployment #a83f21"}
                  </p>
                </div>
                <span className="text-np-crimson font-bold">p95 +320%</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-muted/20 rounded-ui border border-border text-[11px] text-muted-foreground flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-np-gold shrink-0 mt-0.5" />
            <p>
              NexPulse AI automatically correlated deployment commit <code className="text-foreground">#a83f21</code> with the PostgreSQL IOPS spike 4 minutes later.
            </p>
          </div>
        </Card>

        {/* Right: Autopilot Action Center */}
        <Card className="lg:col-span-5 p-6 flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-np-crimson">
                <AlertTriangle className="h-4 w-4" />
                <h3 className="text-[13px] font-bold uppercase">{activeIncident?.title || "Active Remediation"}</h3>
              </div>
              <Badge variant={activeIncident?.status === "OPEN" ? "danger" : "success"} className="text-[8px] uppercase tracking-wider">
                {activeIncident?.status || "OPEN"}
              </Badge>
            </div>

            <p className="text-[12px] text-muted-foreground leading-relaxed mb-4">
              <strong className="text-foreground">Impact:</strong> {activeIncident?.impact || "~18% of user requests experiencing latency timeouts."}
            </p>

            <div className="p-4 bg-background rounded-ui border border-border space-y-3 mb-6">
              <p className="text-[11px] font-semibold text-np-gold uppercase tracking-wider">Recommended Remediation</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {activeIncident?.recommendedFix || "Roll back deployment #a83f21 and flush Redis query cache pool"}
              </p>
            </div>
          </div>

          {actionStatus && (
            <div className="p-3 bg-np-teal/10 border border-np-teal/30 text-np-teal text-[11px] rounded-ui text-center font-semibold">
              {actionStatus}
            </div>
          )}

          <div className="space-y-2 pt-4 border-t border-border">
            <Button
              onClick={() => handleAction("Rollback Deployment #a83f21", "REMEDIATED")}
              disabled={executing || activeIncident?.status === "REMEDIATED"}
              className="w-full np-btn-primary h-10 text-[11px] uppercase tracking-wider justify-center"
            >
              {executing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : activeIncident?.status === "REMEDIATED" ? (
                <><Check className="h-4 w-4 mr-2" /> Remediation Applied</>
              ) : (
                <><RotateCcw className="h-4 w-4 mr-2" /> Execute Recommended Rollback</>
              )}
            </Button>
            <Button
              onClick={() => handleAction("Dismiss Incident", "DISMISSED")}
              variant="outline"
              disabled={executing || activeIncident?.status === "REMEDIATED"}
              className="w-full h-9 text-[10px] uppercase tracking-wider text-muted-foreground"
            >
              Dismiss Incident
            </Button>
          </div>
        </Card>

      </div>
    </div>
  );
}

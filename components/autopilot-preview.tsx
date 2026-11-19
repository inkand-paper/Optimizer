"use client";

import * as React from "react";
import { Card, Button, Badge } from "@/components/ui-elements";
import {
  Workflow, ShieldCheck, AlertTriangle, Zap, Check, RotateCcw,
  RefreshCw, Globe, ArrowDown, Database, CheckCircle2,
} from "lucide-react";
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

  const fetchIncidents = React.useCallback(async () => {
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
  }, []);

  React.useEffect(() => {
    void fetchIncidents();
  }, [fetchIncidents]);

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

  async function handleSimulateAnomaly() {
    setExecuting(true);
    try {
      const res = await fetch("/api/autopilot/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: "Memory Leak Anomaly Detected",
          severity: "HIGH",
          mode: mode.toUpperCase(),
          targetNode: "/api/checkout",
          impact: "~24% of checkout requests failing with memory allocation limits",
          rootCause: "Unclosed DB connection pool leak in service release #b92e10",
          confidence: 94,
          recommendedFix: "Restart service container and recycle worker connection pools",
        }),
      });
      if (res.ok) {
        setActionStatus("Simulated Telemetry Anomaly Detected!");
        fetchIncidents();
        setTimeout(() => setActionStatus(null), 4000);
      }
    } catch (err) {
      console.error("[SIMULATE_ERR]", err);
    } finally {
      setExecuting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* ── Mode Header ── */}
      <Card className="p-5 border-border">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-ui bg-muted border border-border flex items-center justify-center text-foreground">
              <Workflow className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground">Incident Runbooks &amp; Diagnostics</h2>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Telemetry anomaly correlation, commit attribution &amp; rollback runbooks.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Mode selector */}
            <div className="flex items-center bg-muted p-1 rounded-ui border border-border">
              {([
                { id: "observe", label: "Observe" },
                { id: "recommend", label: "Interactive" },
                { id: "autopilot", label: "Automated" },
              ] as { id: AutopilotMode; label: string }[]).map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className={cn(
                    "px-3 py-1 rounded-ui text-xs font-medium transition-colors cursor-pointer",
                    mode === m.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-status-up" />
            Active policy: <strong className="text-foreground capitalize">{mode === "autopilot" ? "Automated Runbook" : mode === "recommend" ? "Interactive Triage" : "Telemetry Monitor"}</strong>
          </span>
          <span className="text-[11px]">
            {mode === "observe" && "Passively records anomalies and tracks culprit commits without modifying services."}
            {mode === "recommend" && "Correlates root causes and proposes rollback runbooks requiring 1-click engineer approval."}
            {mode === "autopilot" && "Automatically executes pre-approved zero-downtime rollbacks when confidence exceeds 80%."}
          </span>
        </div>
      </Card>

      {/* ── Incident State ── */}
      {!activeIncident ? (
        <Card className="p-12 text-center border-border space-y-2">
          <CheckCircle2 className="h-6 w-6 text-status-up mx-auto" strokeWidth={1.5} />
          <h3 className="text-sm font-medium text-foreground">No active anomalies detected</h3>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            All monitored endpoints and services are operating within expected latency thresholds. When a regression or outage occurs, root cause analysis will be displayed here.
          </p>
          <div className="pt-2">
            <Button onClick={handleSimulateAnomaly} disabled={executing} variant="outline" className="np-btn-outline h-8 px-3 text-xs">
              Simulate Telemetry Anomaly
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Root Cause Graph */}
          <Card className="lg:col-span-7 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-semibold text-foreground flex items-center gap-2">
                <Workflow className="h-4 w-4 text-foreground" strokeWidth={1.5} />
                Root cause correlation
              </h3>
              <span className="text-xs font-mono text-status-up bg-status-up/10 px-2 py-0.5 rounded border border-status-up/20 flex items-center gap-1.5">
                {loading && <RefreshCw className="h-3 w-3 animate-spin" />}
                Confidence: {activeIncident.confidence || 89}%
              </span>
            </div>

            {/* Topology diagram */}
            <div className="p-4 bg-muted/40 text-foreground rounded-ui border border-border font-mono text-xs space-y-3">
              <div className="flex items-center justify-between text-muted-foreground pb-2 border-b border-border text-[11px]">
                <span>Node</span>
                <span>Observed latency</span>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-2 rounded bg-background border border-border">
                  <span className="text-foreground font-medium flex items-center gap-2">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                    Edge gateway
                  </span>
                  <span className="text-status-up flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-status-up" />
                    Nominal
                  </span>
                </div>

                <div className="flex justify-center text-muted-foreground">
                  <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.5} />
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-background border border-border">
                  <span className="text-foreground font-medium flex items-center gap-2">
                    <Zap className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                    Target endpoint ({activeIncident.targetNode || "Service"})
                  </span>
                  <span className="text-status-down font-medium flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-status-down" />
                    Degraded
                  </span>
                </div>

                {activeIncident.rootCause && (
                  <>
                    <div className="flex justify-center text-muted-foreground">
                      <ArrowDown className="h-3.5 w-3.5" strokeWidth={1.5} />
                    </div>

                    <div className="p-2.5 rounded bg-status-down/10 border border-status-down/20 text-status-down">
                      <div className="flex items-center gap-2 font-medium">
                        <Database className="h-3.5 w-3.5" strokeWidth={1.5} />
                        <span>Identified root cause</span>
                      </div>
                      <p className="text-xs text-muted-foreground font-sans mt-1">
                        {activeIncident.rootCause}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="p-3 bg-muted/30 rounded-ui border border-border text-xs text-muted-foreground flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 text-foreground shrink-0 mt-0.5" strokeWidth={1.5} />
              <p>
                Correlation based on active probe telemetry, response error codes, and deployment timestamps.
              </p>
            </div>
          </Card>

          {/* Right: Autopilot Action Center */}
          <Card className="lg:col-span-5 p-5 flex flex-col justify-between space-y-5">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-status-down">
                  <AlertTriangle className="h-4 w-4" strokeWidth={1.5} />
                  <h3 className="text-xs font-semibold text-foreground">{activeIncident.title}</h3>
                </div>
                <Badge variant={activeIncident.status === "OPEN" ? "danger" : "neutral"} className="text-[10px]">
                  {activeIncident.status}
                </Badge>
              </div>

              {activeIncident.impact && (
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  <strong className="text-foreground">Impact:</strong> {activeIncident.impact}
                </p>
              )}

              {activeIncident.recommendedFix && (
                <div className="p-3.5 bg-muted/40 rounded-ui border border-border space-y-1 mb-4">
                  <p className="text-xs font-medium text-foreground">Recommended action</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {activeIncident.recommendedFix}
                  </p>
                </div>
              )}
            </div>

            {actionStatus && (
              <div className="p-2.5 bg-status-up/10 border border-status-up/20 text-status-up text-xs rounded-ui text-center font-medium">
                {actionStatus}
              </div>
            )}

            <div className="space-y-2 pt-3 border-t border-border">
              {activeIncident.recommendedFix && (
                <Button
                  onClick={() => handleAction(activeIncident.recommendedFix || "Remediate", "REMEDIATED")}
                  disabled={executing || activeIncident.status === "REMEDIATED"}
                  className="w-full text-xs justify-center"
                >
                  {executing ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : activeIncident.status === "REMEDIATED" ? (
                    <><Check className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} /> Remediation applied</>
                  ) : (
                    <><RotateCcw className="h-3.5 w-3.5 mr-1.5" strokeWidth={1.5} /> Apply remediation</>
                  )}
                </Button>
              )}
              <Button
                onClick={() => handleAction("Dismiss Incident", "DISMISSED")}
                variant="outline"
                disabled={executing || activeIncident.status === "REMEDIATED"}
                className="w-full text-xs text-muted-foreground"
              >
                Dismiss incident
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

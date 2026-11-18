"use client";

import * as React from "react";
import { Button, Card } from "@/components/ui-elements";
import {
  Activity,
  Cpu,
  DollarSign,
  Zap,
  Terminal,
  GitBranch,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TabType = "autopilot" | "finops" | "cache" | "mcp" | "prbot";

export function LandingFeatureShowcase() {
  const [activeTab, setActiveTab] = React.useState<TabType>("autopilot");

  // Interactive Demo States
  const [anomalyState, setAnomalyState] = React.useState<"normal" | "anomaly" | "remediated">("normal");
  const [autopilotLog, setAutopilotLog] = React.useState<string[]>([]);
  const [zombies, setZombies] = React.useState([
    { id: "1", name: "staging-db-replica-v2", cost: 51, type: "Supabase DB" },
    { id: "2", name: "ebs-vol-08f3-unattached", cost: 38, type: "AWS EBS" },
    { id: "3", name: "legacy-logs-bucket", cost: 29, type: "Vercel Storage" },
  ]);
  const [savedCost, setSavedCost] = React.useState(0);
  const [cacheTag, setCacheTag] = React.useState("products");
  const [purgedCount, setPurgedCount] = React.useState(142);
  const [purging, setPurging] = React.useState(false);
  const [mcpTested, setMcpTested] = React.useState(false);
  const [prRepo, setPrRepo] = React.useState("inkand-paper/Optimizer");
  const [botAuditing, setBotAuditing] = React.useState(false);
  const [botAudited, setBotAudited] = React.useState(true);

  const handleTriggerAnomaly = () => {
    setAnomalyState("anomaly");
    setAutopilotLog([
      "12:44:02 [ALERT] Latency spike detected on /api/products (2,420ms > 200ms threshold)",
      "12:44:03 [ANALYSIS] Correlating telemetry with recent git deployments...",
      "12:44:04 [ROOT CAUSE] Commit #a83f21 introduced unindexed JOIN query in DB handler.",
      "12:44:05 [GUARD] Action recommended: Execute deployment rollback.",
    ]);
  };

  const handleExecuteRemediation = () => {
    setAnomalyState("remediated");
    setAutopilotLog((prev) => [
      ...prev,
      "12:44:12 [ACTION] Executing zero-downtime rollback to deployment #a83f20...",
      "12:44:14 [SUCCESS] System restored. Latency returned to 41ms.",
    ]);
  };

  const handleCleanZombie = (id: string, cost: number) => {
    setZombies((prev) => prev.filter((z) => z.id !== id));
    setSavedCost((prev) => prev + cost);
  };

  const handlePurgeCache = () => {
    if (!cacheTag) return;
    setPurging(true);
    setTimeout(() => {
      setPurging(false);
      setPurgedCount((prev) => prev + 1);
    }, 600);
  };

  const handleRunPrAudit = () => {
    setBotAuditing(true);
    setTimeout(() => {
      setBotAuditing(false);
      setBotAudited(true);
    }, 800);
  };

  return (
    <section className="py-16 max-w-6xl mx-auto px-4">
      {/* Header and Preview indicator */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">Interactive feature preview</h2>
          <p className="text-xs text-muted-foreground mt-0.5">Explore how core engine modules operate in simulated environments.</p>
        </div>
        <div className="px-2.5 py-1 rounded bg-muted/60 border border-border text-xs text-muted-foreground font-mono">
          Simulated preview
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex flex-wrap gap-1.5 mb-8 p-1 bg-muted/50 rounded-ui border border-border max-w-max">
        <button
          onClick={() => setActiveTab("autopilot")}
          className={cn(
            "px-3.5 py-1.5 rounded-ui text-xs font-medium transition-all flex items-center gap-2",
            activeTab === "autopilot"
              ? "bg-card text-foreground shadow-sm border border-border"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Cpu className="h-3.5 w-3.5" />
          Autopilot
        </button>

        <button
          onClick={() => setActiveTab("finops")}
          className={cn(
            "px-3.5 py-1.5 rounded-ui text-xs font-medium transition-all flex items-center gap-2",
            activeTab === "finops"
              ? "bg-card text-foreground shadow-sm border border-border"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <DollarSign className="h-3.5 w-3.5" />
          FinOps waste hunter
        </button>

        <button
          onClick={() => setActiveTab("cache")}
          className={cn(
            "px-3.5 py-1.5 rounded-ui text-xs font-medium transition-all flex items-center gap-2",
            activeTab === "cache"
              ? "bg-card text-foreground shadow-sm border border-border"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Zap className="h-3.5 w-3.5" />
          Cache invalidation
        </button>

        <button
          onClick={() => setActiveTab("mcp")}
          className={cn(
            "px-3.5 py-1.5 rounded-ui text-xs font-medium transition-all flex items-center gap-2",
            activeTab === "mcp"
              ? "bg-card text-foreground shadow-sm border border-border"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Terminal className="h-3.5 w-3.5" />
          MCP protocol
        </button>

        <button
          onClick={() => setActiveTab("prbot")}
          className={cn(
            "px-3.5 py-1.5 rounded-ui text-xs font-medium transition-all flex items-center gap-2",
            activeTab === "prbot"
              ? "bg-card text-foreground shadow-sm border border-border"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <GitBranch className="h-3.5 w-3.5" />
          PR review bot
        </button>
      </div>

      {/* Main Interactive Screen */}
      <Card className="p-6 md:p-8 bg-card border-border/50 relative overflow-hidden shadow-sm">
        {/* ── 1. AUTOPILOT TAB ── */}
        {activeTab === "autopilot" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
              <div>
                <span className="text-xs font-mono text-muted-foreground">Automated incident triage</span>
                <h3 className="text-lg font-bold text-foreground">Autonomous anomaly detection & self-healing guard</h3>
              </div>

              <div className="flex items-center gap-2">
                {anomalyState === "normal" && (
                  <Button onClick={handleTriggerAnomaly} variant="outline" className="np-btn-outline h-9 px-3 text-xs gap-2">
                    <AlertTriangle className="h-3.5 w-3.5 text-status-warn" /> Simulate anomaly spike
                  </Button>
                )}
                {anomalyState === "anomaly" && (
                  <Button onClick={handleExecuteRemediation} className="np-btn-primary h-9 px-4 text-xs gap-2">
                    <ShieldCheck className="h-3.5 w-3.5" /> Execute auto-rollback
                  </Button>
                )}
                {anomalyState === "remediated" && (
                  <Button onClick={() => { setAnomalyState("normal"); setAutopilotLog([]); }} variant="outline" className="np-btn-outline h-9 px-3 text-xs gap-2">
                    <RefreshCw className="h-3.5 w-3.5" /> Reset simulation
                  </Button>
                )}
              </div>
            </div>

            {/* Status Visualizer */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/20 rounded-ui border border-border/40 space-y-1">
                <p className="text-xs text-muted-foreground">System latency</p>
                <p className={cn("text-2xl font-bold font-mono", anomalyState === "anomaly" ? "text-status-down" : "text-status-up")}>
                  {anomalyState === "normal" ? "38ms" : anomalyState === "anomaly" ? "2,420ms" : "41ms"}
                </p>
                <p className="text-xs text-muted-foreground">{anomalyState === "anomaly" ? "Latency threshold breached" : "Healthy response"}</p>
              </div>

              <div className="p-4 bg-muted/20 rounded-ui border border-border/40 space-y-1">
                <p className="text-xs text-muted-foreground">Root cause confidence</p>
                <p className="text-2xl font-bold font-mono text-foreground">
                  {anomalyState === "normal" ? "100%" : "89%"}
                </p>
                <p className="text-xs text-muted-foreground">{anomalyState === "normal" ? "Zero incidents" : "Culprit: commit #a83f21"}</p>
              </div>

              <div className="p-4 bg-muted/20 rounded-ui border border-border/40 space-y-1">
                <p className="text-xs text-muted-foreground">Guard mode</p>
                <p className="text-2xl font-bold font-mono text-foreground">Recommend</p>
                <p className="text-xs text-muted-foreground">Human-in-the-loop guardrail</p>
              </div>
            </div>

            {/* Live Terminal Log */}
            <div className="p-4 bg-muted/30 text-foreground rounded-ui border border-border/40 font-mono text-xs space-y-2 min-h-[120px]">
              <div className="text-xs text-muted-foreground border-b border-border/40 pb-1.5 flex justify-between">
                <span>Simulated event log</span>
                <span className="text-xs text-muted-foreground font-mono">Telemetry</span>
              </div>
              {autopilotLog.length === 0 ? (
                <p className="text-muted-foreground italic pt-2">System operating normally. Click &quot;Simulate anomaly spike&quot; above to test triage.</p>
              ) : (
                autopilotLog.map((log, idx) => (
                  <p key={idx} className={log.includes("ALERT") ? "text-status-down font-medium" : log.includes("ACTION") ? "text-status-up font-medium" : "text-muted-foreground"}>
                    {log}
                  </p>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── 2. FINOPS TAB ── */}
        {activeTab === "finops" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
              <div>
                <span className="text-xs font-mono text-muted-foreground">Resource audit</span>
                <h3 className="text-lg font-bold text-foreground">Recover monthly cloud budget from zombie infrastructure</h3>
              </div>

              <div className="bg-muted/40 px-4 py-2 rounded-ui border border-border text-right">
                <span className="text-xs text-muted-foreground block">Recovered budget</span>
                <span className="text-xl font-bold font-mono text-status-up">+${savedCost}/mo</span>
              </div>
            </div>

            <div className="space-y-3">
              {zombies.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-border rounded-ui space-y-2">
                  <CheckCircle2 className="h-8 w-8 mx-auto text-status-up" />
                  <p className="text-sm font-semibold text-foreground">All sample zombie resources cleaned</p>
                  <p className="text-xs text-muted-foreground">Recovered ${savedCost}/mo in monthly cloud spend.</p>
                  <Button onClick={() => setZombies([
                    { id: "1", name: "staging-db-replica-v2", cost: 51, type: "Supabase DB" },
                    { id: "2", name: "ebs-vol-08f3-unattached", cost: 38, type: "AWS EBS" },
                    { id: "3", name: "legacy-logs-bucket", cost: 29, type: "Vercel Storage" },
                  ])} variant="outline" className="np-btn-outline h-8 px-3 text-xs mt-2">Reset demo resources</Button>
                </div>
              ) : (
                zombies.map((z) => (
                  <div key={z.id} className="flex items-center justify-between p-3.5 bg-muted/20 rounded-ui border border-border/40">
                    <div>
                      <p className="text-[13px] font-semibold font-mono text-foreground">{z.name}</p>
                      <p className="text-xs text-muted-foreground">{z.type} · Idle & unattached</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold font-mono text-foreground">${z.cost}/mo</span>
                      <Button onClick={() => handleCleanZombie(z.id, z.cost)} size="sm" variant="outline" className="np-btn-outline h-8 px-3 text-xs">
                        Terminate & save
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── 3. CACHE PULSE TAB ── */}
        {activeTab === "cache" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
              <div>
                <span className="text-xs font-mono text-muted-foreground">Cache invalidation</span>
                <h3 className="text-lg font-bold text-foreground">Edge cache purging by tag or path</h3>
              </div>

              <div className="text-right">
                <span className="text-xs text-muted-foreground block">Total edge revalidations</span>
                <span className="text-xl font-bold font-mono text-foreground">{purgedCount} tags</span>
              </div>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={cacheTag}
                onChange={(e) => setCacheTag(e.target.value)}
                placeholder="Tag name (e.g. products)"
                className="flex-1 font-mono text-xs px-3.5 py-2.5 bg-background border border-border/60 rounded-ui focus:outline-none focus:border-foreground"
              />
              <Button onClick={handlePurgeCache} disabled={purging || !cacheTag} className="np-btn-primary h-10 px-5 text-xs gap-2">
                {purging ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                Purge global edge
              </Button>
            </div>

            <div className="p-4 bg-muted/20 text-foreground rounded-ui border border-border/40 font-mono text-xs space-y-2">
              <div className="flex items-center justify-between text-muted-foreground pb-2 border-b border-border/40">
                <span>Edge node</span>
                <span>Status</span>
                <span>Latency</span>
              </div>
              <div className="flex justify-between text-foreground">
                <span>iad1 (US East — N. Virginia)</span>
                <span className="text-status-up font-medium">Purged</span>
                <span>12ms</span>
              </div>
              <div className="flex justify-between text-foreground">
                <span>fra1 (EU Central — Frankfurt)</span>
                <span className="text-status-up font-medium">Purged</span>
                <span>18ms</span>
              </div>
              <div className="flex justify-between text-foreground">
                <span>sin1 (Asia Pacific — Singapore)</span>
                <span className="text-status-up font-medium">Purged</span>
                <span>34ms</span>
              </div>
            </div>
          </div>
        )}

        {/* ── 4. MCP PROTOCOL TAB ── */}
        {activeTab === "mcp" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
              <div>
                <span className="text-xs font-mono text-muted-foreground">Model Context Protocol</span>
                <h3 className="text-lg font-bold text-foreground">Connect AI agents directly to infrastructure telemetry</h3>
              </div>

              <Button onClick={() => setMcpTested(true)} variant="outline" className="np-btn-outline h-9 px-3 text-xs gap-2">
                <Terminal className="h-3.5 w-3.5" /> Ping JSON-RPC 2.0
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-xs font-mono text-muted-foreground">Agent request payload</p>
                <pre className="p-4 bg-muted/20 text-foreground rounded-ui border border-border text-xs font-mono leading-relaxed overflow-x-auto">
{`{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "get_system_health"
  }
}`}
                </pre>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-mono text-muted-foreground">NexPulse response payload</p>
                <pre className="p-4 bg-muted/20 text-foreground rounded-ui border border-border text-xs font-mono leading-relaxed overflow-x-auto">
{mcpTested ? `{
  "jsonrpc": "2.0",
  "result": {
    "status": "OPERATIONAL",
    "monitorsCount": 6,
    "activeIncidents": 0
  }
}` : `{
  "status": "Ready for agent query..."
}`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* ── 5. PR BOT TAB ── */}
        {activeTab === "prbot" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/40">
              <div>
                <span className="text-xs font-mono text-muted-foreground">Automated PR review</span>
                <h3 className="text-lg font-bold text-foreground">Automated GitHub pull request audit comments</h3>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={prRepo}
                  onChange={(e) => setPrRepo(e.target.value)}
                  className="font-mono text-xs px-3 py-1.5 bg-background border border-border/60 rounded-ui focus:outline-none focus:border-foreground"
                />
                <Button onClick={handleRunPrAudit} disabled={botAuditing} className="np-btn-primary h-8 px-4 text-xs">
                  {botAuditing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : "Run audit"}
                </Button>
              </div>
            </div>

            {botAudited && (
              <div className="p-5 bg-muted/20 rounded-ui border border-border/40 space-y-3 font-sans">
                <div className="flex items-center justify-between border-b border-border/40 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-ui bg-muted text-foreground border border-border flex items-center justify-center font-semibold text-xs">NP</div>
                    <span className="text-[13px] font-semibold text-foreground">nexpulse-bot [bot]</span>
                    <span className="text-xs text-muted-foreground">commented on PR #142</span>
                  </div>
                  <span className="text-xs font-mono font-medium text-status-up bg-status-up/10 px-2 py-0.5 rounded border border-status-up/20">Score: 94 / 100</span>
                </div>

                <div className="space-y-2 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground">NexPulse automated audit summary for <code className="font-mono text-foreground">{prRepo}</code>:</p>
                  <p className="flex items-center gap-2 text-status-up"><CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> Zero security vulnerabilities detected in dependencies.</p>
                  <p className="flex items-center gap-2 text-status-up"><CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> Core Web Vitals impact: +4ms (well within threshold).</p>
                  <p className="flex items-center gap-2 text-foreground"><Activity className="h-3.5 w-3.5 shrink-0" /> Recommendation: Add memoization on heavy compute loop at line 42.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
    </section>
  );
}

"use client";

import * as React from "react";
import { Card, Button } from "@/components/ui-elements";
import {
  Cpu, DollarSign, Terminal, GitBranch, Zap, Activity,
  CheckCircle2, RefreshCw, AlertTriangle, ShieldCheck, ArrowRight, Play, Check
} from "lucide-react";
import { cn } from "@/lib/utils";

type FeatureTab = "autopilot" | "finops" | "cache" | "mcp" | "prbot";

export function LandingFeatureShowcase() {
  const [activeTab, setActiveTab] = React.useState<FeatureTab>("autopilot");

  // Autopilot interactive state
  const [anomalyState, setAnomalyState] = React.useState<"normal" | "anomaly" | "remediated">("normal");
  const [autopilotLog, setAutopilotLog] = React.useState<string[]>([]);

  // FinOps interactive state
  const [zombies, setZombies] = React.useState([
    { id: "1", name: "staging-db-replica-v2", cost: 51, type: "Supabase DB" },
    { id: "2", name: "ebs-vol-08f3-unattached", cost: 38, type: "AWS EBS" },
    { id: "3", name: "legacy-logs-bucket", cost: 29, type: "Vercel Storage" },
  ]);
  const [savedCost, setSavedCost] = React.useState(0);

  // Cache Pulse interactive state
  const [cacheTag, setCacheTag] = React.useState("products");
  const [purging, setPurging] = React.useState(false);
  const [purgedCount, setPurgedCount] = React.useState(14);

  // MCP interactive state
  const [mcpTested, setMcpTested] = React.useState(false);

  // PR Bot state
  const [prRepo, setPrRepo] = React.useState("inkand-paper/Optimizer");
  const [botAuditing, setBotAuditing] = React.useState(false);
  const [botAudited, setBotAudited] = React.useState(true);

  // Run Autopilot anomaly simulation
  const handleTriggerAnomaly = () => {
    setAnomalyState("anomaly");
    setAutopilotLog([
      "[ALERT 22:54:02] p95 latency spike > 2,400ms on /api/products",
      "[AUTOPILOT] Analyzing 42 telemetry metrics across edge nodes...",
      "[ROOT CAUSE] High confidence (89%): DB regression in commit #a83f21",
    ]);
  };

  const handleExecuteRemediation = () => {
    setAnomalyState("remediated");
    setAutopilotLog((prev) => [
      ...prev,
      "[ACTION] Executed automatic rollback to commit #f9104b",
      "[VERIFIED] Latency restored to 38ms SLA. Incident auto-closed.",
    ]);
  };

  // Run FinOps cleanup
  const handleCleanZombie = (id: string, cost: number) => {
    setZombies((prev) => prev.filter((z) => z.id !== id));
    setSavedCost((prev) => prev + cost);
  };

  // Run Cache Purge
  const handlePurgeCache = () => {
    setPurging(true);
    setTimeout(() => {
      setPurging(false);
      setPurgedCount((prev) => prev + 1);
    }, 600);
  };

  // Run PR audit
  const handleRunPrAudit = () => {
    setBotAuditing(true);
    setTimeout(() => {
      setBotAuditing(false);
      setBotAudited(true);
    }, 800);
  };

  return (
    <section className="py-20 max-w-6xl mx-auto px-4">

      {/* Header */}
      <div className="text-center mb-12 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-np-gold/10 border border-np-gold/30 text-np-gold text-[11px] font-bold uppercase tracking-widest">
          <Play className="h-3 w-3 fill-np-gold" />
          Interactive Live Console
        </div>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Experience NexPulse Features Live</h2>
        <p className="text-[14px] text-muted-foreground max-w-xl mx-auto">
          Test drive our autonomous incident engine, FinOps waste hunter, and edge cache purge directly below before signing up.
        </p>
      </div>

      {/* Tab Selector */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        <button
          onClick={() => setActiveTab("autopilot")}
          className={cn(
            "px-4 py-2 rounded-full text-[12px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 border",
            activeTab === "autopilot"
              ? "bg-np-gold text-black border-np-gold shadow-md shadow-np-gold/20"
              : "bg-card text-muted-foreground border-border hover:border-np-gold/40 hover:text-foreground"
          )}
        >
          <Cpu className="h-3.5 w-3.5" />
          Autopilot AI
        </button>

        <button
          onClick={() => setActiveTab("finops")}
          className={cn(
            "px-4 py-2 rounded-full text-[12px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 border",
            activeTab === "finops"
              ? "bg-np-teal text-black border-np-teal shadow-md shadow-np-teal/20"
              : "bg-card text-muted-foreground border-border hover:border-np-teal/40 hover:text-foreground"
          )}
        >
          <DollarSign className="h-3.5 w-3.5" />
          FinOps Waste Hunter
        </button>

        <button
          onClick={() => setActiveTab("cache")}
          className={cn(
            "px-4 py-2 rounded-full text-[12px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 border",
            activeTab === "cache"
              ? "bg-np-gold text-black border-np-gold shadow-md shadow-np-gold/20"
              : "bg-card text-muted-foreground border-border hover:border-np-gold/40 hover:text-foreground"
          )}
        >
          <Zap className="h-3.5 w-3.5" />
          Cache Pulse Engine
        </button>

        <button
          onClick={() => setActiveTab("mcp")}
          className={cn(
            "px-4 py-2 rounded-full text-[12px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 border",
            activeTab === "mcp"
              ? "bg-np-teal text-black border-np-teal shadow-md shadow-np-teal/20"
              : "bg-card text-muted-foreground border-border hover:border-np-teal/40 hover:text-foreground"
          )}
        >
          <Terminal className="h-3.5 w-3.5" />
          MCP Protocol
        </button>

        <button
          onClick={() => setActiveTab("prbot")}
          className={cn(
            "px-4 py-2 rounded-full text-[12px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 border",
            activeTab === "prbot"
              ? "bg-np-gold text-black border-np-gold shadow-md shadow-np-gold/20"
              : "bg-card text-muted-foreground border-border hover:border-np-gold/40 hover:text-foreground"
          )}
        >
          <GitBranch className="h-3.5 w-3.5" />
          PR Code Review Bot
        </button>
      </div>

      {/* Main Interactive Screen */}
      <Card className="p-6 md:p-8 bg-black/60 border-border/80 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-np-gold/5 blur-[100px] pointer-events-none" />

        {/* ── 1. AUTOPILOT AI TAB ── */}
        {activeTab === "autopilot" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-np-gold font-bold">Autopilot AI Engine</span>
                <h3 className="text-lg font-bold text-foreground">Autonomous Anomaly Detection & Self-Healing Guard</h3>
              </div>

              <div className="flex items-center gap-2">
                {anomalyState === "normal" && (
                  <Button onClick={handleTriggerAnomaly} variant="outline" className="text-np-gold border-np-gold/40 hover:bg-np-gold/10 text-[11px] gap-2">
                    <AlertTriangle className="h-3.5 w-3.5" /> Simulate Anomaly Spike
                  </Button>
                )}
                {anomalyState === "anomaly" && (
                  <Button onClick={handleExecuteRemediation} className="bg-np-gold text-black hover:bg-np-gold/90 text-[11px] font-bold gap-2">
                    <ShieldCheck className="h-3.5 w-3.5" /> Execute Auto-Rollback
                  </Button>
                )}
                {anomalyState === "remediated" && (
                  <Button onClick={() => { setAnomalyState("normal"); setAutopilotLog([]); }} variant="outline" className="text-[11px] gap-2">
                    <RefreshCw className="h-3.5 w-3.5" /> Reset Simulation
                  </Button>
                )}
              </div>
            </div>

            {/* Status Visualizer */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-muted/20 rounded-ui border border-border space-y-1">
                <p className="text-[10px] font-mono text-muted-foreground uppercase">System Latency</p>
                <p className={cn("text-2xl font-bold font-mono", anomalyState === "anomaly" ? "text-np-crimson" : "text-emerald-400")}>
                  {anomalyState === "normal" ? "38ms" : anomalyState === "anomaly" ? "2,420ms" : "41ms"}
                </p>
                <p className="text-[11px] text-muted-foreground">{anomalyState === "anomaly" ? "SLA Breach Detected" : "Healthy SLA"}</p>
              </div>

              <div className="p-4 bg-muted/20 rounded-ui border border-border space-y-1">
                <p className="text-[10px] font-mono text-muted-foreground uppercase">Root Cause Confidence</p>
                <p className="text-2xl font-bold font-mono text-np-gold">
                  {anomalyState === "normal" ? "100%" : "89%"}
                </p>
                <p className="text-[11px] text-muted-foreground">{anomalyState === "normal" ? "Zero Incidents" : "Culprit: Commit #a83f21"}</p>
              </div>

              <div className="p-4 bg-muted/20 rounded-ui border border-border space-y-1">
                <p className="text-[10px] font-mono text-muted-foreground uppercase">Autopilot Guard Mode</p>
                <p className="text-2xl font-bold font-mono text-np-teal">RECOMMEND</p>
                <p className="text-[11px] text-muted-foreground">Human-in-the-loop Guardrail</p>
              </div>
            </div>

            {/* Live Terminal Log */}
            <div className="p-4 bg-black rounded-ui border border-border/80 font-mono text-[11px] space-y-2 min-h-[120px]">
              <div className="text-[10px] text-muted-foreground uppercase border-b border-border/40 pb-1 flex justify-between">
                <span>AUTOPILOT TELEMETRY STREAM</span>
                <span className="text-np-gold">LIVE</span>
              </div>
              {autopilotLog.length === 0 ? (
                <p className="text-muted-foreground italic pt-2">System operating normally. Click &quot;Simulate Anomaly Spike&quot; above to test the AI engine.</p>
              ) : (
                autopilotLog.map((log, idx) => (
                  <p key={idx} className={log.includes("ALERT") ? "text-np-crimson font-bold" : log.includes("ACTION") ? "text-np-teal font-bold" : "text-slate-300"}>
                    {log}
                  </p>
                ))
              )}
            </div>
          </div>
        )}

        {/* ── 2. FINOPS TAB ── */}
        {activeTab === "finops" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-np-teal font-bold">FinOps & Cloud Waste Hunter</span>
                <h3 className="text-lg font-bold text-foreground">Recover Monthly Cloud Budget From Zombie Infrastructure</h3>
              </div>

              <div className="bg-np-teal/10 px-4 py-2 rounded-ui border border-np-teal/30 text-right">
                <span className="text-[10px] font-mono text-np-teal uppercase block">Recovered Budget</span>
                <span className="text-xl font-bold font-mono text-np-teal">+${savedCost}/mo</span>
              </div>
            </div>

            <div className="space-y-3">
              {zombies.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-np-teal/30 rounded-ui text-np-teal space-y-2">
                  <CheckCircle2 className="h-8 w-8 mx-auto" />
                  <p className="text-sm font-bold">All Zombie Cloud Resources Cleaned!</p>
                  <p className="text-[12px] text-muted-foreground">You recovered ${savedCost}/mo in monthly cloud spend.</p>
                  <Button onClick={() => setZombies([
                    { id: "1", name: "staging-db-replica-v2", cost: 51, type: "Supabase DB" },
                    { id: "2", name: "ebs-vol-08f3-unattached", cost: 38, type: "AWS EBS" },
                    { id: "3", name: "legacy-logs-bucket", cost: 29, type: "Vercel Storage" },
                  ])} variant="outline" className="text-[11px] mt-2">Reset Demo Resources</Button>
                </div>
              ) : (
                zombies.map((z) => (
                  <div key={z.id} className="flex items-center justify-between p-3.5 bg-muted/20 rounded-ui border border-border">
                    <div>
                      <p className="text-[13px] font-bold font-mono text-foreground">{z.name}</p>
                      <p className="text-[11px] text-muted-foreground">{z.type} · Idle & unattached</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-bold font-mono text-np-crimson">+${z.cost}/mo</span>
                      <Button onClick={() => handleCleanZombie(z.id, z.cost)} size="sm" variant="outline" className="text-np-teal border-np-teal/30 hover:bg-np-teal/10 text-[11px]">
                        Terminate & Save
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
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-np-gold font-bold">Cache Pulse Engine</span>
                <h3 className="text-lg font-bold text-foreground">Surgical Edge Cache Purging by Tag or Path</h3>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono text-muted-foreground uppercase block">Total Edge Revalidations</span>
                <span className="text-xl font-bold font-mono text-np-gold">{purgedCount} tags</span>
              </div>
            </div>

            <div className="flex gap-3">
              <input
                type="text"
                value={cacheTag}
                onChange={(e) => setCacheTag(e.target.value)}
                placeholder="Tag name (e.g. products)"
                className="flex-1 font-mono text-[13px] px-3.5 py-2.5 bg-background border border-border rounded-ui focus:outline-none focus:border-np-gold"
              />
              <Button onClick={handlePurgeCache} disabled={purging || !cacheTag} className="bg-np-gold text-black font-bold hover:bg-np-gold/90 text-[12px] gap-2 px-6">
                {purging ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                Purge Global Edge
              </Button>
            </div>

            <div className="p-4 bg-black rounded-ui border border-border/80 font-mono text-[11px] space-y-2">
              <div className="flex items-center justify-between text-muted-foreground pb-2 border-b border-border/40">
                <span>EDGE POP NODE</span>
                <span>STATUS</span>
                <span>LATENCY</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>iad1 (US East — N. Virginia)</span>
                <span className="text-emerald-400">PURGED</span>
                <span>12ms</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>fra1 (EU Central — Frankfurt)</span>
                <span className="text-emerald-400">PURGED</span>
                <span>18ms</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>sin1 (Asia Pacific — Singapore)</span>
                <span className="text-emerald-400">PURGED</span>
                <span>34ms</span>
              </div>
            </div>
          </div>
        )}

        {/* ── 4. MCP PROTOCOL TAB ── */}
        {activeTab === "mcp" && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-np-teal font-bold">Model Context Protocol</span>
                <h3 className="text-lg font-bold text-foreground">Connect AI Agents Directly to Infrastructure Telemetry</h3>
              </div>

              <Button onClick={() => setMcpTested(true)} variant="outline" className="text-np-teal border-np-teal/40 hover:bg-np-teal/10 text-[11px] gap-2">
                <Terminal className="h-3.5 w-3.5" /> Ping JSON-RPC 2.0
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="text-[11px] font-mono text-muted-foreground uppercase">Agent Request payload</p>
                <pre className="p-4 bg-black rounded-ui border border-border text-[11px] font-mono text-np-teal leading-relaxed">
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
                <p className="text-[11px] font-mono text-muted-foreground uppercase">NexPulse Response payload</p>
                <pre className="p-4 bg-black rounded-ui border border-border text-[11px] font-mono text-emerald-400 leading-relaxed">
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
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border/60">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-np-gold font-bold">PR Code Review Bot</span>
                <h3 className="text-lg font-bold text-foreground">Automated GitHub Pull Request Audit Score Comments</h3>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={prRepo}
                  onChange={(e) => setPrRepo(e.target.value)}
                  className="font-mono text-[12px] px-3 py-1.5 bg-background border border-border rounded-ui"
                />
                <Button onClick={handleRunPrAudit} disabled={botAuditing} className="bg-np-gold text-black font-bold text-[11px]">
                  {botAuditing ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : "Run Audit"}
                </Button>
              </div>
            </div>

            {botAudited && (
              <div className="p-5 bg-card/80 rounded-ui border border-border space-y-3 font-sans">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-full bg-np-gold/20 text-np-gold flex items-center justify-center font-bold text-[11px]">NP</div>
                    <span className="text-[13px] font-bold">nexpulse-bot [bot]</span>
                    <span className="text-[11px] text-muted-foreground">commented on PR #142</span>
                  </div>
                  <span className="text-[12px] font-mono font-bold text-np-teal bg-np-teal/10 px-2.5 py-0.5 rounded border border-np-teal/30">Score: 94 / 100</span>
                </div>

                <div className="space-y-2 text-[12px] text-slate-300">
                  <p className="font-semibold text-foreground">NexPulse Automated Audit Summary for <code className="font-mono text-np-gold">{prRepo}</code>:</p>
                  <p className="flex items-center gap-2 text-emerald-400"><Check className="h-3.5 w-3.5 shrink-0" /> Zero security vulnerabilities detected in dependencies.</p>
                  <p className="flex items-center gap-2 text-emerald-400"><Check className="h-3.5 w-3.5 shrink-0" /> Core Web Vitals impact: +4ms (well within SLA limits).</p>
                  <p className="flex items-center gap-2 text-np-gold"><Activity className="h-3.5 w-3.5 shrink-0" /> Recommendation: Add memoization on heavy compute loop at line 42.</p>
                </div>
              </div>
            )}
          </div>
        )}

      </Card>
    </section>
  );
}

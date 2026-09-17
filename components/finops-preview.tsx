"use client";

import * as React from "react";
import { Card, Button } from "@/components/ui-elements";
import {
  DollarSign, Trash2, ArrowDownRight, Database, Cloud,
  ShieldAlert, Check, RefreshCw, Loader2, TrendingDown,
  Server, Sparkles, CheckCircle2, ZapOff
} from "lucide-react";

interface ZombieResource {
  id: string;
  name: string;
  provider: string;
  type: string;
  costMonthly: number;
  status: string;
}

interface FinOpsPreviewProps {
  mode?: "cost" | "zombie";
}

export function FinOpsPreview({ mode = "cost" }: FinOpsPreviewProps) {
  const [zombies, setZombies] = React.useState<ZombieResource[]>([]);
  const [totalMonthlyWaste, setTotalMonthlyWaste] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [cleaningId, setCleaningId] = React.useState<string | null>(null);
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const res = await fetch("/api/finops/resources");
        if (res.ok && isMounted) {
          const data = await res.json();
          setZombies(data.resources || []);
          setTotalMonthlyWaste(data.totalMonthlyWaste || 0);
        }
      } catch (err) {
        console.error("[FINOPS_FETCH_ERR]", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  async function handleClean(zombie: ZombieResource) {
    setCleaningId(zombie.id);
    try {
      const res = await fetch("/api/finops/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resourceId: zombie.id,
          resourceName: zombie.name,
          provider: zombie.provider,
          costMonthly: zombie.costMonthly,
        }),
      });

      if (res.ok) {
        setZombies((prev) => prev.filter((z) => z.id !== zombie.id));
        setTotalMonthlyWaste((prev) => Math.max(0, prev - zombie.costMonthly));
        setToastMessage(`Recovered $${zombie.costMonthly}/mo by terminating ${zombie.name}`);
        setTimeout(() => setToastMessage(null), 4000);
      }
    } catch (err) {
      console.error("[FINOPS_CLEANUP_ERR]", err);
    } finally {
      setCleaningId(null);
    }
  }

  const projectedSpend = Math.max(0, 842 - totalMonthlyWaste);

  // Mode 1: COST INTELLIGENCE DASHBOARD
  if (mode === "cost") {
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
        {/* Header Banner */}
        <Card className="p-6 bg-gradient-to-r from-np-gold/10 via-card to-card border-np-gold/30">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-ui bg-np-gold/15 border border-np-gold/35 flex items-center justify-center text-np-gold shrink-0">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold tracking-tight">Cost Intelligence & Spend Optimization</h2>
                  <span className="bg-np-gold/20 text-np-gold font-bold text-[9px] uppercase tracking-widest px-2 py-0.5 rounded border border-np-gold/30">Beta</span>
                </div>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                  Real-time cloud provider spend breakdown, PR cost prediction, and savings forecast.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-muted/40 px-4 py-2.5 rounded-ui border border-border shrink-0">
              <div>
                <p className="label-category text-[9px] uppercase">Current Monthly Spend</p>
                <p className="text-lg font-bold font-mono">$842/mo</p>
              </div>
              <ArrowDownRight className="h-5 w-5 text-np-teal" />
              <div>
                <p className="label-category text-[9px] text-np-teal uppercase">Optimized Target</p>
                <p className="text-lg font-bold font-mono text-np-teal">${projectedSpend.toFixed(0)}/mo</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Infrastructure Cost Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Card className="p-5 space-y-3 border-border/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-blue-400" />
                <span className="text-[13px] font-bold">AWS Compute & S3</span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">60.8%</span>
            </div>
            <p className="text-2xl font-bold font-mono">$512<span className="text-[12px] text-muted-foreground font-sans">/mo</span></p>
            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
              <div className="bg-blue-400 h-full w-[60.8%]" />
            </div>
            <p className="text-[11px] text-muted-foreground">3 EC2 instances, 1 RDS Postgres DB, 4 S3 buckets</p>
          </Card>

          <Card className="p-5 space-y-3 border-border/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-emerald-400" />
                <span className="text-[13px] font-bold">Supabase Cloud</span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">22.5%</span>
            </div>
            <p className="text-2xl font-bold font-mono">$190<span className="text-[12px] text-muted-foreground font-sans">/mo</span></p>
            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full w-[22.5%]" />
            </div>
            <p className="text-[11px] text-muted-foreground">Pro Plan tier + dedicated pooler & disk expansions</p>
          </Card>

          <Card className="p-5 space-y-3 border-border/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-np-gold" />
                <span className="text-[13px] font-bold">Vercel & Edge</span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground">16.7%</span>
            </div>
            <p className="text-2xl font-bold font-mono">$140<span className="text-[12px] text-muted-foreground font-sans">/mo</span></p>
            <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
              <div className="bg-np-gold h-full w-[16.7%]" />
            </div>
            <p className="text-[11px] text-muted-foreground">Pro Plan team seat + Fast Data Transfer add-ons</p>
          </Card>
        </div>

        {/* PR Cost Prediction & Recommendations */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <Card className="lg:col-span-7 p-6 space-y-4">
            <h3 className="text-[13px] font-bold uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-np-gold" />
              Automated Cost Optimization Recommendations
            </h3>
            <div className="space-y-3">
              <div className="p-3.5 bg-muted/20 rounded-ui border border-border flex items-start gap-3">
                <TrendingDown className="h-4 w-4 text-np-teal shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-bold text-foreground">Downsize Idle Staging DB Replica</p>
                  <p className="text-[12px] text-muted-foreground">Staging RDS instance CPU usage has averaged under 2% for 14 days. Save ~$62/mo by downsizing.</p>
                </div>
              </div>

              <div className="p-3.5 bg-muted/20 rounded-ui border border-border flex items-start gap-3">
                <Trash2 className="h-4 w-4 text-np-gold shrink-0 mt-0.5" />
                <div>
                  <p className="text-[13px] font-bold text-foreground">Purge Unattached EBS Disk Volumes</p>
                  <p className="text-[12px] text-muted-foreground">Detected 120 GB unattached GP3 storage volume from terminated test deployment. Save ~$120/mo.</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-5 p-6 space-y-4 flex flex-col justify-between">
            <div>
              <h3 className="text-[13px] font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-np-gold" />
                PR Infrastructure Cost Impact
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">
                Pre-merge financial estimation engine automatically auditing code diffs for cloud bill impact.
              </p>

              <div className="p-4 bg-muted/20 rounded-ui border border-border space-y-3 font-mono text-[11px]">
                <div className="flex justify-between items-center pb-2 border-b border-border/40">
                  <span className="text-muted-foreground">PR #482 (Redis Cache)</span>
                  <span className="text-np-gold font-bold">+$177/mo</span>
                </div>
                <div className="space-y-1.5 text-[10px] text-muted-foreground font-sans">
                  <p>• Redis memory allocation: +2 GB</p>
                  <p>• Database IOPS baseline: +40%</p>
                  <p>• Background worker replicas: +2</p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-np-teal/10 rounded-ui border border-np-teal/20 text-[10px] text-np-teal font-semibold text-center">
              FinOps PR Bot Active on GitHub
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // Mode 2: ZOMBIE RESOURCE HUNTER DASHBOARD
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header Banner */}
      <Card className="p-6 bg-gradient-to-r from-np-crimson/10 via-card to-card border-np-crimson/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-10 w-10 rounded-ui bg-np-crimson/15 border border-np-crimson/35 flex items-center justify-center text-np-crimson shrink-0">
              <ZapOff className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold tracking-tight">Zombie Infrastructure Hunter</h2>
                <span className="bg-np-crimson/20 text-np-crimson font-bold text-[9px] uppercase tracking-widest px-2 py-0.5 rounded border border-np-crimson/30">Active Scanner</span>
              </div>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                Scan for abandoned, orphaned, and idle cloud resources across your accounts and terminate them in one click.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-muted/40 px-4 py-2.5 rounded-ui border border-border shrink-0">
            <div>
              <p className="label-category text-[9px] uppercase text-np-crimson">Recoverable Waste</p>
              <p className="text-lg font-bold font-mono text-np-crimson">${totalMonthlyWaste.toFixed(0)}/mo</p>
            </div>
          </div>
        </div>
      </Card>

      {toastMessage && (
        <div className="p-3.5 bg-np-teal/10 border border-np-teal/30 text-np-teal text-[12px] rounded-ui text-center font-bold animate-in fade-in duration-300">
          {toastMessage}
        </div>
      )}

      {/* Main Zombie Table */}
      <Card className="p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[13px] font-bold uppercase tracking-wider flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-np-gold" />
              Detected Idle & Abandoned Resources
            </h3>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Clicking &quot;Clean Up&quot; safely deprovisions the target cloud resource and updates your budget immediately.
            </p>
          </div>
          {!loading && zombies.length > 0 && (
            <span className="bg-np-gold/20 text-np-gold font-bold text-[9px] uppercase tracking-widest px-2.5 py-1 rounded border border-np-gold/30">
              {zombies.length} Zombie{zombies.length > 1 ? "s" : ""} Found
            </span>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : zombies.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-border rounded-ui text-muted-foreground">
            <CheckCircle2 className="h-10 w-10 text-np-teal mx-auto mb-3" />
            <p className="text-[14px] font-bold text-foreground">Zero Waste Detected</p>
            <p className="text-[12px] text-muted-foreground mt-1">All connected infrastructure resources are currently active and optimized.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {zombies.map((z) => (
              <div
                key={z.id}
                className="flex items-center justify-between p-4 bg-muted/20 rounded-ui border border-border hover:border-np-gold/40 transition-all"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="h-9 w-9 rounded-ui bg-background border border-border flex items-center justify-center shrink-0">
                    {z.provider === "Supabase"
                      ? <Database className="h-4 w-4 text-emerald-400" />
                      : <Cloud className="h-4 w-4 text-blue-400" />}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold font-mono truncate">{z.name}</p>
                    <p className="text-[11px] text-muted-foreground">{z.provider} · {z.type}</p>
                  </div>
                </div>

                <div className="flex items-center gap-5 shrink-0">
                  <div className="text-right">
                    <p className="text-[14px] font-bold font-mono text-np-crimson">+${z.costMonthly}/mo</p>
                    <span className="text-[9px] uppercase font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{z.status}</span>
                  </div>
                  <Button
                    onClick={() => handleClean(z)}
                    disabled={cleaningId === z.id}
                    variant="outline"
                    className="h-8 text-[11px] uppercase tracking-wider font-bold text-np-crimson border-np-crimson/30 hover:bg-np-crimson/10"
                  >
                    {cleaningId === z.id ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : "Clean Up"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

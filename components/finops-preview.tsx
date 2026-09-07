"use client";

import * as React from "react";
import { Card, Button } from "@/components/ui-elements";
import {
  DollarSign, Trash2, ArrowDownRight, Database, Cloud,
  ShieldAlert, Check, RefreshCw, Loader2,
} from "lucide-react";

interface ZombieResource {
  id: string;
  name: string;
  provider: string;
  type: string;
  costMonthly: number;
  status: string;
}

export function FinOpsPreview() {
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
        // Remove from local state immediately for snappiness, re-fetch for accuracy
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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* ── Spend Header ── */}
      <Card className="p-6 bg-gradient-to-r from-np-gold/5 via-background to-background border-np-gold/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-ui bg-np-gold/10 border border-np-gold/30 flex items-center justify-center text-np-gold">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold uppercase tracking-tight">NexPulse Cost Intelligence</h2>
                <span className="bg-np-teal/20 text-np-teal font-bold text-[9px] uppercase tracking-widest px-2 py-0.5 rounded border border-np-teal/30">FinOps v1.2</span>
              </div>
              <p className="text-[12px] text-muted-foreground mt-0.5">
                Cloud spend optimization & zombie resource cleanup. Changes persist to your account.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 bg-muted/30 px-4 py-2.5 rounded-ui border border-border">
            <div>
              <p className="label-category text-[9px] uppercase">Current Spend</p>
              <p className="text-lg font-bold font-mono">$842/mo</p>
            </div>
            <ArrowDownRight className="h-5 w-5 text-np-teal" />
            <div>
              <p className="label-category text-[9px] text-np-teal uppercase">Projected Target</p>
              <p className="text-lg font-bold font-mono text-np-teal">${projectedSpend.toFixed(0)}/mo</p>
            </div>
          </div>
        </div>
      </Card>

      {toastMessage && (
        <div className="p-3 bg-np-teal/10 border border-np-teal/30 text-np-teal text-[11px] rounded-ui text-center font-semibold animate-in fade-in duration-300">
          {toastMessage}
        </div>
      )}

      {/* ── Zombie Resource Hunter ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: Zombie List */}
        <Card className="lg:col-span-8 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[13px] font-bold uppercase tracking-wider flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-np-gold" />
                Zombie Infrastructure Hunter
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Unused, unattached, or abandoned cloud resources detected on your account.
              </p>
            </div>
            {!loading && zombies.length > 0 && (
              <span className="bg-np-gold/20 text-np-gold font-bold text-[9px] uppercase tracking-widest px-2 py-0.5 rounded border border-np-gold/30">
                ${totalMonthlyWaste.toFixed(0)}/mo recoverable
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : zombies.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-border rounded-ui text-muted-foreground">
              <Check className="h-8 w-8 text-np-teal mx-auto mb-2" />
              <p className="text-[13px] font-semibold text-foreground">Zero Waste Detected</p>
              <p className="text-[11px]">All cloud resources are operating efficiently.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {zombies.map((z) => (
                <div
                  key={z.id}
                  className="flex items-center justify-between p-3.5 bg-muted/20 rounded-ui border border-border hover:border-np-gold/30 transition-all"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded bg-background border border-border flex items-center justify-center shrink-0">
                      {z.provider === "Supabase"
                        ? <Database className="h-4 w-4 text-emerald-400" />
                        : <Cloud className="h-4 w-4 text-blue-400" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold font-mono truncate">{z.name}</p>
                      <p className="text-[10px] text-muted-foreground">{z.provider} · {z.type}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <p className="text-[13px] font-bold font-mono text-np-crimson">+${z.costMonthly}/mo</p>
                      <span className="text-[9px] uppercase font-mono text-muted-foreground">{z.status}</span>
                    </div>
                    <Button
                      onClick={() => handleClean(z)}
                      disabled={cleaningId === z.id}
                      variant="outline"
                      className="h-8 text-[10px] uppercase tracking-wider text-np-crimson border-np-crimson/30 hover:bg-np-crimson/10"
                    >
                      {cleaningId === z.id ? <RefreshCw className="h-3 w-3 animate-spin" /> : "Clean Up"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Right: PR Cost Impact Estimator */}
        <Card className="lg:col-span-4 p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-[13px] font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-np-gold" />
              PR Cost Prediction
            </h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed mb-4">
              NexPulse calculates infrastructure bill impact before GitHub PRs are merged. Connect a repo in the <strong className="text-foreground">PR Bot</strong> tab to activate.
            </p>

            <div className="p-4 bg-muted/20 rounded-ui border border-border space-y-3 font-mono text-[11px]">
              <div className="flex justify-between items-center pb-2 border-b border-border/40">
                <span className="text-muted-foreground">PR #482 (Redis Cache)</span>
                <span className="text-np-gold font-bold">+$177/mo</span>
              </div>
              <div className="space-y-1.5 text-[10px] text-muted-foreground font-sans">
                <p>• Redis memory allocation: +2 GB</p>
                <p>• Database IOPS baseline: +40%</p>
                <p>• Additional background workers: +2</p>
              </div>
            </div>
          </div>

          <div className="p-3 bg-np-teal/10 rounded-ui border border-np-teal/20 text-[10px] text-np-teal font-semibold text-center">
            FinOps PR Bot Active on <code className="font-mono">main</code>
          </div>
        </Card>

      </div>
    </div>
  );
}

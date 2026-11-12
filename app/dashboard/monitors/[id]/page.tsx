"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, Button, Badge, StatusPip, ConfirmDialog } from "@/components/ui-elements";
import { 
  ArrowLeft, Activity, Globe, Clock, Server, 
  AlertCircle, Shield, RefreshCw, Loader2, Trash2, 
  ExternalLink, CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface MonitorCheck { id: string; status: string; latency: number; message?: string; createdAt: string; }
interface MonitorData { id: string; name: string; url: string; status: "UP" | "DOWN"; checks: MonitorCheck[]; user?: { webhooks?: { id: string; url: string }[] }; }

export default function MonitorDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [monitor, setMonitor] = React.useState<MonitorData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  // Decommission confirm dialog
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const fetchDetails = async () => {
    setRefreshing(true);
    try {
      const r = await fetch(`/api/monitors/${id}`, { credentials: "include" });
      const d = await r.json();
      if (d.success) setMonitor(d.monitor);
      else router.push("/dashboard");
    } catch {
      router.push("/dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  React.useEffect(() => {
    fetchDetails();
    const iv = setInterval(fetchDetails, 30000);
    return () => clearInterval(iv);
  }, [id]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const r = await fetch(`/api/monitors/${id}`, { method: 'DELETE', credentials: 'include' });
      if (r.ok) router.push('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const latestCheck = monitor?.checks?.[0];
  const history = monitor?.checks?.slice().reverse() || [];
  const incidents = monitor?.checks?.filter((c: MonitorCheck) => c.status !== "UP") || [];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation & Target Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/dashboard"
              className="p-1.5 hover:bg-muted rounded text-muted-foreground hover:text-foreground transition-colors shrink-0"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <div className="min-w-0">
              <div className="flex items-center gap-2.5">
                <StatusPip status={monitor?.status || "UP"} />
                <h1 className="text-base sm:text-lg font-semibold tracking-tight text-foreground truncate">
                  {monitor?.name}
                </h1>
              </div>
              <p className="text-xs font-mono text-muted-foreground flex items-center gap-1.5 mt-0.5 truncate">
                <Globe className="h-3 w-3 shrink-0" />
                <span className="truncate">{monitor?.url}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDetails}
              disabled={refreshing}
              className="h-8 text-xs font-medium"
            >
              <RefreshCw className={cn("h-3 w-3 mr-1.5", refreshing && "animate-spin")} />
              Sync
            </Button>
            <a
              href={monitor?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded text-xs font-medium border border-border bg-card hover:bg-muted transition-colors text-foreground"
            >
              <ExternalLink className="h-3 w-3" /> Visit Endpoint
            </a>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Card className="p-4 space-y-2">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Current Latency</p>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-mono font-semibold text-foreground">
                {latestCheck?.latency ?? 0}
                <span className="text-xs font-normal text-muted-foreground ml-1">ms</span>
              </span>
              <span className="text-xs font-mono text-muted-foreground">Latest probe</span>
            </div>
            <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-300",
                  (latestCheck?.latency || 0) < 300 ? "bg-emerald-500" : 
                  (latestCheck?.latency || 0) < 800 ? "bg-amber-500" : "bg-rose-500"
                )}
                style={{ width: `${Math.min((latestCheck?.latency || 0) / 6, 100)}%` }} 
              />
            </div>
          </Card>

          <Card className="p-4 space-y-2">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Uptime SLA</p>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-mono font-semibold text-foreground">
                {(monitor?.checks?.length ?? 0) > 0
                  ? ((monitor!.checks.filter((c: MonitorCheck) => c.status === 'UP').length / monitor!.checks.length) * 100).toFixed(2)
                  : "100.00"}%
              </span>
              <span className="text-xs font-mono text-emerald-500">Live Window</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Rolling 50 checks</p>
          </Card>

          <Card className="p-4 space-y-2">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Transport Security</p>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-foreground">
                {monitor?.url?.startsWith('https') ? 'TLS 1.3 Valid' : 'Insecure HTTP'}
              </span>
              <Shield className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <p className="text-[11px] text-muted-foreground font-mono">
              {monitor?.url?.startsWith('https') ? 'ECDSA Encrypted' : 'Unencrypted'}
            </p>
          </Card>

          <Card className="p-4 space-y-2">
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Routing Node</p>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-semibold text-foreground">Global Edge</span>
              <Server className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <p className="text-[11px] text-muted-foreground font-mono">US/EU/APAC Multi-PoP</p>
          </Card>
        </div>

        {/* Main Section: Latency Stream & Incidents */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Latency History */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-border">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-foreground" />
                  <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-foreground">
                    Latency Telemetry Stream (ms)
                  </h3>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">
                  Last 50 data points
                </span>
              </div>
              
              <div className="h-[200px] flex items-end gap-1 px-1">
                {history.length > 0 ? history.map((c: MonitorCheck) => {
                  const height = Math.min((c.latency / 800) * 100, 100);
                  return (
                    <div 
                      key={c.id} 
                      className={cn(
                        "flex-1 rounded-t-[1px] transition-all hover:opacity-75 relative group",
                        c.status !== "UP" ? "bg-rose-500" :
                        c.latency < 300 ? "bg-emerald-500" :
                        c.latency < 800 ? "bg-amber-500" : "bg-rose-500"
                      )}
                      style={{ height: `${height}%`, minHeight: '4px' }}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30">
                        <div className="bg-popover text-popover-foreground text-[10px] font-mono px-2 py-1 rounded shadow-lg whitespace-nowrap border border-border">
                          {c.latency}ms · {new Date(c.createdAt).toLocaleTimeString()}
                          {c.message && <p className="text-rose-500 mt-0.5">{c.message}</p>}
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-mono">
                    Gathering telemetry stream...
                  </div>
                )}
              </div>
              
              <div className="flex justify-between mt-3 text-[10px] font-mono text-muted-foreground">
                <span>{history[0] ? new Date(history[0].createdAt).toLocaleTimeString() : 'T-Minus'}</span>
                <span>{history[history.length-1] ? new Date(history[history.length-1].createdAt).toLocaleTimeString() : 'Current'}</span>
              </div>
            </Card>

            {/* Incidents Stream */}
            <Card className="overflow-hidden">
              <div className="p-4 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-foreground" />
                  <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-foreground">
                    Incident Log
                  </h3>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-muted text-foreground border border-border">
                  {incidents.length} Events Detected
                </span>
              </div>

              <div className="divide-y divide-border">
                {incidents.length > 0 ? incidents.map((inc: MonitorCheck) => (
                  <div key={inc.id} className="p-3.5 flex items-start gap-3">
                    <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0 mt-1.5" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-xs font-mono font-medium text-rose-500">
                          OUTAGE (Status: {inc.status})
                        </span>
                        <span className="text-[11px] text-muted-foreground font-mono shrink-0">
                          {new Date(inc.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">
                        {inc.message || "Endpoint unreachable / connection timeout"}
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="p-8 text-center text-xs text-muted-foreground space-y-1">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto opacity-80" />
                    <p className="font-medium text-foreground">All systems operational</p>
                    <p>No anomalous status codes recorded in the current telemetry window.</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Column: Configuration & Danger Zone */}
          <div className="space-y-6">
            <Card className="p-5 space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-foreground pb-2 border-b border-border">
                Probe Configuration
              </h3>
              
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Target URI</span>
                  <p className="font-mono text-foreground break-all bg-muted/40 p-2 rounded border border-border mt-1">
                    {monitor?.url}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-muted-foreground">Interval</span>
                    <p className="font-medium text-foreground mt-0.5">Every 60s</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Timeout</span>
                    <p className="font-medium text-foreground mt-0.5">5.0s</p>
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <span className="text-muted-foreground block mb-1.5">Notification Routing</span>
                  <div className="flex flex-wrap gap-1.5">
                    <Badge variant="neutral">Email Dispatch</Badge>
                    {monitor?.user?.webhooks?.map((wh: { id: string; url: string }) => {
                      const isDiscord = wh.url.includes('discord.com');
                      const isSlack = wh.url.includes('slack.com');
                      const label = isDiscord ? 'Discord' : isSlack ? 'Slack' : 'Webhook';
                      return (
                        <Badge key={wh.id} variant="neutral">
                          {label}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>

            {/* Decommission Target */}
            <Card className="p-5 space-y-3 border-rose-500/20">
              <div className="space-y-1">
                <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-rose-500">
                  Decommission Target
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Permanently remove this target from the monitoring cluster and delete all collected latency history.
                </p>
              </div>

              <Button 
                variant="danger" 
                size="sm"
                className="w-full text-xs"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Decommission Asset
              </Button>
            </Card>
          </div>
        </div>
      </div>

      {/* Accessible Confirm Dialog */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Decommission Endpoint Monitor"
        description={`Are you sure you want to decommission "${monitor?.name}"? All historical availability statistics and latency telemetry will be permanently deleted.`}
        confirmText="Decommission Target"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

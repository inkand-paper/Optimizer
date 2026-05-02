"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, Button, Badge, StatusDot } from "@/components/ui-elements";
import { 
  ArrowLeft, Activity, Globe, Clock, Server, 
  AlertCircle, CheckCircle2, BarChart3, Shield,
  RefreshCw, Loader2, Trash2, ExternalLink, XCircle
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function MonitorDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [monitor, setMonitor] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-np-gold" />
      </div>
    );
  }

  const latestCheck = monitor?.checks?.[0];
  const history = monitor?.checks?.slice().reverse() || [];
  const incidents = monitor?.checks?.filter((c: any) => c.status !== "UP") || [];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Navigation */}
        <div className="flex flex-col gap-6 mb-2">
          <div className="flex items-start gap-4">
            <Link href="/dashboard" className="mt-1 p-2 hover:bg-muted rounded-ui transition-colors text-muted-foreground hover:text-foreground shrink-0">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-bold uppercase tracking-tight truncate max-w-full">
                  {monitor?.name}
                </h1>
                <Badge variant={monitor?.status === 'UP' ? 'success' : 'danger'} className="text-[10px] px-2 py-0.5">
                  {monitor?.status}
                </Badge>
              </div>
              <p className="text-[12px] text-muted-foreground font-mono flex items-center gap-1.5 mt-1 truncate">
                <Globe className="h-3 w-3 shrink-0" /> 
                <span className="truncate">{monitor?.url}</span>
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 pl-[52px] sm:pl-0 sm:justify-end sm:mt-[-54px]">
            <Button variant="outline" size="sm" onClick={fetchDetails} disabled={refreshing} className="h-9 px-4 text-[11px] uppercase tracking-widest">
              <RefreshCw className={cn("h-3.5 w-3.5 mr-2", refreshing && "animate-spin")} />
              Sync Telemetry
            </Button>
            <a href={monitor?.url} target="_blank" rel="noopener noreferrer" className="np-btn-outline h-9 px-4 text-[11px] uppercase tracking-widest flex items-center gap-2">
              <ExternalLink className="h-3.5 w-3.5" /> Visit Site
            </a>
          </div>
        </div>

        {/* Top Grid: Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-5 space-y-3">
            <p className="label-category text-[10px]">Real-Time Pulse</p>
            <div className="flex items-end justify-between">
              <p className="text-2xl font-bold">{latestCheck?.latency ?? 0} <span className="text-[12px] font-normal text-muted-foreground">ms</span></p>
              <BarChart3 className="h-5 w-5 text-np-gold opacity-50" />
            </div>
            <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-500",
                  (latestCheck?.latency || 0) < 300 ? "bg-np-teal" : 
                  (latestCheck?.latency || 0) < 800 ? "bg-np-gold" : "bg-np-crimson"
                )}
                style={{ width: `${Math.min((latestCheck?.latency || 0) / 5, 100)}%` }} 
              />
            </div>
          </Card>
          
          <Card className="p-5 space-y-3">
            <p className="label-category text-[10px]">Authorization Level</p>
            <div className="flex items-center gap-3">
              <div className={cn(
                "h-10 w-10 rounded-ui flex items-center justify-center border",
                monitor?.url?.startsWith('https') ? "bg-np-teal/10 text-np-teal border-np-teal/20" : "bg-np-gold/10 text-np-gold border-np-gold/20"
              )}>
                <Shield className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-bold uppercase truncate">{monitor?.url?.startsWith('https') ? 'Production' : 'Development'}</p>
                <p className="text-[10px] text-muted-foreground truncate">{monitor?.url?.startsWith('https') ? 'Secure SSL Encrypted' : 'Insecure / No SSL'}</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <p className="label-category text-[10px]">Availability Index</p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-ui bg-np-gold/10 flex items-center justify-center text-np-gold border border-np-gold/20">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[14px] font-bold uppercase">
                  {monitor?.checks?.length > 0 
                    ? ((monitor.checks.filter((c: any) => c.status === 'UP').length / monitor.checks.length) * 100).toFixed(2)
                    : "100.00"}%
                </p>
                <p className="text-[10px] text-muted-foreground">Recent window</p>
              </div>
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <p className="label-category text-[10px]">Monitoring Node</p>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-ui bg-muted flex items-center justify-center text-np-slate border border-border">
                <Server className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-[14px] font-bold uppercase">Vercel Edge</p>
                <p className="text-[10px] text-muted-foreground truncate">Primary Active Link</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Main Content: Graph & Incidents */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Graph Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-np-gold" />
                  <h3 className="text-[13px] font-bold uppercase">Latency Stream (ms)</h3>
                </div>
                <p className="text-[10px] font-mono text-muted-foreground">Visualizing last 50 data points</p>
              </div>
              
              <div className="h-[240px] flex items-end gap-1 px-2">
                {history.length > 0 ? history.map((c: any, i: number) => {
                  const height = Math.min((c.latency / 800) * 100, 100);
                  return (
                    <div 
                      key={c.id} 
                      className={cn(
                        "flex-1 rounded-t-[2px] transition-all hover:opacity-50 relative group",
                        c.status !== "UP" ? "bg-np-crimson" :
                        c.latency < 300 ? "bg-np-teal" :
                        c.latency < 800 ? "bg-np-gold" : "bg-np-crimson"
                      )}
                      style={{ height: `${height}%`, minHeight: '4px' }}
                    >
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30">
                        <div className="bg-np-ink text-white text-[10px] px-2 py-1 rounded shadow-xl whitespace-nowrap border border-white/10">
                          {c.latency}ms · {new Date(c.createdAt).toLocaleTimeString()}
                          {c.message && <p className="text-np-crimson mt-0.5">{c.message}</p>}
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[13px]">
                    Establishing telemetry connection...
                  </div>
                )}
              </div>
              
              <div className="flex justify-between mt-4 px-2">
                <span className="text-[9px] font-mono text-muted-foreground uppercase">{history[0] ? new Date(history[0].createdAt).toLocaleTimeString() : 'T-Minus'}</span>
                <span className="text-[9px] font-mono text-muted-foreground uppercase">{history[history.length-1] ? new Date(history[history.length-1].createdAt).toLocaleTimeString() : 'Current'}</span>
              </div>
            </Card>

            {/* Incident History (NEW: Why it was down) */}
            <Card className="overflow-hidden">
              <div className="p-5 border-b border-border bg-muted/20 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-np-crimson" />
                  <h3 className="text-[13px] font-bold uppercase">Incident History</h3>
                </div>
                <span className="text-[10px] font-bold uppercase text-np-crimson bg-np-crimson/10 px-2 py-1 rounded">
                  {incidents.length} Events Detected
                </span>
              </div>
              <div className="divide-y divide-border">
                {incidents.length > 0 ? incidents.map((inc: any) => (
                  <div key={inc.id} className="p-4 flex items-start gap-4">
                    <div className="h-8 w-8 rounded-full bg-np-crimson/10 flex items-center justify-center shrink-0">
                      <XCircle className="h-4 w-4 text-np-crimson" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-np-crimson uppercase">Infrastructure Offline</p>
                      <p className="text-[12px] text-muted-foreground font-mono mt-0.5 break-words whitespace-pre-wrap">
                        Cause: {inc.message || "Timeout / Connection Refused"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] font-bold uppercase">Failed</p>
                      <p className="text-[10px] text-muted-foreground font-mono">
                        {new Date(inc.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                )) : (
                  <div className="p-12 text-center">
                    <CheckCircle2 className="h-10 w-10 text-np-teal mx-auto mb-3 opacity-30" />
                    <p className="text-[13px] font-medium text-muted-foreground">Optimal operation. No incidents detected in current window.</p>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Right Section: Configuration & Actions */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="text-[13px] font-bold uppercase mb-6 flex items-center gap-2">
                <Server className="h-4 w-4 text-np-gold" />
                Infrastructure Config
              </h3>
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="label-category text-[9px]">Target Endpoint</p>
                  <p className="text-[13px] font-mono break-all bg-muted/30 p-2 rounded border border-border">
                    {monitor?.url}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="label-category text-[9px]">Check Frequency</p>
                    <p className="text-[13px] font-bold">Standard (5m)</p>
                  </div>
                  <div className="space-y-1">
                    <p className="label-category text-[9px]">Timeout Threshold</p>
                    <p className="text-[13px] font-bold">5s (Auto)</p>
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <p className="label-category text-[9px] mb-2">Active Notifications</p>
                  <div className="flex flex-wrap gap-2">
                    {/* Always show Email Alert as it's built-in */}
                    <Badge className="bg-np-gold/10 text-np-gold border-np-gold/20">Email Alert</Badge>
                    
                    {/* Dynamic Webhooks */}
                    {monitor?.user?.webhooks?.map((wh: any) => {
                      const isDiscord = wh.url.includes('discord.com');
                      const isSlack = wh.url.includes('slack.com');
                      const label = isDiscord ? 'Discord' : isSlack ? 'Slack' : 'Webhook';
                      
                      return (
                        <Badge key={wh.id} className="bg-np-teal/10 text-np-teal border-np-teal/20">
                          {label}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 border-np-crimson/20">
              <h3 className="text-[13px] font-bold uppercase mb-4 text-np-crimson flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                Danger Zone
              </h3>
              <p className="text-[12px] text-muted-foreground mb-6 leading-relaxed">
                Permanently decommissioning this asset will erase all historical latency data and telemetry logs. This action cannot be reversed.
              </p>
              <Button 
                variant="danger" 
                className="w-full uppercase tracking-widest text-[11px] h-10"
                onClick={async () => {
                  if (confirm("Decommission this asset? All telemetry will be purged.")) {
                    const r = await fetch(`/api/monitors/${id}`, { method: 'DELETE', credentials: 'include' });
                    if (r.ok) router.push('/dashboard');
                  }
                }}
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" /> Decommission Asset
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}



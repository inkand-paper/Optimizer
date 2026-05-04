"use client";

import * as React from "react";
import { Card, StatusDot } from "./ui-elements";
import { Activity, RefreshCw, Search, Key, ShieldAlert, ChevronDown, ChevronUp, Database } from "lucide-react";
import { cn } from "@/lib/utils";

interface Log {
  id: string;
  type: string;
  action: string;
  status: string;
  createdAt: string;
  details: Record<string, unknown>;
}

function typeIcon(type: string) {
  const cls = "h-3.5 w-3.5";
  switch (type) {
    case "REVALIDATE": return <RefreshCw className={cls} />;
    case "ANALYZE":   return <Search    className={cls} />;
    case "KEY_GEN":   return <Key       className={cls} />;
    case "KEY_REVOKE":return <Key       className={cls} />;
    case "SYSTEM_TELEMETRY": return <ShieldAlert className={cls} />;
    default:          return <Activity  className={cls} />;
  }
}

function dotStatus(status: string): "healthy" | "error" | "warning" {
  if (status === "SUCCESS") return "healthy";
  if (status === "FAILURE") return "error";
  return "warning";
}

export function ActivityLogs() {
  const [logs, setLogs]       = React.useState<Log[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      const r = await fetch("/api/logs", { credentials: "include" });
      const d = await r.json();
      if (r.ok) setLogs(d.logs);
    } catch {}
    finally { setLoading(false); }
  };

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLogs();
    const iv = setInterval(fetchLogs, 30000);
    return () => clearInterval(iv);
  }, []);

  if (loading && logs.length === 0) {
    return (
      <Card className="p-10 text-center">
        <Activity className="h-6 w-6 animate-pulse mx-auto mb-3 text-np-gold opacity-40" />
        <p className="label-category">Loading audit trail…</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: "0.5px solid var(--border)" }}
      >
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-np-gold" />
          <span className="text-[13px] font-semibold">Audit Trail</span>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-1.5 text-[12px] text-muted-foreground hover:text-np-gold transition-colors"
        >
          <RefreshCw className="h-3 w-3" /> Refresh
        </button>
      </div>

      {/* Timeline */}
      <div className="max-h-[540px] overflow-y-auto np-scroll">
        {logs.length === 0 ? (
          <p className="p-8 text-center text-[13px] text-muted-foreground">
            No events recorded yet.
          </p>
        ) : (
          <div className="relative">
            {/* vertical line */}
            <div
              className="absolute left-[38px] top-0 bottom-0 w-px"
              style={{ background: "var(--border)" }}
            />
            {logs.map((log, i) => (
              <div
                key={log.id}
                className="flex items-start gap-4 px-5 py-4 group hover:bg-muted/30 transition-colors"
                style={i < logs.length - 1 ? { borderBottom: "0.5px solid var(--border)" } : {}}
              >
                {/* Dot */}
                <div 
                  className="relative z-10 mt-0.5 flex items-center justify-center h-6 w-6 rounded-full bg-card shrink-0 cursor-pointer hover:border-np-gold transition-colors" 
                  style={{ border: "0.5px solid var(--border)" }}
                  onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                >
                  <StatusDot status={dotStatus(log.status)} />
                </div>

                {/* Main Body */}
                <div className="flex-1 min-w-0 flex flex-col gap-4">
                  {/* Content Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-muted-foreground">{typeIcon(log.type)}</span>
                        <p className="text-[13px] font-medium truncate">{log.action}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={cn(
                            "inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-semibold",
                            log.status === "SUCCESS"
                              ? "np-badge-success"
                              : log.status === "FAILURE"
                              ? "np-badge-danger"
                              : "np-badge-warning"
                          )}
                        >
                          {log.status}
                        </span>
                        {Boolean(log.details?.origin) && (
                          <span className="font-mono text-[11px] text-np-gold bg-np-gold/10 px-1.5 py-0.5 rounded">
                            {String(log.details.origin)}
                          </span>
                        )}
                        {Boolean(log.details?.durationMs) && (
                          <span className="font-mono text-[11px] text-np-slate">
                            {String(log.details.durationMs)}ms
                          </span>
                        ) }
                        {log.details?.score !== undefined && (
                          <span className="font-mono text-[11px] text-np-slate">
                            score: {String(log.details.score)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Timestamp & Expand — gold mono as per spec */}
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="mono-gold tabular-nums text-[11px] sm:text-[13px]">
                        {new Date(log.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>
                      <button 
                        onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                        className="p-1 hover:bg-muted rounded text-muted-foreground transition-colors"
                      >
                        {expandedId === log.id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedId === log.id && (
                    <div className="w-full animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-4 rounded-ui bg-muted/50 border border-border overflow-hidden">
                        <div className="flex items-center gap-2 mb-3 text-np-gold">
                          <Database className="h-3.5 w-3.5" />
                          <span className="text-[10px] font-bold uppercase tracking-widest">Extended Event Metadata</span>
                        </div>
                        <pre className="text-[11px] font-mono leading-relaxed opacity-80 overflow-x-auto np-scroll pb-2">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        className="px-5 py-3 text-center"
        style={{ borderTop: "0.5px solid var(--border)" }}
      >
        <p className="label-category text-[10px]">End of trail · auto-refreshes every 30s</p>
      </div>
    </Card>
  );
}

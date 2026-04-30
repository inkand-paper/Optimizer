import * as React from "react";
import { Card } from "./ui-elements";
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RefreshCw,
  Search,
  ShieldCheck,
  Key
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Log {
  id: string;
  type: string;
  action: string;
  status: string;
  createdAt: string;
  details: any;
}

/**
 * [PRODUCTION-GRADE] - Activity Logs
 * Sovereign Obsidian Aesthetic
 */
export function ActivityLogs() {
  const [logs, setLogs] = React.useState<Log[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/logs", { credentials: 'include' });
      const data = await res.json();
      if (res.ok) setLogs(data.logs);
    } catch (err) {
      console.error("Failed to fetch logs", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchLogs();
    const interval = setInterval(fetchLogs, 30000); 
    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'REVALIDATE': return <RefreshCw className="h-4 w-4" />;
      case 'ANALYZE': return <Search className="h-4 w-4" />;
      case 'KEY_GEN': return <Key className="h-4 w-4" />;
      case 'KEY_REVOKE': return <Activity className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (loading && logs.length === 0) {
    return (
      <Card className="p-12 text-center bg-zinc-50 dark:bg-black border-zinc-200 dark:border-zinc-800">
        <Activity className="h-8 w-8 animate-pulse mx-auto mb-4 text-blue-600 opacity-20" />
        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Syncing Activity Matrix...</p>
      </Card>
    );
  }

  return (
    <Card className="p-0 overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
      <div className="p-5 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="h-4 w-4 text-blue-600" />
          <span className="font-black text-xs uppercase tracking-widest text-zinc-900 dark:text-white">Infrastructure Logs</span>
        </div>
        <button onClick={fetchLogs} className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-blue-600 transition-colors">
          Refresh Stream
        </button>
      </div>

      <div className="max-h-[500px] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-900">
        {logs.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 font-bold text-xs uppercase tracking-widest">
            No system events recorded.
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="p-5 flex items-start gap-5 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors group">
              <div className={cn(
                "h-10 w-10 rounded-md flex items-center justify-center shrink-0 border transition-colors",
                log.status === 'SUCCESS' 
                  ? "bg-zinc-50 dark:bg-zinc-950 border-emerald-500/20 text-emerald-500" 
                  : "bg-red-50 dark:bg-red-950/20 border-red-500/20 text-red-500"
              )}>
                {getIcon(log.type)}
              </div>
              <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1.5">
                  <p className="text-xs font-black uppercase tracking-tight text-zinc-900 dark:text-white break-words pr-4">{log.action}</p>
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm border",
                      log.status === 'SUCCESS' ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500" : "bg-red-500/5 border-red-500/20 text-red-500"
                    )}>
                      {log.status}
                    </span>
                    {log.details?.durationMs && (
                      <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest opacity-60">• {log.details.durationMs}ms</span>
                    )}
                    {log.details?.score && (
                      <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest opacity-60">• SCR: {log.details.score}</span>
                    )}
                  </div>
                </div>
                <span className="text-[9px] text-zinc-400 font-black uppercase tracking-widest tabular-nums opacity-60">
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="p-4 bg-zinc-50/50 dark:bg-zinc-950/50 border-t border-zinc-100 dark:border-zinc-900 text-center">
        <p className="text-[9px] text-zinc-400 font-black uppercase tracking-[0.2em]">End of Intelligence Stream</p>
      </div>
    </Card>
  );
}

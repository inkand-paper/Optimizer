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

export function ActivityLogs() {
  const [logs, setLogs] = React.useState<Log[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchLogs = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("/api/logs", {
        headers: { Authorization: `Bearer ${token}` }
      });
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
    const interval = setInterval(fetchLogs, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'REVALIDATE': return <RefreshCw className="h-3 w-3" />;
      case 'ANALYZE': return <Search className="h-3 w-3" />;
      case 'KEY_GEN': return <Key className="h-3 w-3" />;
      case 'KEY_REVOKE': return <Activity className="h-3 w-3" />;
      default: return <Activity className="h-3 w-3" />;
    }
  };

  if (loading && logs.length === 0) {
    return (
      <Card className="p-6 text-center text-zinc-500">
        <Activity className="h-5 w-5 animate-pulse mx-auto mb-2 opacity-20" />
        <p className="text-xs">Loading activity logs...</p>
      </Card>
    );
  }

  return (
    <Card className="p-0 overflow-hidden border-zinc-200 dark:border-zinc-800">
      <div className="p-4 border-b bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-zinc-400" />
          <span className="font-bold text-sm">System Logs</span>
        </div>
        <button onClick={fetchLogs} className="text-[10px] text-zinc-400 hover:text-blue-500 transition-colors">
          Refresh
        </button>
      </div>

      <div className="max-h-[400px] overflow-y-auto divide-y divide-zinc-100 dark:divide-zinc-900">
        {logs.length === 0 ? (
          <div className="p-8 text-center text-zinc-500 italic text-xs">
            No recent activity detected.
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="p-4 flex items-start gap-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors group">
              <div className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                log.status === 'SUCCESS' ? "bg-green-50 dark:bg-green-900/20 text-green-600" : "bg-red-50 dark:bg-red-900/20 text-red-600"
              )}>
                {getIcon(log.type)}
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-bold truncate leading-none">{log.action}</p>
                  <span className="text-[9px] text-zinc-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-[9px] font-bold uppercase tracking-widest",
                    log.status === 'SUCCESS' ? "text-green-500" : "text-red-500"
                  )}>
                    {log.status}
                  </span>
                  {log.details?.durationMs && (
                    <span className="text-[9px] text-zinc-500">• {log.details.durationMs}ms</span>
                  )}
                  {log.details?.score && (
                    <span className="text-[9px] text-zinc-500">• Score: {log.details.score}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="p-3 bg-zinc-50/50 dark:bg-zinc-900/50 border-t text-center">
        <p className="text-[9px] text-zinc-400 font-medium">Viewing last {logs.length} system events</p>
      </div>
    </Card>
  );
}

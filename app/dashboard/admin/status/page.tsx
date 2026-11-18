import { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, StatusPip } from "@/components/ui-elements";
import { Shield, Key, Zap, AlertTriangle, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Security Status — NexPulse Admin",
};

export const dynamic = 'force-dynamic';

export default async function AdminStatusPage() {
  const now = new Date();
  const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  
  const [failedLogins, activeKeys, totalReviews, rlsBlockedCount, recentLogs] = await Promise.all([
    prisma.activityLog.count({ where: { action: 'FAILED_LOGIN', createdAt: { gte: hourAgo } } }),
    prisma.apiKey.count(),
    prisma.codeReview.count(),
    prisma.activityLog.count({ where: { action: 'UNAUTHORIZED_ACCESS' } }),
    prisma.activityLog.findMany({
      where: {
        action: {
          in: ['FAILED_LOGIN', 'UNAUTHORIZED_ACCESS', 'RATE_LIMITED', 'PASSWORD_RESET', 'MFA_ENABLED']
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 8,
    }),
  ]);

  const metrics = [
    {
      title: "Failed logins (1h)",
      value: failedLogins,
      icon: Shield,
      isWarning: failedLogins > 5,
      description: "Brute-force detection window",
    },
    {
      title: "Active API keys",
      value: activeKeys,
      icon: Key,
      isWarning: false,
      description: "Machine access tokens",
    },
    {
      title: "Code audits",
      value: totalReviews,
      icon: Zap,
      isWarning: false,
      description: "Total repositories scanned",
    },
    {
      title: "Access violations",
      value: rlsBlockedCount,
      icon: AlertTriangle,
      isWarning: rlsBlockedCount > 0,
      description: "RBAC blocked requests",
    },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/dashboard/admin"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            Back to admin users
          </Link>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Security status</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Real-time authentication and access enforcement telemetry.</p>
        </div>
        <StatusPip status="UP" label="Enforcement active" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {metrics.map((m, i) => (
          <Card key={i} className="p-4 border-border">
            <div className="flex items-center justify-between mb-3 text-muted-foreground">
              <span className="text-xs font-medium text-muted-foreground">{m.title}</span>
              <m.icon className="h-4 w-4" strokeWidth={1.5} />
            </div>
            <p className={`text-2xl font-semibold font-mono mb-1 ${m.isWarning ? "text-status-down" : "text-foreground"}`}>
              {m.value}
            </p>
            <p className="text-[11px] text-muted-foreground">{m.description}</p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden border-border">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-foreground" strokeWidth={1.5} />
            <h3 className="text-xs font-semibold text-foreground">Recent security events</h3>
          </div>
          <span className="text-xs font-mono text-muted-foreground">Last {recentLogs.length} events</span>
        </div>

        <div className="divide-y divide-border">
          {recentLogs.length === 0 ? (
            <p className="p-8 text-center text-xs text-muted-foreground">
              No security anomalies or authorization violations recorded.
            </p>
          ) : (
            recentLogs.map((log) => (
              <div key={log.id} className="p-3.5 flex items-center justify-between gap-4 text-xs font-mono">
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${log.status === "SUCCESS" ? "bg-status-up" : "bg-status-down"}`} />
                  <span className="font-medium text-foreground">{log.action}</span>
                  <span className="text-muted-foreground truncate">{log.type}</span>
                </div>
                <span className="text-muted-foreground shrink-0 text-[11px]">
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

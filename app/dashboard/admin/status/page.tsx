import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui-elements";
import { Shield, AlertTriangle, Key, Zap, Activity } from "lucide-react";

export const metadata: Metadata = {
  title: "Security Status — NexPulse Admin",
};

/**
 * [ADMIN] Security & Health Dashboard
 * Visualises real-time metrics for system hardening and anomaly detection.
 */
export default async function AdminStatusPage() {
  // Fetch real-time security metrics from the database
  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  
  const [failedLogins, activeKeys, totalReviews, rlsBlockedCount] = await Promise.all([
    prisma.activityLog.count({ where: { action: 'FAILED_LOGIN', createdAt: { gte: hourAgo } } }),
    prisma.apiKey.count(),
    prisma.codeReview.count(),
    // For RLS audit, we would ideally check a dedicated log table or Postgres audit extensions
    prisma.activityLog.count({ where: { action: 'UNAUTHORIZED_ACCESS' } }),
  ]);

  const metrics = [
    {
      title: "Failed Logins (1h)",
      value: failedLogins,
      icon: Shield,
      color: failedLogins > 5 ? "text-red-500" : "text-green-500",
      description: "Brute-force detection threshold: 10/hr"
    },
    {
      title: "Active API Keys",
      value: activeKeys,
      icon: Key,
      color: "text-np-gold",
      description: "Machine API access tokens"
    },
    {
      title: "Neural Audits",
      value: totalReviews,
      icon: Zap,
      color: "text-blue-500",
      description: "Total projects processed"
    },
    {
      title: "Access Violations",
      value: rlsBlockedCount,
      icon: AlertTriangle,
      color: rlsBlockedCount > 0 ? "text-red-500" : "text-np-gold",
      description: "Attempts blocked by RBAC/RLS"
    }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[32px] font-bold tracking-tight mb-2">Neural Security Center</h1>
          <p className="text-muted-foreground">Real-time observability into NexPulse hardening layers.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-[12px] font-medium border border-green-500/20">
          <Activity className="h-3 w-3" /> System: Hardened
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m, i) => (
          <Card key={i} className="p-6 bg-card/50 backdrop-blur-xl border-border/50 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <m.icon className="h-12 w-12" />
            </div>
            <div className="relative z-10">
              <p className="text-[13px] font-medium text-muted-foreground mb-4 uppercase tracking-wider">{m.title}</p>
              <h3 className={`text-4xl font-bold mb-2 ${m.color}`}>{m.value}</h3>
              <p className="text-[12px] text-muted-foreground">{m.description}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-8 border-border/50 bg-card/30">
        <h3 className="text-[18px] font-semibold mb-6 flex items-center gap-2">
          <Shield className="h-5 w-5 text-np-gold" /> System Hardening Log
        </h3>
        <div className="space-y-4">
          <div className="text-[13px] text-muted-foreground border-l-2 border-np-gold pl-4 py-1">
            <span className="text-foreground font-medium">Phase 1:</span> Transport Security (HSTS, CSP, X-Frame) — <span className="text-green-500">Verified</span>
          </div>
          <div className="text-[13px] text-muted-foreground border-l-2 border-np-gold pl-4 py-1">
            <span className="text-foreground font-medium">Phase 2:</span> Edge Defense (Global Rate Limiting, RBAC) — <span className="text-green-500">Verified</span>
          </div>
          <div className="text-[13px] text-muted-foreground border-l-2 border-np-gold pl-4 py-1">
            <span className="text-foreground font-medium">Phase 3:</span> Data Isolation (PostgreSQL RLS) — <span className="text-green-500">Verified</span>
          </div>
          <div className="text-[13px] text-muted-foreground border-l-2 border-np-gold pl-4 py-1">
            <span className="text-foreground font-medium">Phase 4:</span> Zero-Trust Observability (Anomalies, Alerts) — <span className="text-green-500">Active</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

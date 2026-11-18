import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getStatusPageData(slug: string) {
  const user = await prisma.user.findFirst({
    where: {
      statusPageEnabled: true,
      OR: [
        { statusPageSlug: slug },
        { name: { equals: slug, mode: 'insensitive' } },
      ],
    },
    select: {
      name: true,
      plan: true,
      monitors: {
        where: { isPublic: true },
        select: {
          id: true,
          name: true,
          url: true,
          status: true,
          lastChecked: true,
          checks: {
            orderBy: { createdAt: 'desc' },
            take: 90,
            select: { status: true, latency: true, createdAt: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
  return user;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const user = await getStatusPageData(slug);
  if (!user) return { title: 'Status Page Not Found' };
  return {
    title: `${user.name || slug} — Status`,
    description: `Live uptime status for ${user.name || slug}'s services.`,
  };
}

export default async function StatusPage({ params }: PageProps) {
  const { slug } = await params;
  const user = await getStatusPageData(slug);
  if (!user) notFound();

  type CheckData = { status: string; latency: number | null; createdAt: Date };
  type MonitorData = {
    id: string; name: string; url: string; status: string;
    lastChecked: Date | null; checks: CheckData[];
  };

  const monitors = user.monitors.map((m: MonitorData) => {
    const total = m.checks.length;
    const up = m.checks.filter((c: CheckData) => c.status === 'UP').length;
    const uptimePct = total > 0 ? Math.round((up / total) * 1000) / 10 : null;
    const withLatency = m.checks.filter((c: CheckData) => c.latency !== null);
    const avgLatency = withLatency.length > 0
      ? Math.round(withLatency.reduce((s: number, c: CheckData) => s + (c.latency || 0), 0) / withLatency.length)
      : null;
    return { ...m, uptimePct, avgLatency };
  });

  const anyDown = monitors.some((m: { status: string }) => m.status === 'DOWN');
  const allUnknown = monitors.every((m: { status: string }) => m.status === 'UNKNOWN');
  const overallStatus = monitors.length === 0 ? 'no_monitors'
    : anyDown ? 'degraded'
    : allUnknown ? 'unknown'
    : 'operational';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-3xl mx-auto px-4 py-12 sm:py-16 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div className="space-y-1">
            <p className="text-xs font-mono text-muted-foreground">Public status directory</p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {user.name || slug}
            </h1>
          </div>
          <div className="text-xs font-mono text-muted-foreground sm:text-right">
            <span>Last checked: </span>
            <span className="text-foreground">{new Date().toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Overall status banner */}
        <div className="p-4 rounded-lg border border-border bg-card flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`h-2.5 w-2.5 rounded-full ${overallStatus === "operational" ? "bg-status-up" : overallStatus === "degraded" ? "bg-status-down" : "bg-status-warn"}`} />
            <div>
              <p className="text-sm font-semibold text-foreground">
                {overallStatus === "operational" ? "All services operational" : overallStatus === "degraded" ? "Partial service degradation detected" : "Monitoring checks running"}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Synthetic health probes running across global edge networks.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-muted border border-border text-foreground font-medium hidden sm:inline">
            {monitors.length} endpoints active
          </span>
        </div>

        {/* Monitors */}
        {monitors.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-border rounded-lg bg-card">
            <p className="text-xs text-muted-foreground">No public services currently exposed.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {monitors.map((m: MonitorData & { uptimePct: number | null; avgLatency: number | null }) => {
              const isDown = m.status === 'DOWN';
              const oldestCheck = m.checks[m.checks.length - 1];
              const timeWindowLabel = oldestCheck
                ? `${Math.max(1, Math.round((Date.now() - new Date(oldestCheck.createdAt).getTime()) / (60 * 60 * 1000)))}h window`
                : "Active window";

              return (
                <div key={m.id} className="p-4 sm:p-5 rounded-lg border border-border bg-card space-y-3">
                  {/* Monitor header */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`h-2 w-2 rounded-full shrink-0 ${isDown ? "bg-status-down" : m.status === "UNKNOWN" ? "bg-status-warn" : "bg-status-up"}`} />
                      <p className="text-sm font-medium text-foreground truncate">
                        {m.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono shrink-0">
                      {m.avgLatency !== null && (
                        <span className="text-muted-foreground hidden sm:inline">{m.avgLatency}ms avg</span>
                      )}
                      {m.uptimePct !== null && (
                        <span className={`font-semibold ${m.uptimePct >= 99 ? "text-status-up" : m.uptimePct >= 95 ? "text-status-warn" : "text-status-down"}`}>
                          {m.uptimePct}%
                        </span>
                      )}
                      <span className="text-[11px] px-2 py-0.5 rounded bg-muted border border-border text-foreground font-medium">
                        {m.status}
                      </span>
                    </div>
                  </div>

                  {/* History bar — last 90 checks */}
                  {m.checks.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <div className="flex gap-1 items-end h-6">
                        {[...m.checks].reverse().map((c, i) => (
                          <div
                            key={i}
                            title={`${c.status}${c.latency ? ` · ${c.latency}ms` : ''} · ${new Date(c.createdAt).toLocaleTimeString()}`}
                            className={`flex-1 rounded-[1px] transition-all hover:opacity-75 ${c.status === "UP" ? "bg-status-up" : c.status === "DOWN" ? "bg-status-down" : "bg-status-warn"}`}
                            style={{
                              height: c.status === "UP" ? "18px" : "10px",
                            }}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                        <span>{timeWindowLabel}</span>
                        <span>Now</span>
                      </div>
                    </div>
                  )}

                  {m.lastChecked && (
                    <p className="text-[11px] text-muted-foreground font-mono">
                      Last checked {new Date(m.lastChecked).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div className="pt-8 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <Link href="/" className="hover:text-foreground transition-colors font-mono">
            Powered by NexPulse
          </Link>
          <span className="font-mono">Automated synthetic monitoring</span>
        </div>
      </div>
    </div>
  );
}

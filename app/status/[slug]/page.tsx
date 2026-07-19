import { notFound } from 'next/navigation';
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

  const statusConfig = {
    operational: { label: 'All Systems Operational', color: '#1D9E75', bg: 'rgba(29,158,117,0.08)', border: 'rgba(29,158,117,0.2)' },
    degraded: { label: 'Partial Outage Detected', color: '#E05C2A', bg: 'rgba(224,92,42,0.08)', border: 'rgba(224,92,42,0.2)' },
    unknown: { label: 'Checking Systems...', color: '#BA7517', bg: 'rgba(186,117,23,0.08)', border: 'rgba(186,117,23,0.2)' },
    no_monitors: { label: 'No Services Configured', color: '#888', bg: 'rgba(136,136,136,0.08)', border: 'rgba(136,136,136,0.2)' },
  };

  const cfg = statusConfig[overallStatus];

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', color: '#e5e5e5', fontFamily: 'ui-monospace, monospace' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 20px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#555', marginBottom: 8 }}>
            ⚡ Status Page
          </p>
          <h1 style={{ fontSize: 28, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 4 }}>
            {user.name || slug}
          </h1>
          <p style={{ fontSize: 13, color: '#666' }}>
            Last updated: {new Date().toUTCString()}
          </p>
        </div>

        {/* Overall status banner */}
        <div style={{
          background: cfg.bg,
          border: `0.5px solid ${cfg.border}`,
          borderLeft: `3px solid ${cfg.color}`,
          borderRadius: 10,
          padding: '16px 20px',
          marginBottom: 32,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <div style={{
            width: 10, height: 10, borderRadius: '50%', background: cfg.color, flexShrink: 0,
            boxShadow: overallStatus === 'operational' ? `0 0 8px ${cfg.color}` : 'none',
          }} />
          <p style={{ fontSize: 15, fontWeight: 500, color: cfg.color }}>{cfg.label}</p>
        </div>

        {/* Monitors */}
        {monitors.length === 0 ? (
          <p style={{ color: '#555', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>
            No public services configured.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {monitors.map((m: MonitorData & { uptimePct: number | null; avgLatency: number | null }) => {
              const isDown = m.status === 'DOWN';
              const dotColor = isDown ? '#E05C2A' : m.status === 'UNKNOWN' ? '#BA7517' : '#1D9E75';

              return (
                <div key={m.id} style={{
                  background: '#111',
                  border: '0.5px solid #1e1e1e',
                  borderRadius: 10,
                  padding: '16px 20px',
                }}>
                  {/* Monitor header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%', background: dotColor, flexShrink: 0,
                        boxShadow: !isDown && m.status !== 'UNKNOWN' ? `0 0 6px ${dotColor}` : 'none',
                      }} />
                      <p style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {m.name}
                      </p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
                      {m.avgLatency !== null && (
                        <span style={{ fontSize: 11, color: '#555' }}>{m.avgLatency}ms avg</span>
                      )}
                      {m.uptimePct !== null && (
                        <span style={{ fontSize: 12, fontWeight: 500, color: m.uptimePct >= 99 ? '#1D9E75' : m.uptimePct >= 95 ? '#BA7517' : '#E05C2A' }}>
                          {m.uptimePct}%
                        </span>
                      )}
                      <span style={{
                        fontSize: 10, padding: '2px 8px', borderRadius: 20,
                        background: isDown ? 'rgba(224,92,42,0.1)' : 'rgba(29,158,117,0.1)',
                        color: isDown ? '#E05C2A' : '#1D9E75',
                        fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em',
                      }}>
                        {m.status === 'UNKNOWN' ? 'Checking' : m.status}
                      </span>
                    </div>
                  </div>

                  {/* History bar — last 90 checks as thin bars */}
                  {m.checks.length > 0 && (
                    <div>
                      <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 28 }}>
                        {[...m.checks].reverse().map((c, i) => (
                          <div
                            key={i}
                            title={`${c.status}${c.latency ? ` · ${c.latency}ms` : ''} · ${new Date(c.createdAt).toLocaleTimeString()}`}
                            style={{
                              flex: 1,
                              height: c.status === 'UP' ? 24 : 12,
                              borderRadius: 2,
                              background: c.status === 'UP' ? '#1D9E75' : c.status === 'DOWN' ? '#E05C2A' : '#333',
                              opacity: 0.8,
                              transition: 'height 0.1s',
                            }}
                          />
                        ))}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                        <span style={{ fontSize: 10, color: '#444' }}>7.5h ago</span>
                        <span style={{ fontSize: 10, color: '#444' }}>Now</span>
                      </div>
                    </div>
                  )}

                  {/* Last checked */}
                  {m.lastChecked && (
                    <p style={{ fontSize: 11, color: '#444', marginTop: 8 }}>
                      Last checked {new Date(m.lastChecked).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: 48, paddingTop: 24, borderTop: '0.5px solid #1e1e1e', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a
            href="https://nextjs-optimizer-suite.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 11, color: '#444', textDecoration: 'none', letterSpacing: '0.1em', textTransform: 'uppercase' }}
          >
            ⚡ Powered by NexPulse
          </a>
          <p style={{ fontSize: 11, color: '#333' }}>
            Updates every 5 min
          </p>
        </div>
      </div>
    </div>
  );
}

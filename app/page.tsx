import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui-elements";
import { PLAN_LIMITS } from "@/lib/plans";
import { LandingFeatureShowcase } from "@/components/landing-feature-showcase";
import {
  Activity,
  ArrowRight,
  Check,
  Mail,
  Cpu,
  DollarSign,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const valueProps = [
  { label: "Frameworks supported", value: "Any" },
  { label: "Avg. cache clear time", value: "< 200ms" },
  { label: "Uptime SLA", value: "99.9%" },
  { label: "Code audit languages", value: "15+" },
];

const bentoPillars = [
  {
    id: "observe",
    pillar: "PILLAR 01",
    title: "Deep Infrastructure Observability",
    subtitle: "Real-Time Health, Edge Caches & Status Pages",
    accent: "np-teal",
    icon: Activity,
    badge: "Observe Domain",
    items: [
      { name: "Live Uptime & Latency Monitors", desc: "HTTP, REST & gRPC endpoint health streaming in real-time across global PoPs." },
      { name: "Cache Pulse Engine", desc: "Sub-200ms edge cache invalidation by tag or path for Next.js, Nuxt & Remix." },
      { name: "Public Status Dashboards", desc: "Shareable SLA history pages at /status/your-org with zero setup required." },
    ],
  },
  {
    id: "autopilot",
    pillar: "PILLAR 02",
    title: "Autonomous AI Operations",
    subtitle: "Root Cause Correlation & Remediation Autopilot",
    accent: "np-gold",
    icon: Cpu,
    badge: "Autopilot AI Domain",
    items: [
      { name: "Incident Root-Cause Graph", desc: "Correlate telemetry latency spikes to precise culprit commits and database queries." },
      { name: "Remediation Guardrails", desc: "Human-in-the-loop and autonomous rollback execution mode with safety gates." },
      { name: "PR Code Review Bot", desc: "Automated GitHub pull request reviewer posting Code Health scores & recommendations." },
    ],
  },
  {
    id: "finops",
    pillar: "PILLAR 03",
    title: "FinOps & Developer Ecosystem",
    subtitle: "Zombie Infrastructure Hunter & MCP Agent Protocol",
    accent: "np-teal",
    icon: DollarSign,
    badge: "FinOps & Dev Domain",
    items: [
      { name: "Zombie Resource Hunter", desc: "Continuous scanning for unattached EBS disks, idle database replicas, and orphaned IPs." },
      { name: "Model Context Protocol (MCP)", desc: "Direct JSON-RPC 2.0 telemetry interface for Cursor, Claude Desktop, and AI agents." },
      { name: "Neural Code Auditing", desc: "AI-powered repository vulnerability auditing, diff analysis, and security webhooks." },
    ],
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-np-gold/20">
      <Navbar />

      <main className="flex-1">
        {/* ── Hero ──────────────────────────────────────── */}
        <section className="relative pt-28 pb-24 md:pt-40 md:pb-32 overflow-hidden">
          {/* subtle grid */}
          <div className="absolute inset-0 np-grid-bg opacity-60 pointer-events-none" />
          {/* warm glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-np-gold/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-4 text-center">

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] text-foreground mb-6 pt-4">
              Unified Observability &<br />
              <span className="text-np-gold bg-gradient-to-r from-np-gold via-amber-300 to-np-gold bg-clip-text text-transparent">
                Autonomous AI Operations.
              </span>
            </h1>

            <p className="text-[16px] md:text-[18px] text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
              Stop toggling between 10 separate tools. NexPulse unifies real-time observability, autonomous AI incident response, and cloud FinOps waste recovery into 3 clean pillars.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/register" className="np-btn-primary h-12 px-8 text-[14px] gap-2 shadow-lg shadow-np-gold/10">
                Start for free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/dashboard" className="np-btn-outline h-12 px-8 text-[14px]">
                Explore Dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* ── Value strip ───────────────────────────────── */}
        <div style={{ borderTop: "0.5px solid var(--border)", borderBottom: "0.5px solid var(--border)" }}>
          <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-border">
            {valueProps.map((v) => (
              <div key={v.label} className="flex flex-col items-center gap-1 px-2 md:px-6">
                <span className="text-2xl md:text-3xl font-bold text-np-gold">{v.value}</span>
                <span className="label-category text-center text-[10px] tracking-widest uppercase">{v.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Interactive Live Console ──────────────────── */}
        <LandingFeatureShowcase />

        {/* ── 3-Pillar Bento Grid Section ───────────────── */}
        <section className="py-20 max-w-6xl mx-auto px-4">
          <div className="text-center mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-np-teal/10 border border-np-teal/30 text-np-teal text-[11px] font-bold uppercase tracking-widest">
              <Layers className="h-3.5 w-3.5" />
              3-Pillar Architecture
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Structured Around 3 Core Engineering Pillars</h2>
            <p className="text-[14px] text-muted-foreground max-w-xl mx-auto">
              No matter how many features your team needs, NexPulse organizes everything cleanly into 3 focused domains.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {bentoPillars.map((p) => (
              <Card
                key={p.id}
                className="p-7 flex flex-col justify-between border-border/80 hover:border-np-gold/40 hover:shadow-2xl transition-all duration-300 bg-gradient-to-b from-card/80 via-card to-card/60 relative overflow-hidden"
              >
                <div className="space-y-6">
                  {/* Pillar Top */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-np-gold px-2.5 py-1 rounded bg-np-gold/10 border border-np-gold/20">
                      {p.pillar}
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground uppercase">{p.badge}</span>
                  </div>

                  {/* Title & Icon */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-ui bg-np-gold/10 border border-np-gold/30 flex items-center justify-center text-np-gold shrink-0">
                        <p.icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-bold leading-tight text-foreground">{p.title}</h3>
                    </div>
                    <p className="text-[12px] text-np-teal font-mono">{p.subtitle}</p>
                  </div>

                  {/* Bullet Sub-Items */}
                  <div className="space-y-4 pt-2 border-t border-border/50">
                    {p.items.map((item, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-np-teal shrink-0" />
                          <span className="text-[13px] font-bold text-foreground">{item.name}</span>
                        </div>
                        <p className="text-[12px] text-slate-300 leading-relaxed pl-5">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-border/40">
                  <Link href="/dashboard" className="np-btn-outline w-full justify-center text-[12px] gap-2">
                    Explore {p.badge} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Pricing ───────────────────────────────────── */}
        <section className="py-24" id="pricing" style={{ borderTop: "0.5px solid var(--border)" }}>
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-14">
              <p className="label-category mb-3 text-[11px] text-np-gold font-bold uppercase tracking-widest">Transparent Pricing</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Plans for every scale</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-5 items-start">
              {Object.entries(PLAN_LIMITS).map(([key, plan]) => {
                const isPro = key === "PRO";
                return (
                  <Card
                    key={key}
                    className={cn(
                      "p-7 flex flex-col gap-6 relative transition-all duration-300",
                      isPro && "ring-1 ring-np-gold bg-gradient-to-b from-np-gold/5 to-card"
                    )}
                  >
                    {isPro && (
                      <div
                        className="absolute -top-3 left-0 right-0 h-0.5 rounded-t-card"
                        style={{ background: "var(--np-gold)" }}
                      />
                    )}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <p className="label-category font-bold">{plan.name}</p>
                        {isPro && (
                          <span className="text-[9px] uppercase tracking-widest bg-np-gold/20 text-np-gold font-bold px-2 py-0.5 rounded border border-np-gold/40">
                            Most Popular
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-1 mb-3">
                        <span className="text-4xl font-bold font-mono">{plan.price}</span>
                        <span className="text-[13px] text-muted-foreground">/mo</span>
                      </div>
                      <p className="text-[13px] text-slate-300 leading-relaxed">{plan.description}</p>
                    </div>

                    <ul className="space-y-2.5">
                      {plan.features.map((f: { active: boolean; text: string }, i: number) => (
                        <li
                          key={i}
                          className={cn("flex items-center gap-2.5 text-[13px]", !f.active && "opacity-40")}
                        >
                          <Check
                            className="h-3.5 w-3.5 shrink-0"
                            style={{ color: f.active ? "var(--np-teal)" : "var(--np-slate)" }}
                          />
                          <span className={f.active ? "text-foreground font-medium" : "text-muted-foreground"}>
                            {f.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href="/register"
                      className={cn(
                        "mt-auto",
                        isPro ? "np-btn-primary w-full justify-center shadow-lg shadow-np-gold/10" : "np-btn-outline w-full justify-center"
                      )}
                    >
                      Get started
                    </Link>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── CTA banner ────────────────────────────────── */}
        <section className="py-24 max-w-5xl mx-auto px-4">
          <Card className="p-10 md:p-16 text-center relative overflow-hidden np-grid-bg border-np-gold/20">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-np-gold/10 blur-[80px] pointer-events-none" />
            <div className="relative space-y-4">
              <p className="label-category text-[11px] text-np-gold font-bold uppercase tracking-widest">Ready to ship</p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">
                Full-stack observability & AI ops,<br />
                <span className="text-np-gold">zero hassle.</span>
              </h2>
              <p className="text-slate-300 text-[15px] max-w-md mx-auto leading-relaxed">
                Connect your first repository or endpoint in under 2 minutes. No complex agents or proxy setups.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <Link href="/register" className="np-btn-primary h-12 px-8 text-[14px] gap-2 shadow-lg shadow-np-gold/10">
                  Start free <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/login" className="np-btn-outline h-12 px-8 text-[14px]">
                  Sign in to console
                </Link>
              </div>
            </div>
          </Card>
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────── */}
      <footer style={{ borderTop: "0.5px solid var(--border)" }} className="py-12">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-np-gold" />
            <span className="text-[14px] font-bold">NexPulse</span>
          </div>
          <p className="label-category text-center text-[11px]">© 2026 NexPulse. All rights reserved.</p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link href="/docs" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">Docs</Link>
            <Link href="/login" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">Login</Link>
            <a href="https://mail.google.com/mail/?view=cm&fs=1&to=nexpulse.team@gmail.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-np-gold transition-colors">
              <Mail className="h-4 w-4" />
            </a>
            <Link href="https://github.com/inkand-paper/Optimizer" target="_blank" aria-label="GitHub" className="text-muted-foreground hover:text-np-gold transition-colors">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.185 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"/></svg>
            </Link>
            <Link href="https://discord.gg/gSw2sHxZtn" target="_blank" aria-label="Discord" className="text-muted-foreground hover:text-np-gold transition-colors">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

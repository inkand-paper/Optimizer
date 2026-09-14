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
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const valueProps = [
  { label: "Frameworks supported", value: "Any" },
  { label: "Avg. cache clear time", value: "< 200ms" },
  { label: "Uptime SLA", value: "99.9%" },
  { label: "Languages supported", value: "15+" },
];

const featureDomains = [
  {
    id: "observe",
    title: "Deep Observability",
    subtitle: "Uptime · Latency · Status Pages",
    icon: Activity,
    items: [
      { name: "Live Uptime & Latency Monitors", desc: "HTTP, REST & gRPC endpoint health streaming across global edge PoPs in real-time." },
      { name: "Cache Pulse Engine", desc: "Sub-200ms edge cache invalidation by tag or path for Next.js, Nuxt & Remix." },
      { name: "Public Status Pages", desc: "Shareable SLA history dashboards at /status/your-org with zero-config setup." },
    ],
  },
  {
    id: "autopilot",
    title: "Autonomous AI Engine",
    subtitle: "Root Cause · Autopilot · PR Review",
    icon: Cpu,
    items: [
      { name: "Incident Root-Cause Graph", desc: "Correlates latency spikes to exact culprit commits and slow database queries automatically." },
      { name: "Autopilot Remediation", desc: "Human-in-the-loop or fully autonomous rollback execution with configurable safety gates." },
      { name: "PR Code Review Bot", desc: "Posts Code Health scores and architecture recommendations directly on GitHub pull requests." },
    ],
  },
  {
    id: "finops",
    title: "Cost & Developer Tools",
    subtitle: "FinOps · MCP Server · Code Audit",
    icon: DollarSign,
    items: [
      { name: "Zombie Resource Hunter", desc: "Continuous scanning for unattached EBS volumes, idle database replicas, and orphaned IPs." },
      { name: "MCP Server Protocol", desc: "JSON-RPC 2.0 telemetry interface for Cursor, Claude Desktop, and AI coding agents." },
      { name: "Neural Code Auditing", desc: "AI-powered repository vulnerability scanning, diff analysis, and security webhooks." },
    ],
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-np-gold/20">
      <Navbar />

      <main className="flex-1">
        {/* ── Hero ───────────────────────── */}
        <section className="relative pt-32 pb-28 md:pt-44 md:pb-36 overflow-hidden">
          <div className="absolute inset-0 np-grid-bg opacity-40 pointer-events-none" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[420px] bg-np-gold/5 rounded-full blur-[130px] pointer-events-none" />

          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.06] text-foreground mb-5">
              Unified Observability<br />
              <span className="bg-gradient-to-r from-np-gold via-amber-300 to-np-gold bg-clip-text text-transparent">
                & autonomous ops.
              </span>
            </h1>

            <p className="text-[17px] text-muted-foreground max-w-xl mx-auto leading-relaxed mb-10">
              NexPulse gives your team real-time infrastructure health monitoring, autonomous AI incident resolution, and cloud cost recovery — in a single console.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/register" className="np-btn-primary h-12 px-8 text-[14px] gap-2 shadow-lg shadow-np-gold/15">
                Get started free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/dashboard" className="np-btn-outline h-12 px-8 text-[14px]">
                Open dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* ── Stats strip ─────────────────── */}
        <div style={{ borderTop: "0.5px solid var(--border)", borderBottom: "0.5px solid var(--border)" }}>
          <div className="max-w-4xl mx-auto px-4 py-7 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0 md:divide-x divide-border">
            {valueProps.map((v) => (
              <div key={v.label} className="flex flex-col items-center gap-1 px-2 md:px-6">
                <span className="text-2xl md:text-3xl font-bold text-np-gold font-mono">{v.value}</span>
                <span className="text-center text-[10px] tracking-widest uppercase text-muted-foreground font-medium">{v.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Live Feature Playground ─────── */}
        <LandingFeatureShowcase />

        {/* ── Feature Domains ─────────────── */}
        <section className="py-20 max-w-6xl mx-auto px-4" style={{ borderTop: "0.5px solid var(--border)" }}>
          <div className="text-center mb-14 space-y-2">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Everything your team needs</h2>
            <p className="text-[15px] text-muted-foreground max-w-lg mx-auto leading-relaxed">
              From uptime monitoring to AI-driven incident response and cloud cost recovery — all in one console.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featureDomains.map((domain) => (
              <Card
                key={domain.id}
                className="p-7 flex flex-col justify-between border-border/70 hover:border-np-gold/50 hover:shadow-xl hover:shadow-np-gold/5 transition-all duration-300 bg-gradient-to-b from-card/90 to-card"
              >
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="h-10 w-10 rounded-ui bg-np-gold/10 border border-np-gold/25 flex items-center justify-center text-np-gold">
                      <domain.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-[16px] font-bold text-foreground leading-snug">{domain.title}</h3>
                      <p className="text-[11px] text-np-teal font-mono uppercase tracking-wide mt-0.5 opacity-80">{domain.subtitle}</p>
                    </div>
                  </div>

                  <div className="space-y-3.5 pt-2 border-t border-border/50">
                    {domain.items.map((item, idx) => (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-np-teal shrink-0 mt-0.5" />
                          <span className="text-[13px] font-semibold text-foreground leading-snug">{item.name}</span>
                        </div>
                        <p className="text-[12px] text-muted-foreground leading-relaxed pl-5">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-border/40">
                  <Link href="/dashboard" className="np-btn-outline w-full justify-center text-[12px] gap-2">
                    Explore in dashboard <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Pricing ─────────────────────── */}
        <section className="py-24" id="pricing" style={{ borderTop: "0.5px solid var(--border)" }}>
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-14 space-y-2">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Simple, honest pricing</h2>
              <p className="text-[15px] text-muted-foreground max-w-sm mx-auto">Start free. Upgrade when your team grows.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-5 items-start">
              {Object.entries(PLAN_LIMITS).map(([key, plan]) => {
                const isPro = key === "PRO";
                return (
                  <Card
                    key={key}
                    className={cn(
                      "p-7 flex flex-col gap-6 relative transition-all duration-300",
                      isPro
                        ? "ring-1 ring-np-gold shadow-lg shadow-np-gold/10 bg-gradient-to-b from-np-gold/5 to-card"
                        : "border-border/70"
                    )}
                  >
                    {isPro && (
                      <div
                        className="absolute -top-px left-0 right-0 h-[2px] rounded-t-[inherit]"
                        style={{ background: "var(--np-gold)" }}
                      />
                    )}

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[13px] font-bold uppercase tracking-widest text-muted-foreground">{plan.name}</p>
                        {isPro && (
                          <span className="text-[9px] uppercase tracking-widest bg-np-gold/20 text-np-gold font-bold px-2 py-0.5 rounded border border-np-gold/30">
                            Most popular
                          </span>
                        )}
                      </div>
                      <div className="flex items-baseline gap-1 mb-3">
                        <span className="text-[42px] font-bold font-mono leading-none">{plan.price}</span>
                        <span className="text-[13px] text-muted-foreground mb-1">/mo</span>
                      </div>
                      <p className="text-[13px] text-muted-foreground leading-relaxed">{plan.description}</p>
                    </div>

                    <ul className="space-y-2.5 flex-1">
                      {plan.features.map((f: { active: boolean; text: string }, i: number) => (
                        <li key={i} className={cn("flex items-center gap-2.5 text-[13px]", !f.active && "opacity-35")}>
                          <Check
                            className="h-3.5 w-3.5 shrink-0"
                            style={{ color: f.active ? "var(--np-teal)" : "currentColor" }}
                          />
                          <span className={f.active ? "text-foreground" : "text-muted-foreground"}>
                            {f.text}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      href="/register"
                      className={cn(
                        "mt-auto text-center",
                        isPro
                          ? "np-btn-primary w-full justify-center shadow-md shadow-np-gold/15"
                          : "np-btn-outline w-full justify-center"
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

        {/* ── CTA ─────────────────────────── */}
        <section className="py-24 max-w-4xl mx-auto px-4">
          <Card className="p-10 md:p-16 text-center relative overflow-hidden border-np-gold/20">
            <div className="absolute inset-0 np-grid-bg opacity-30 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-np-gold/8 blur-[70px] pointer-events-none" />
            <div className="relative space-y-5">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
                Connected in under 2 minutes.<br />
                <span className="text-np-gold">No agents. No complexity.</span>
              </h2>
              <p className="text-muted-foreground text-[15px] max-w-sm mx-auto leading-relaxed">
                Add your first endpoint or repository and start catching issues before your users ever do.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link href="/register" className="np-btn-primary h-12 px-8 text-[14px] gap-2 shadow-md shadow-np-gold/15">
                  Start for free <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/login" className="np-btn-outline h-12 px-8 text-[14px]">
                  Sign in
                </Link>
              </div>
            </div>
          </Card>
        </section>
      </main>

      {/* ── Footer ──────────────────────── */}
      <footer style={{ borderTop: "0.5px solid var(--border)" }} className="py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-np-gold" />
            <span className="text-[14px] font-bold tracking-tight">NexPulse</span>
          </div>

          <p className="text-[11px] text-muted-foreground">© 2026 NexPulse. All rights reserved.</p>

          <div className="flex items-center gap-5 flex-wrap justify-center">
            <Link href="/docs" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">Docs</Link>
            <Link href="/login" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">Login</Link>
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=nexpulse.team@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-np-gold transition-colors"
              aria-label="Email"
            >
              <Mail className="h-4 w-4" />
            </a>
            <Link href="https://github.com/inkand-paper/Optimizer" target="_blank" aria-label="GitHub" className="text-muted-foreground hover:text-np-gold transition-colors">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.185 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z" />
              </svg>
            </Link>
            <Link href="https://discord.gg/gSw2sHxZtn" target="_blank" aria-label="Discord" className="text-muted-foreground hover:text-np-gold transition-colors">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
              </svg>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

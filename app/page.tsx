import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui-elements";
import { PLAN_LIMITS } from "@/lib/plans";
import {
  Activity,
  ArrowRight,
  Zap,
  Shield,
  BarChart3,
  Check,
  Mail,
  Code2,
  Globe,
  GitBranch,
  MessageSquare,
  GitCompare,
  Cpu,
  DollarSign,
  Terminal,
  Sparkles,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Feature {
  icon: React.ElementType;
  accent: "np-teal" | "np-gold";
  title: string;
  body: string;
  badge?: string;
  badgeType?: "new" | "ai" | "finops" | "mcp";
}

const features: Feature[] = [
  {
    icon: Cpu,
    accent: "np-gold",
    badge: "Autopilot AI",
    badgeType: "ai",
    title: "Autopilot Incident & Remediation",
    body: "Autonomous root-cause analysis and incident engine. Correlates telemetry spikes, identifies culprit commits, and executes automatic rollbacks.",
  },
  {
    icon: DollarSign,
    accent: "np-teal",
    badge: "FinOps",
    badgeType: "finops",
    title: "Cost Intelligence & Zombie Hunter",
    body: "Continuous cloud waste monitoring. Detects and terminates unattached EBS disks, idle database replicas, and orphaned IPs to recover cloud spend.",
  },
  {
    icon: Terminal,
    accent: "np-gold",
    badge: "MCP Server",
    badgeType: "mcp",
    title: "Model Context Protocol (MCP)",
    body: "Expose real-time telemetry and control endpoints directly to AI agents in Cursor and Claude Desktop via JSON-RPC 2.0.",
  },
  {
    icon: GitBranch,
    accent: "np-teal",
    badge: "PR Bot",
    badgeType: "new",
    title: "Automated PR Code Review Bot",
    body: "Auto-audits pull requests on GitHub. Generates security, performance, and architecture scores with automated comment reports.",
  },
  {
    icon: Activity,
    accent: "np-teal",
    title: "Real-Time Health Monitoring",
    body: "Uptime, latency, and status codes streamed live across every endpoint and microservice in your stack.",
  },
  {
    icon: Zap,
    accent: "np-gold",
    title: "Cache Pulse Engine",
    body: "Surgically revalidate Next.js, Nuxt, and Remix edge caches by tag or path with sub-200ms global propagation.",
  },
  {
    icon: BarChart3,
    accent: "np-teal",
    title: "SEO & Technical Performance Audit",
    body: "Crawl any URL for Core Web Vitals, meta coverage, security headers, broken links, and structured schema data.",
  },
  {
    icon: Code2,
    accent: "np-gold",
    title: "Neural Code Audit",
    body: "Connect GitHub repos, upload code archives, or paste snippets to generate AI security and performance refactoring fixes.",
  },
  {
    icon: Globe,
    accent: "np-teal",
    title: "Public Status Pages",
    body: "Share live uptime dashboards at /status/your-org. Features per-monitor SLA history bars and real-time status indicators.",
  },
  {
    icon: MessageSquare,
    accent: "np-teal",
    title: "Pulse-AI Assistant",
    body: "Embedded AI technical assistant in your dashboard. Query telemetry, analyze root causes, or trigger system actions using natural language.",
  },
  {
    icon: GitCompare,
    accent: "np-gold",
    title: "Diff Auditing & Regression Tracking",
    body: "Audit two code versions side-by-side to track security regressions, resolved vulnerabilities, and health score deltas.",
  },
  {
    icon: Shield,
    accent: "np-teal",
    title: "Enterprise Webhooks & API Keys",
    body: "Scoped access tokens, HMAC webhook signature verification, Discord/Slack alert routing, and immutable audit logs.",
  },
];

const valueProps = [
  { label: "Frameworks supported", value: "Any" },
  { label: "Avg. cache clear time", value: "< 200ms" },
  { label: "Uptime SLA", value: "99.9%" },
  { label: "Code audit languages", value: "15+" },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-np-gold/20">
      <Navbar />

      <main className="flex-1">
        {/* ── Hero ──────────────────────────────────────── */}
        <section className="relative pt-28 pb-24 md:pt-40 md:pb-36 overflow-hidden">
          {/* subtle grid */}
          <div className="absolute inset-0 np-grid-bg opacity-60 pointer-events-none" />
          {/* warm glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-np-gold/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-4 text-center">

            {/* Announcement Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-np-gold/10 border border-np-gold/30 text-np-gold text-[12px] font-semibold mb-8 animate-in fade-in slide-in-from-top-2 duration-500">
              <Sparkles className="h-3.5 w-3.5" />
              <span>NexPulse v2.0 Released: Autopilot AI & FinOps Waste Hunter</span>
              <ArrowRight className="h-3 w-3" />
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.05] text-foreground mb-6">
              Unified Observability &<br />
              <span className="text-np-gold bg-gradient-to-r from-np-gold via-amber-300 to-np-gold bg-clip-text text-transparent">
                Autonomous AI Operations.
              </span>
            </h1>

            <p className="text-[16px] md:text-[18px] text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
              Uptime monitoring, cache revalidation, AI incident autopilot, FinOps cloud cost optimization, and MCP server protocols — unified in one sleek platform.
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

        {/* ── Feature grid ──────────────────────────────── */}
        <section className="py-24 max-w-6xl mx-auto px-4">
          <div className="text-center mb-16 space-y-2">
            <p className="label-category text-[11px] text-np-gold font-bold uppercase tracking-widest">Platform capabilities</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Built for Production Engineering</h2>
            <p className="text-[14px] text-muted-foreground max-w-xl mx-auto">
              From real-time health telemetry to autonomous self-healing and cloud cost recovery.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <Card
                key={f.title}
                className="p-6 flex flex-col justify-between gap-4 border-border/80 hover:border-np-gold/40 hover:shadow-xl hover:shadow-np-gold/5 hover:-translate-y-1 transition-all duration-300 bg-gradient-to-b from-card/60 to-card"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className="h-10 w-10 rounded-ui flex items-center justify-center border"
                      style={{
                        background: f.accent === "np-teal" ? "rgba(29,158,117,0.12)" : "rgba(180,140,60,0.12)",
                        borderColor: f.accent === "np-teal" ? "rgba(29,158,117,0.3)" : "rgba(180,140,60,0.3)",
                      }}
                    >
                      <f.icon
                        className="h-5 w-5"
                        style={{ color: f.accent === "np-teal" ? "var(--np-teal)" : "var(--np-gold)" }}
                      />
                    </div>

                    {f.badge && (
                      <span className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded border bg-np-gold/15 text-np-gold border-np-gold/30">
                        {f.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-[15px] font-bold leading-tight text-foreground">{f.title}</h3>
                  <p className="text-[13px] text-slate-300 leading-relaxed">{f.body}</p>
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

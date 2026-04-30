import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui-elements";
import { PLAN_LIMITS } from "@/lib/plans";
import {
  Activity,
  ArrowRight,
  Globe,
  Zap,
  Shield,
  BarChart3,
  Database,
  Smartphone,
  Check,
  Crown,
  Mail,
  Github,
} from "lucide-react";
import { cn } from "@/lib/utils";

const features = [
  {
    icon: Activity,
    title: "Real-Time Health Monitoring",
    body: "Uptime, latency, and status codes — streamed live across every endpoint in your registry.",
    accent: "np-teal",
  },
  {
    icon: Zap,
    title: "Cache Pulse Engine",
    body: "Surgically revalidate Next.js, Nuxt, and Remix caches by tag or path. Zero downtime.",
    accent: "np-gold",
  },
  {
    icon: BarChart3,
    title: "SEO & Performance Audit",
    body: "Crawl any URL for Core Web Vitals, meta coverage, security headers, and structured data.",
    accent: "np-teal",
  },
  {
    icon: Shield,
    title: "Webhook & Key Management",
    body: "Scoped API keys, rotating secrets, and a full audit trail. Everything your security team wants.",
    accent: "np-gold",
  },
];

const valueProps = [
  { label: "Frameworks supported", value: "Any" },
  { label: "Avg. cache clear time", value: "< 200ms" },
  { label: "Uptime SLA", value: "99.9 %" },
  { label: "API response P95", value: "< 80ms" },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* ── Hero ──────────────────────────────────────── */}
        <section className="relative pt-28 pb-24 md:pt-40 md:pb-36 overflow-hidden">
          {/* subtle grid */}
          <div className="absolute inset-0 np-grid-bg opacity-60 pointer-events-none" />
          {/* warm glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-np-gold/5 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-4 text-center">
            {/* eyebrow */}
            <p className="label-category mb-6 inline-flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-np-teal" />
              Infrastructure intelligence engine · v2.0
            </p>

            <h1 className="text-5xl sm:text-7xl md:text-8xl font-semibold tracking-tight leading-[1.02] text-foreground mb-6">
              Performance you<br />
              <span style={{ color: "var(--np-gold)" }}>can feel.</span>
            </h1>

            <p className="text-[17px] text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
              NexPulse gives engineering teams a single authoritative view of health,
              cache state, and audit results — across every framework, every region.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/register" className="np-btn-primary h-12 px-8 text-[14px] gap-2">
                Start for free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/dashboard" className="np-btn-outline h-12 px-8 text-[14px]">
                View demo
              </Link>
            </div>
          </div>
        </section>

        {/* ── Value strip ───────────────────────────────── */}
        <div style={{ borderTop: "0.5px solid var(--border)", borderBottom: "0.5px solid var(--border)" }}>
          <div className="max-w-5xl mx-auto px-4 py-6 grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-border">
            {valueProps.map((v) => (
              <div key={v.label} className="flex flex-col items-center gap-1 px-6">
                <span className="text-2xl font-semibold" style={{ color: "var(--np-gold)" }}>{v.value}</span>
                <span className="label-category text-center">{v.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Feature grid ──────────────────────────────── */}
        <section className="py-24 max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <p className="label-category mb-3">Platform capabilities</p>
            <h2 className="text-4xl font-semibold tracking-tight">Built for production teams</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <Card key={f.title} className="p-6 flex flex-col gap-4">
                <div
                  className="h-10 w-10 rounded-ui flex items-center justify-center"
                  style={{ background: f.accent === "np-teal" ? "rgba(29,158,117,0.12)" : "rgba(180,140,60,0.12)" }}
                >
                  <f.icon
                    className="h-5 w-5"
                    style={{ color: f.accent === "np-teal" ? "var(--np-teal)" : "var(--np-gold)" }}
                  />
                </div>
                <h3 className="text-[15px] font-semibold leading-snug">{f.title}</h3>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{f.body}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* ── Pricing ───────────────────────────────────── */}
        <section className="py-24" id="pricing" style={{ borderTop: "0.5px solid var(--border)" }}>
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-14">
              <p className="label-category mb-3">Pricing</p>
              <h2 className="text-4xl font-semibold tracking-tight">Straightforward tiers</h2>
            </div>

            <div className="grid md:grid-cols-3 gap-5 items-start">
              {Object.entries(PLAN_LIMITS).map(([key, plan]) => {
                const isPro = key === "PRO";
                return (
                  <Card
                    key={key}
                    className={cn(
                      "p-7 flex flex-col gap-6 relative",
                      isPro && "ring-1 ring-np-gold"
                    )}
                  >
                    {isPro && (
                      <div
                        className="absolute -top-px left-0 right-0 h-0.5 rounded-t-card"
                        style={{ background: "var(--np-gold)" }}
                      />
                    )}
                    <div>
                      <p className="label-category mb-2">{plan.name}</p>
                      <div className="flex items-baseline gap-1 mb-3">
                        <span className="text-4xl font-semibold">{plan.price}</span>
                        <span className="text-[13px] text-muted-foreground">/mo</span>
                      </div>
                      <p className="text-[13px] text-muted-foreground leading-relaxed">{plan.description}</p>
                    </div>

                    <ul className="space-y-2.5">
                      {plan.features.map((f: any, i: number) => (
                        <li
                          key={i}
                          className={cn("flex items-center gap-2.5 text-[13px]", !f.active && "opacity-35")}
                        >
                          <Check
                            className="h-3.5 w-3.5 shrink-0"
                            style={{ color: f.active ? "var(--np-teal)" : "var(--np-slate)" }}
                          />
                          {f.text}
                        </li>
                      ))}
                    </ul>

                    <Link
                      href="/register"
                      className={cn(
                        "mt-auto",
                        isPro ? "np-btn-primary w-full justify-center" : "np-btn-outline w-full justify-center"
                      )}
                    >
                      {key === "BUSINESS" ? "Contact sales" : "Get started"}
                    </Link>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── CTA banner ────────────────────────────────── */}
        <section className="py-24 max-w-5xl mx-auto px-4">
          <Card className="p-12 md:p-20 text-center relative overflow-hidden np-grid-bg">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-np-gold/5 blur-[80px] pointer-events-none" />
            <div className="relative">
              <p className="label-category mb-4">Ready to ship</p>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
                Full-stack monitoring,<br />
                <span style={{ color: "var(--np-gold)" }}>zero config.</span>
              </h2>
              <p className="text-muted-foreground text-[15px] mb-8 max-w-md mx-auto">
                Connect your first asset in under two minutes. No infrastructure changes required.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href="/register" className="np-btn-primary h-12 px-8 text-[14px] gap-2">
                  Start free <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/login" className="np-btn-outline h-12 px-8 text-[14px]">
                  Sign in
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
            <span className="text-[14px] font-medium">NexPulse</span>
          </div>
          <p className="label-category">© 2026 NexPulse. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/docs" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">Docs</Link>
            <Link href="/login" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">Login</Link>
            <Link href="mailto:tabir8431@gmail.com" className="text-muted-foreground hover:text-np-gold transition-colors">
              <Mail className="h-4 w-4" />
            </Link>
            <Link href="https://github.com/inkand-paper/Optimizer" className="text-muted-foreground hover:text-np-gold transition-colors">
              <Github className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

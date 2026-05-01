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
              <Link href="/docs" className="np-btn-outline h-12 px-8 text-[14px]">
                View docs
              </Link>
            </div>
          </div>
        </section>

        {/* ── Value strip ───────────────────────────────── */}
        <div style={{ borderTop: "0.5px solid var(--border)", borderBottom: "0.5px solid var(--border)" }}>
          <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x divide-border">
            {valueProps.map((v) => (
              <div key={v.label} className="flex flex-col items-center gap-1 px-2 md:px-6">
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
              <h2 className="text-4xl font-semibold tracking-tight">Plans for every workflow</h2>
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
                        className="absolute -top-3 left-0 right-0 h-0.5 rounded-t-card"
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
                      {key === "BUSINESS" ? "Get started" : "Get started"}
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
          <p className="label-category text-center">© 2026 NexPulse. All rights reserved.</p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link href="/docs" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">Docs</Link>
            <Link href="/login" className="text-[13px] text-muted-foreground hover:text-foreground transition-colors">Login</Link>
            <a href="mailto:nexpulse.team@gmail.com" className="text-muted-foreground hover:text-np-gold transition-colors">
              <Mail className="h-4 w-4" />
            </a>
            <Link href="https://github.com/inkand-paper/Optimizer" target="_blank" aria-label="GitHub" className="text-muted-foreground hover:text-np-gold transition-colors">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.185 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.013-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.154-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.2 22 16.447 22 12.021 22 6.484 17.523 2 12 2z"/></svg>
            </Link>
            <Link href="https://discord.gg/nexpulse" target="_blank" aria-label="Discord" className="text-muted-foreground hover:text-np-gold transition-colors">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

import * as React from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui-elements";
import { Book, Terminal, Smartphone, Compass, ArrowRight, Activity, Mail, GitBranch } from "lucide-react";

const categories = [
  {
    icon: Compass,
    title: "Getting Started",
    description: "Architecture overview, environment setup, and self-hosting guide.",
    links: [
      { label: "Master Guide",      href: "/docs/master" },
      { label: "Environment Vars",  href: "/docs/master#13-environment-variables" },
      { label: "Cache Setup",       href: "/docs/master#6-cache-revalidation" },
      { label: "Self-Hosting",      href: "https://github.com/inkand-paper/Optimizer#self-hosting" },
    ],
  },
  {
    icon: Terminal,
    title: "API Reference",
    description: "Every endpoint, authentication method, and response schema.",
    links: [
      { label: "All Endpoints",      href: "/docs/api" },
      { label: "Cache Revalidation", href: "/docs/api#post-apirevalidate" },
      { label: "Code Audit (SSE)",   href: "/docs/api#post-apicode-review" },
      { label: "Outbound Webhooks",  href: "/docs/api#outbound-webhook-payload" },
    ],
  },
  {
    icon: Activity,
    title: "Monitoring",
    description: "How uptime checks work, cron architecture, and alert flow.",
    links: [
      { label: "How monitoring works", href: "/docs/master#5-uptime-monitoring" },
      { label: "Cron setup",           href: "/docs/master#12-cron-jobs" },
      { label: "Webhook alerts",       href: "/docs/api#webhooks" },
      { label: "Plan check intervals", href: "/docs/master#4-plan-limits" },
    ],
  },
  {
    icon: GitBranch,
    title: "Billing & Plans",
    description: "Plan limits, student trials, gifted access, and LemonSqueezy integration.",
    links: [
      { label: "Plan comparison",    href: "/docs/master#4-plan-limits" },
      { label: "Student trial",      href: "/docs/master#9-billing-lemonsqueezy" },
      { label: "Gifted trial",       href: "/docs/master#9-billing-lemonsqueezy" },
      { label: "Billing webhooks",   href: "/docs/master#9-billing-lemonsqueezy" },
    ],
  },
  {
    icon: Smartphone,
    title: "Security",
    description: "Auth system, SSRF protection, rate limiting, MFA, and private blob access.",
    links: [
      { label: "Security overview",  href: "/docs/master#11-security-architecture" },
      { label: "Auth dual-layer",    href: "/docs/master#2-architecture" },
      { label: "API key safety",     href: "/docs/api#api-keys" },
      { label: "MFA setup",          href: "/docs/api#post-apiauth2faverify" },
    ],
  },
  {
    icon: Mail,
    title: "Contributing",
    description: "Dev setup, code rules, PR checklist, and AI agent directives.",
    links: [
      { label: "Contributing Guide",  href: "https://github.com/inkand-paper/Optimizer/blob/main/CONTRIBUTING.md" },
      { label: "AI Agent Directives", href: "https://github.com/inkand-paper/Optimizer/blob/main/docs-content/AGENTS.md" },
      { label: "Security Policy",     href: "https://github.com/inkand-paper/Optimizer/blob/main/SECURITY.md" },
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 py-16 md:py-24 w-full">
        {/* Header */}
        <div className="mb-14">
          <p className="label-category mb-3 flex items-center gap-2">
            <Book className="h-3.5 w-3.5 text-np-gold" />
            Documentation
          </p>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight mb-4">
            Documentation
          </h1>
          <p className="text-[16px] text-muted-foreground max-w-xl leading-relaxed">
            From high-level concepts to API protocols, everything you need
            to maintain absolute control over your infrastructure.
          </p>
        </div>

        {/* Category cards */}
        <div className="grid md:grid-cols-3 gap-4 mb-16">
          {categories.map((cat) => (
            <Card key={cat.title} className="p-6 flex flex-col gap-5">
              {/* Icon */}
              <div
                className="h-10 w-10 rounded-ui flex items-center justify-center"
                style={{ background: "rgba(180,140,60,0.10)" }}
              >
                <cat.icon className="h-5 w-5 text-np-gold" />
              </div>

              <div className="flex-1">
                <h2 className="text-[15px] font-semibold mb-1.5">{cat.title}</h2>
                <p className="text-[13px] text-muted-foreground leading-relaxed">{cat.description}</p>
              </div>

              <div className="space-y-1.5">
                {cat.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center justify-between group px-3 py-2.5 rounded-ui transition-colors hover:bg-muted"
                    style={{ border: "0.5px solid var(--border)" }}
                  >
                    <span className="text-[13px] font-medium group-hover:text-np-gold transition-colors">
                      {link.label}
                    </span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-np-gold group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Support CTA */}
        <Card className="p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-np-gold/5 blur-[60px] pointer-events-none" />
          <div className="relative">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-ui mb-5 text-[11px] font-semibold"
              style={{ background: "rgba(180,140,60,0.10)", color: "var(--np-gold)" }}
            >
              <Activity className="h-3.5 w-3.5" /> Support
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
              Stalled on something?
            </h2>
            <p className="text-muted-foreground text-[15px] mb-7 max-w-md mx-auto leading-relaxed">
              Our engineering team is active on Discord and email. Response within 24 hours.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a href="https://mail.google.com/mail/?view=cm&fs=1&to=nexpulse.team@gmail.com" target="_blank" rel="noopener noreferrer" className="np-btn-primary h-10 px-6 text-[13px] gap-2">
                <Mail className="h-4 w-4" /> Email support
              </a>
              <Link href="https://github.com/inkand-paper/Optimizer" className="np-btn-outline h-10 px-6 text-[13px] inline-flex items-center gap-2">
                <GitBranch className="h-4 w-4" /> Open Issue
              </Link>
                <Link href="https://discord.gg/gSw2sHxZtn" target="_blank" className="np-btn-outline h-10 px-6 text-[13px] inline-flex items-center gap-2">
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg> Discord
              </Link>
            </div>
          </div>
        </Card>
      </main>

      <footer
        className="py-8"
        style={{ borderTop: "0.5px solid var(--border)" }}
      >
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="label-category">© 2026 NexPulse Universal Infrastructure</p>
        </div>
      </footer>
    </div>
  );
}

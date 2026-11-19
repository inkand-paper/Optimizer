import * as React from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui-elements";
import { BrandIcon } from "@/components/brand-icon";
import { Book, Terminal, Smartphone, Compass, ArrowRight, Mail, GitBranch, Workflow, ShieldCheck, Radio } from "lucide-react";

const categories = [
  {
    icon: Compass,
    title: "Getting Started & Architecture",
    description: "Architecture overview, environment setup, and deployment guides.",
    links: [
      { label: "Master Guide", href: "/docs/master" },
      { label: "Platform Architecture", href: "/docs/master#2-architecture" },
      { label: "Environment Variables", href: "/docs/master#13-environment-variables" },
      { label: "Cache Setup", href: "/docs/master#6-cache-revalidation" },
      { label: "Deployment Checklist", href: "/docs/deployment" },
    ],
  },
  {
    icon: Workflow,
    title: "Features & Incident Runbooks",
    description: "Breakdown of core capabilities, operational runbooks, and telemetry behaviors.",
    links: [
      { label: "Complete Feature Guide", href: "/docs/features" },
      { label: "Incident Runbook Engine", href: "/docs/features" },
      { label: "Cloud Resource Reclaimer", href: "/docs/features" },
      { label: "MCP Telemetry Bridge", href: "/docs/features" },
      { label: "Pull Request Guard", href: "/docs/features" },
    ],
  },
  {
    icon: Terminal,
    title: "API Reference",
    description: "HTTP endpoints, authentication headers, and response payloads.",
    links: [
      { label: "All Endpoints", href: "/docs/api" },
      { label: "Edge Cache Dispatcher", href: "/docs/api#post-api-revalidate" },
      { label: "Static Code Audit (SSE)", href: "/docs/api#post-api-code-review" },
      { label: "Audit Diff", href: "/docs/api#get-api-code-review-diff-reviewid-xxx" },
      { label: "Status Page Query", href: "/docs/api#get-api-status-slug-xxx" },
      { label: "PR Guard Webhook", href: "/docs/api#post-api-pr-bot" },
    ],
  },
  {
    icon: Book,
    title: "Core Concepts & Mental Models",
    description: "Clear architectural analogies explaining how NexPulse components function.",
    links: [
      { label: "All Concept Guides", href: "/docs/concepts" },
      { label: "Authentication (Theme Park)", href: "/docs/concepts#1-authentication-the-theme-park-analogy" },
      { label: "API Keys (Employee Badge)", href: "/docs/concepts#2-api-keys-the-employee-badge-analogy" },
      { label: "Security & Hashing", href: "/docs/concepts#4-security-and-hashing-the-shredder-analogy" },
      { label: "System Uptime & Heartbeats", href: "/docs/concepts#5-system-uptime-the-heartbeat-analogy" },
    ],
  },
  {
    icon: Radio,
    title: "Monitoring & Probes",
    description: "Uptime checks, cron schedule execution, and incident alerting.",
    links: [
      { label: "How Monitoring Works", href: "/docs/master#5-uptime-monitoring" },
      { label: "Cron Schedule Execution", href: "/docs/master#12-cron-jobs" },
      { label: "Outbound Webhooks", href: "/docs/api#webhooks" },
      { label: "Check Intervals by Plan", href: "/docs/master#4-plan-limits" },
    ],
  },
  {
    icon: Smartphone,
    title: "Mobile & Client SDK",
    description: "Integrating NexPulse telemetry with Android applications and mobile clients.",
    links: [
      { label: "Android Integration Guide", href: "/docs/android" },
      { label: "API Key Provisioning", href: "/docs/android#1-api-key-provisioning" },
      { label: "Kotlin Implementation", href: "/docs/android#2-kotlin-implementation" },
      { label: "Mobile Best Practices", href: "/docs/android#3-best-practices" },
    ],
  },
  {
    icon: ShieldCheck,
    title: "Security & Access",
    description: "Authentication layers, SSRF protection, rate limiting, and MFA.",
    links: [
      { label: "Security Architecture", href: "/docs/master#11-security-architecture" },
      { label: "Dual-Layer Auth Model", href: "/docs/master#2-architecture" },
      { label: "API Key Scopes", href: "/docs/api#api-keys" },
      { label: "Two-Factor Auth (MFA)", href: "/docs/api#post-api-auth-2fa-verify" },
    ],
  },
  {
    icon: GitBranch,
    title: "Billing & Plans",
    description: "Plan tiers, check frequencies, student verification, and billing webhooks.",
    links: [
      { label: "Plan Tier Comparison", href: "/docs/master#4-plan-limits" },
      { label: "Billing & LemonSqueezy", href: "/docs/master#9-billing-lemonsqueezy" },
      { label: "Promotions System", href: "/docs/master#10-promotions-system" },
      { label: "Response Codes Reference", href: "/docs/api#response-codes" },
    ],
  },
  {
    icon: Mail,
    title: "Contributing & Guidelines",
    description: "Development setup, code review checklists, and AI coding directives.",
    links: [
      { label: "Contributing Guide", href: "https://github.com/inkand-paper/Optimizer/blob/main/CONTRIBUTING.md" },
      { label: "AI Directives (AGENTS.md)", href: "/docs/agents" },
      { label: "Security Policy", href: "https://github.com/inkand-paper/Optimizer/blob/main/SECURITY.md" },
    ],
  },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-16 md:py-20 w-full">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground mb-3">
            <Book className="h-3.5 w-3.5 text-foreground" />
            Documentation & guides
          </div>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">
            NexPulse documentation
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-xl leading-relaxed">
            Architecture guides, endpoint specifications, and integration references for full-stack monitoring and optimization.
          </p>
        </div>

        {/* Category cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {categories.map((cat) => (
            <Card key={cat.title} className="p-6 flex flex-col gap-4 bg-card border border-border/50">
              {/* Icon */}
              <div className="h-9 w-9 rounded-ui bg-muted flex items-center justify-center text-foreground">
                <cat.icon className="h-4 w-4" />
              </div>

              <div>
                <h2 className="text-sm font-semibold mb-1 text-foreground">{cat.title}</h2>
                <p className="text-xs text-muted-foreground leading-relaxed">{cat.description}</p>
              </div>

              <div className="space-y-1 mt-auto pt-2 border-t border-border/40">
                {cat.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center justify-between group px-2.5 py-1.5 rounded-ui transition-colors hover:bg-muted text-xs text-muted-foreground hover:text-foreground"
                  >
                    <span className="font-medium truncate pr-2">
                      {link.label}
                    </span>
                    <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
                  </Link>
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* Support CTA */}
        <Card className="p-8 md:p-12 text-center bg-card border border-border/50">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-muted text-foreground text-xs font-medium mb-4 border border-border">
            <BrandIcon className="h-3 w-3" />
            <span>Community & support</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">
            Need help or have questions?
          </h2>
          <p className="text-xs md:text-sm text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
            Our team responds directly on GitHub issues, email, and Discord.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=nexpulse.team@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="np-btn-primary h-9 px-5 text-xs gap-2"
            >
              <Mail className="h-3.5 w-3.5" /> Email support
            </a>
            <Link
              href="https://github.com/inkand-paper/Optimizer"
              className="np-btn-outline h-9 px-5 text-xs inline-flex items-center gap-2"
            >
              <GitBranch className="h-3.5 w-3.5" /> Open issue
            </Link>
            <Link
              href="https://discord.gg/gSw2sHxZtn"
              target="_blank"
              className="np-btn-outline h-9 px-5 text-xs inline-flex items-center gap-2"
            >
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
              </svg>
              Discord
            </Link>
          </div>
        </Card>
      </main>

      <footer className="py-8 border-t border-border">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-xs text-muted-foreground">© 2026 NexPulse. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

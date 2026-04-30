import * as React from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui-elements";
import { Book, Terminal, Smartphone, Compass, ArrowRight, Activity, Mail } from "lucide-react";

const categories = [
  {
    icon: Compass,
    title: "Getting Started",
    description: "Core concepts and quick-start guides to get NexPulse running in minutes.",
    links: [
      { label: "Core Concepts", href: "/docs/concepts" },
      { label: "Master Guide",  href: "/docs/master"   },
    ],
  },
  {
    icon: Terminal,
    title: "Technical Reference",
    description: "API endpoints, integration snippets, and webhook event schemas.",
    links: [
      { label: "Implementation",  href: "/docs/master#web-implementation-javascript-node-js" },
      { label: "API Reference",   href: "/docs/api"                                          },
      { label: "Webhook Events",  href: "/docs/master#webhooks"                              },
    ],
  },
  {
    icon: Smartphone,
    title: "Mobile & SDKs",
    description: "Connect Android and iOS apps to the NexPulse pulse engine.",
    links: [
      { label: "iOS (Swift)",    href: "/docs/master#ios-implementation-swift"          },
      { label: "Android (Kotlin)", href: "/docs/master#android-implementation-kotlin"  },
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
            Knowledge base · v2.0
          </p>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight mb-4">
            Documentation
          </h1>
          <p className="text-[16px] text-muted-foreground max-w-xl leading-relaxed">
            From high-level concepts to machine-level API protocols — everything required
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
              <Link href="mailto:nexpulse.team@gmail.com" className="np-btn-primary h-10 px-6 text-[13px] gap-2">
                <Mail className="h-4 w-4" /> Email support
              </Link>
              <Link href="https://discord.gg/R35wamng" className="np-btn-outline h-10 px-6 text-[13px]">
                Join Discord
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

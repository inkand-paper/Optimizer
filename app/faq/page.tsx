"use client";

import * as React from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui-elements";
import { HelpCircle, ChevronDown, MessageSquare, ArrowRight, Zap, Shield, Activity, Key } from "lucide-react";

const faqCategories = [
  {
    icon: Zap,
    label: "Core Concepts",
    color: "np-gold",
    faqs: [
      {
        q: "What exactly is NexPulse?",
        a: "NexPulse is an integrated Optimization & Monitoring suite. It gives engineering teams a central command center to monitor website uptime, trigger cache revalidation (Optimization Pulses), run deep SEO/Performance audits, and receive real-time alerts — all from one dashboard.",
      },
      {
        q: "What is an \"Optimization Pulse\"?",
        a: "An Optimization Pulse is an on-demand cache revalidation signal. When you install the NexPulse snippet into your website and trigger a Pulse (by tag or path), NexPulse sends a secure signal that clears the specific cached data on your system — instantly serving fresh content to your users without a full redeploy.",
      },
      {
        q: "Do I need to install anything in my website to use NexPulse?",
        a: "It depends on the feature:\n\n• Monitoring (UP/DOWN checks): No installation needed — NexPulse monitors any public URL.\n\n• Audits & Revalidation Pulses: Yes. You must install the NexPulse integration snippet (JavaScript, Swift, Kotlin, etc.) into your target system. Once installed, you use your Machine API Key to trigger audits or revalidation pulses against that specific system.",
      },
      {
        q: "Which frameworks does NexPulse support?",
        a: "NexPulse works with any framework. Official integration snippets are provided for JavaScript/Node.js, Next.js, Python, Go, Ruby, Swift (iOS), and Kotlin (Android). The REST API is framework-agnostic, so any system that can make an HTTP request can integrate.",
      },
    ],
  },
  {
    icon: Key,
    label: "API Keys & Integration",
    color: "np-teal",
    faqs: [
      {
        q: "What is a Machine API Key?",
        a: "A Machine API Key (prefixed opt_...) is a high-entropy credential generated in your NexPulse dashboard. Unlike your personal login (which is for humans), Machine Keys are designed for server-to-server and app-to-server authentication. You embed them in your target system to allow NexPulse to securely trigger pulses and audits.",
      },
      {
        q: "Is my raw API key stored anywhere?",
        a: "No. NexPulse uses a zero-knowledge security model. When you generate a key, we immediately run it through a SHA-256 cryptographic hash and store only the hash. Your raw key is shown to you once and never stored. If you lose it, you must revoke it and generate a new one.",
      },
      {
        q: "What should I do if an API key is compromised?",
        a: "Go to Dashboard → API Keys and click Revoke next to the compromised key immediately. The key will be invalidated within seconds. Then generate a new key and update the integration in your target system.",
      },
      {
        q: "Can I have multiple API keys?",
        a: "Yes. You can generate multiple keys — for example, one per application or environment (staging, production). This way you can revoke access to one system without affecting others.",
      },
    ],
  },
  {
    icon: Activity,
    label: "Monitoring & Alerts",
    color: "np-gold",
    faqs: [
      {
        q: "How often does NexPulse check my monitors?",
        a: "NexPulse runs health checks approximately every 60 seconds per monitor. When a status change is detected (UP → DOWN or DOWN → UP), alerts are dispatched instantly to your configured channels (Email, Discord, Slack).",
      },
      {
        q: "How do I receive alerts on Discord?",
        a: "Go to Dashboard → Monitors → select a monitor → Notifications. Add your Discord Webhook URL. NexPulse will send a formatted embed message to your Discord channel whenever the monitor changes status. You can add multiple webhooks (Discord, Slack, custom endpoints) per monitor.",
      },
      {
        q: "Can I monitor sites I don't own?",
        a: "Yes — for basic UP/DOWN monitoring, you can track any public URL (competitors, third-party APIs, CDNs, etc.). However, Optimization Pulses and deep Audits are exclusively for systems where you have installed the NexPulse integration.",
      },
    ],
  },
  {
    icon: Shield,
    label: "Account & Security",
    color: "np-teal",
    faqs: [
      {
        q: "How do I reset my password?",
        a: "On the Login page, click \"Forgot password?\". Enter your account email and we'll send a secure reset link (valid for 1 hour). Click the link in the email and set your new password. If you don't receive the email, check your spam folder or contact support.",
      },
      {
        q: "What is email verification and why do I need it?",
        a: "When you register, NexPulse sends a verification email to confirm you own the address. Until verified, some features may be restricted. Click the link in the email (or request a new one from the dashboard banner) to fully activate your account.",
      },
      {
        q: "What plans are available?",
        a: "NexPulse offers Free, Pro, and Business tiers. Higher plans unlock more monitors, longer log history, AI-powered diagnostics via Pulse-AI, and priority support. Visit the Pricing section on the homepage or your Profile page to view current plan limits and upgrade options.",
      },
      {
        q: "Is my data secure?",
        a: "Yes. NexPulse uses industry-standard security practices: HTTPS everywhere, SHA-256 key hashing, JWT-based sessions, HMAC webhook signature verification, and SSRF protection on all monitoring probes. Raw secrets are never stored.",
      },
    ],
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div
      style={{ borderBottom: "0.5px solid var(--border)" }}
      className="last:border-b-0"
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-start justify-between gap-4 py-5 text-left group"
        aria-expanded={open}
      >
        <span className="text-[14px] font-medium leading-snug group-hover:text-np-gold transition-colors">
          {q}
        </span>
        <ChevronDown
          className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5 transition-transform duration-300"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: open ? "500px" : "0px", opacity: open ? 1 : 0 }}
      >
        <div className="pb-5 pr-8">
          {a.split("\n\n").map((para, i) => (
            <p key={i} className="text-[13px] text-muted-foreground leading-relaxed mb-2 last:mb-0 whitespace-pre-line">
              {para}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function FaqPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 py-16 md:py-24 w-full">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="label-category mb-4 inline-flex items-center gap-2">
            <HelpCircle className="h-3.5 w-3.5 text-np-gold" />
            Frequently Asked Questions
          </p>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-tight mb-4">
            Got questions?
            <br />
            <span style={{ color: "var(--np-gold)" }}>We have answers.</span>
          </h1>
          <p className="text-[16px] text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Everything you need to know about NexPulse — from integration to security.
            Can't find what you're looking for? Ask{" "}
            <span className="font-semibold text-foreground">Pulse-AI</span> in the dashboard.
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-6">
          {faqCategories.map((cat) => (
            <Card key={cat.label} className="overflow-hidden">
              {/* Category Header */}
              <div
                className="flex items-center gap-3 px-6 py-4"
                style={{ borderBottom: "0.5px solid var(--border)", background: "rgba(180,140,60,0.03)" }}
              >
                <div
                  className="h-8 w-8 rounded-ui flex items-center justify-center shrink-0"
                  style={{
                    background: cat.color === "np-gold"
                      ? "rgba(180,140,60,0.12)"
                      : "rgba(29,158,117,0.12)",
                  }}
                >
                  <cat.icon
                    className="h-4 w-4"
                    style={{ color: cat.color === "np-gold" ? "var(--np-gold)" : "var(--np-teal)" }}
                  />
                </div>
                <h2 className="text-[13px] font-semibold uppercase tracking-widest text-muted-foreground">
                  {cat.label}
                </h2>
              </div>

              {/* FAQ Items */}
              <div className="px-6">
                {cat.faqs.map((faq) => (
                  <FaqItem key={faq.q} q={faq.q} a={faq.a} />
                ))}
              </div>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <Card className="mt-12 p-10 md:p-14 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-40 bg-np-gold/5 blur-[60px] pointer-events-none" />
          <div className="relative">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-ui mb-5 text-[11px] font-semibold"
              style={{ background: "rgba(180,140,60,0.10)", color: "var(--np-gold)" }}
            >
              <MessageSquare className="h-3.5 w-3.5" /> Still have questions?
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-3">
              Ask Pulse-AI
            </h2>
            <p className="text-muted-foreground text-[15px] mb-7 max-w-md mx-auto leading-relaxed">
              Our AI assistant is trained on the entire NexPulse knowledge base and is available 24/7 inside your dashboard.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/dashboard" className="np-btn-primary h-10 px-6 text-[13px] gap-2 inline-flex items-center">
                Open Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/docs" className="np-btn-outline h-10 px-6 text-[13px] inline-flex items-center gap-2">
                Read the Docs
              </Link>
            </div>
          </div>
        </Card>
      </main>

      <footer className="py-8" style={{ borderTop: "0.5px solid var(--border)" }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="label-category">© 2026 NexPulse Universal Infrastructure</p>
        </div>
      </footer>
    </div>
  );
}

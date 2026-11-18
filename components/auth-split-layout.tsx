"use client";

import * as React from "react";
import Link from "next/link";
import { BrandIcon } from "./brand-icon";

export function AuthSplitLayout({
  children,
  headline = "Continuous endpoint observability and code intelligence.",
}: {
  children: React.ReactNode;
  headline?: string;
}) {
  return (
    <div className="min-h-screen w-full flex bg-background text-foreground">
      {/* ─── LEFT PANEL: Engineered Product Showcase (Desktop) ─── */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#09090B] text-zinc-100 flex-col justify-between p-12 xl:p-16 border-r border-border/40 relative overflow-hidden select-none">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 np-grid-bg opacity-30 pointer-events-none" />

        {/* Top: Brand Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-ui border border-white/10 bg-white/5 flex items-center justify-center text-white transition-colors group-hover:border-white/20 shadow-sm">
              <BrandIcon className="h-4 w-4" />
            </div>
            <span className="font-semibold tracking-tight text-[15px] text-white">NexPulse</span>
          </Link>
          <div className="text-xs font-mono text-zinc-500">
            v0.1.0
          </div>
        </div>

        {/* Middle: Honest Value Prop */}
        <div className="relative z-10 space-y-8 my-auto py-8 max-w-md">
          <div className="space-y-3">
            <h2 className="text-2xl xl:text-3xl font-semibold tracking-tight text-white leading-snug">
              {headline}
            </h2>
            <p className="text-[13px] text-zinc-400 leading-relaxed">
              Synthetics, cache health, and automated code review in a single unified workspace. Built for engineers who need fast, honest feedback on their services.
            </p>
          </div>

          {/* Honest capabilities list */}
          <div className="space-y-3 pt-2">
            <div className="p-3.5 rounded-lg border border-white/10 bg-white/[0.02] space-y-1">
              <p className="text-xs font-medium text-white">Synthetic Uptime & Latency</p>
              <p className="text-[11px] text-zinc-400">Regular automated HTTP/HTTPS health checks with historical sparklines and instant alerts.</p>
            </div>
            <div className="p-3.5 rounded-lg border border-white/10 bg-white/[0.02] space-y-1">
              <p className="text-xs font-medium text-white">Automated Code Audit</p>
              <p className="text-[11px] text-zinc-400">Scan repository pull requests, ZIP bundles, or pasted snippets for security and performance regressions.</p>
            </div>
            <div className="p-3.5 rounded-lg border border-white/10 bg-white/[0.02] space-y-1">
              <p className="text-xs font-medium text-white">Webhooks & Scoped API Access</p>
              <p className="text-[11px] text-zinc-400">Event-driven notifications with HMAC SHA-256 signatures and programmatic key controls.</p>
            </div>
          </div>
        </div>

        {/* Bottom: Honest Metadata */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span>Self-hosted &amp; Cloud Deployable</span>
          <span>Open Source Core</span>
        </div>
      </div>

      {/* ─── RIGHT PANEL: Authentication Form (Desktop & Mobile) ─── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-16 min-h-screen">
        {/* Mobile top header */}
        <div className="flex lg:hidden items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-ui border border-border bg-muted/60 flex items-center justify-center text-foreground shadow-sm">
              <BrandIcon className="h-3.5 w-3.5" />
            </div>
            <span className="font-semibold tracking-tight text-sm">NexPulse</span>
          </Link>
          <span className="text-xs font-mono text-muted-foreground">v0.1.0</span>
        </div>

        {/* Centered Form Area */}
        <div className="my-auto w-full max-w-[380px] mx-auto">
          {children}
        </div>

        {/* Bottom Security / Terms footer */}
        <div className="pt-8 text-center text-[12px] text-muted-foreground">
          Encrypted sessions &middot; Two-factor authentication supported
        </div>
      </div>
    </div>
  );
}

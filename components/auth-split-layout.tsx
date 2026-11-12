"use client";

import * as React from "react";
import Link from "next/link";
import { Activity, ShieldCheck, Terminal, Cpu } from "lucide-react";

export function AuthSplitLayout({
  children,
  headline = "Real-time edge observability and neural code intelligence.",
}: {
  children: React.ReactNode;
  headline?: string;
}) {
  return (
    <div className="min-h-screen w-full flex bg-background text-foreground">
      {/* ─── LEFT PANEL: Engineered Console Showcase (Desktop) ─── */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#09090B] text-zinc-100 flex-col justify-between p-12 xl:p-16 border-r border-border relative overflow-hidden select-none">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 np-grid-bg opacity-40 pointer-events-none" />

        {/* Top: Brand Header */}
        <div className="relative z-10 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded border border-white/10 bg-white/5 flex items-center justify-center text-white transition-colors group-hover:border-white/20">
              <Activity className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-tight text-[15px] text-white">NexPulse</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-zinc-400 border border-white/5">
                v2.4
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>All Systems Normal</span>
          </div>
        </div>

        {/* Middle: Value Prop & Live Terminal Telemetry */}
        <div className="relative z-10 space-y-8 my-auto py-8">
          <div className="space-y-3 max-w-lg">
            <h2 className="text-2xl xl:text-3xl font-semibold tracking-tight text-white leading-snug">
              {headline}
            </h2>
            <p className="text-[13px] text-zinc-400 leading-relaxed">
              Purpose-built for engineering teams needing continuous endpoint observability, automated pull request analysis, and autonomous incident prevention.
            </p>
          </div>

          {/* Interactive Live-Styled Terminal Stream */}
          <div className="rounded-lg border border-white/10 bg-black/60 p-4 font-mono text-xs space-y-2.5 shadow-2xl backdrop-blur-sm max-w-lg">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 text-[11px] text-zinc-400">
              <div className="flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-zinc-400" />
                <span>probe-telemetry.log</span>
              </div>
              <span className="text-emerald-400 font-mono">STREAMING LIVE</span>
            </div>

            <div className="space-y-1.5 pt-1 text-[11px]">
              <div className="text-zinc-400">
                <span className="text-zinc-400">$</span> nexpulse check --target api.production.io
              </div>
              <div className="flex items-center justify-between text-zinc-300">
                <span>● US-East (IAD)</span>
                <span className="text-emerald-400">200 OK · 18ms</span>
              </div>
              <div className="flex items-center justify-between text-zinc-300">
                <span>● EU-Central (FRA)</span>
                <span className="text-emerald-400">200 OK · 24ms</span>
              </div>
              <div className="flex items-center justify-between text-zinc-300">
                <span>● AP-South (SIN)</span>
                <span className="text-emerald-400">200 OK · 46ms</span>
              </div>
              <div className="pt-1 border-t border-white/5 text-[10px] text-zinc-400 flex items-center justify-between">
                <span>TLS 1.3 · Zero Packet Loss</span>
                <span className="text-zinc-400 font-mono">99.99% (30d)</span>
              </div>
            </div>
          </div>

          {/* Feature Badges */}
          <div className="grid grid-cols-2 gap-3 max-w-lg pt-2">
            <div className="p-3 rounded-md border border-white/10 bg-white/[0.02] flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 text-zinc-300 shrink-0" />
              <div className="text-xs">
                <p className="font-medium text-white">SOC-2 Ready</p>
                <p className="text-[11px] text-zinc-400">Scoped session tokens</p>
              </div>
            </div>
            <div className="p-3 rounded-md border border-white/10 bg-white/[0.02] flex items-center gap-2.5">
              <Cpu className="h-4 w-4 text-zinc-300 shrink-0" />
              <div className="text-xs">
                <p className="font-medium text-white">Neural Guard</p>
                <p className="text-[11px] text-zinc-400">Automated PR checks</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Console Metrics & Privacy Guarantee */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
          <span>Cluster: Edge-Global</span>
          <span>Zero Third-Party Telemetry</span>
        </div>
      </div>

      {/* ─── RIGHT PANEL: Authentication Form (Desktop & Mobile) ─── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between p-6 sm:p-10 lg:p-16 min-h-screen">
        {/* Mobile top header */}
        <div className="flex lg:hidden items-center justify-between mb-8">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded border border-border bg-muted flex items-center justify-center text-foreground">
              <Activity className="h-3.5 w-3.5" />
            </div>
            <span className="font-semibold tracking-tight text-sm">NexPulse</span>
          </Link>
          <div className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Online</span>
          </div>
        </div>

        {/* Centered Form Area */}
        <div className="my-auto w-full max-w-[380px] mx-auto">
          {children}
        </div>

        {/* Bottom Security / Terms footer */}
        <div className="pt-8 text-center text-[12px] text-muted-foreground">
          Protected by automated brute-force rate limiting and session encryption.
        </div>
      </div>
    </div>
  );
}

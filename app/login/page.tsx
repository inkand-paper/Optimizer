"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Card, Button, Input, PasswordInput } from "@/components/ui-elements";
import { Activity, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const isVerified = params.get("verified") === "true";
  const [loading, setLoading] = React.useState(false);
  const [error, setError]     = React.useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fd.get("email"), password: fd.get("password") }),
      });
      const d = await r.json();
      if (r.ok) { localStorage.setItem("user", JSON.stringify(d.user)); router.push("/dashboard"); }
      else setError(d.message || "Invalid credentials");
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Subtle warm glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-np-gold/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="h-11 w-11 rounded-card flex items-center justify-center mb-4"
            style={{ background: "rgba(180,140,60,0.12)", border: "0.5px solid var(--np-gold)" }}
          >
            <Activity className="h-5 w-5 text-np-gold" />
          </div>
          <h1 className="text-[22px] font-semibold tracking-tight">Sign in to NexPulse</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Infrastructure command centre</p>
        </div>

        <Card className="p-6">
          {isVerified && (
            <div
              className="flex items-center gap-2.5 p-3 rounded-ui mb-4 text-[13px]"
              style={{ background: "rgba(29,158,117,0.08)", border: "0.5px solid var(--np-teal)", color: "var(--np-teal)" }}
            >
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Account activated — you can now sign in.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="label-category" htmlFor="email">Email</label>
              <Input id="email" name="email" type="email" placeholder="you@company.com" required autoFocus />
            </div>
            <div className="space-y-1.5">
              <label className="label-category" htmlFor="password">Password</label>
              <PasswordInput id="password" name="password" required />
            </div>

            {error && (
              <div
                className="flex items-center gap-2.5 p-3 rounded-ui text-[13px]"
                style={{ background: "rgba(163,45,45,0.08)", border: "0.5px solid var(--np-crimson)", color: "var(--np-crimson)" }}
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign in"}
            </Button>
          </form>
        </Card>

        <p className="text-center text-[13px] text-muted-foreground mt-5">
          New to NexPulse?{" "}
          <Link href="/register" className="font-medium" style={{ color: "var(--np-gold)" }}>
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-np-gold" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, Button, Input, PasswordInput } from "@/components/ui-elements";
import { Activity, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError]     = React.useState("");
  const [sent, setSent]       = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const r = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:     fd.get("name"),
          email:    fd.get("email"),
          password: fd.get("password"),
        }),
      });
      const d = await r.json();
      if (r.ok) setSent(true);
      else setError(d.message || "Registration failed");
    } catch { setError("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
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
          <h1 className="text-[22px] font-semibold tracking-tight">Create your account</h1>
          <p className="text-[13px] text-muted-foreground mt-1">Start monitoring in minutes</p>
        </div>

        {sent ? (
          <Card className="p-8 text-center">
            <CheckCircle2 className="h-10 w-10 text-np-teal mx-auto mb-4" />
            <h2 className="text-[16px] font-semibold mb-2">Check your inbox</h2>
            <p className="text-[13px] text-muted-foreground mb-6">
              We sent a verification link to your email. Click it to activate your account.
            </p>
            <Link href="/login" className="np-btn-primary w-full justify-center">
              Go to sign in
            </Link>
          </Card>
        ) : (
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="label-category" htmlFor="name">Full name</label>
                <Input id="name" name="name" type="text" placeholder="Jane Smith" required autoFocus />
              </div>
              <div className="space-y-1.5">
                <label className="label-category" htmlFor="email">Email</label>
                <Input id="email" name="email" type="email" placeholder="you@company.com" required />
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
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
              </Button>
            </form>
          </Card>
        )}

        <p className="text-center text-[13px] text-muted-foreground mt-5">
          Already have an account?{" "}
          <Link href="/login" className="font-medium" style={{ color: "var(--np-gold)" }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

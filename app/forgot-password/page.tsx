"use client";

import * as React from "react";
import Link from "next/link";
import { Card, Button, Input } from "@/components/ui-elements";
import { Activity, Loader2, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fd.get("email") }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to send reset link.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Warm glow */}
      <div
        className="fixed top-0 left-0 right-0 bottom-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 600px 400px at 50% 30%, rgba(180,140,60,0.04), transparent)",
        }}
      />

      <div className="relative w-full max-w-sm z-10">
        <div className="flex flex-col items-center mb-8">
          <div
            className="h-12 w-12 rounded-card flex items-center justify-center mb-4 border border-np-gold/20 bg-np-gold/10"
          >
            <Activity className="h-5 w-5 text-np-gold" />
          </div>
          <h1 className="text-[22px] font-semibold tracking-tight text-foreground">
            Reset Password
          </h1>
          <p className="text-[13px] mt-1 text-np-slate">
            We'll send a recovery link to your inbox
          </p>
        </div>

        <Card className="p-6">
          {success ? (
            <div className="text-center space-y-4 py-4">
              <div className="h-12 w-12 rounded-full bg-np-teal/10 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-6 w-6 text-np-teal" />
              </div>
              <div className="space-y-1">
                <p className="text-[14px] font-bold uppercase tracking-tight">Check your email</p>
                <p className="text-[13px] text-muted-foreground">
                  If an account exists, you'll receive a link to reset your password shortly.
                </p>
              </div>
              <Button variant="outline" className="w-full mt-4 h-10 text-[11px] uppercase tracking-widest" onClick={() => window.location.href = "/login"}>
                Back to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label htmlFor="email" className="label-category block">Email Address</label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  required
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-[12px] text-np-crimson font-medium bg-np-crimson/5 p-3 rounded-ui border border-np-crimson/20">
                  {error}
                </p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Reset Link"}
              </Button>

              <Button asChild variant="ghost" className="w-full text-[11px] uppercase tracking-widest hover:bg-transparent">
                <Link href="/login" className="flex items-center gap-2">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to Sign In
                </Link>
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}

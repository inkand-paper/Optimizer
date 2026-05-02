"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, Button, PasswordInput } from "@/components/ui-elements";
import { Activity, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) {
      setError("Invalid or missing reset token.");
      return;
    }

    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const password = fd.get("password");
    const confirm = fd.get("confirmPassword");

    if (password !== confirm) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 3000);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to reset password.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <AlertCircle className="h-10 w-10 text-np-crimson mx-auto" />
        <p className="text-[14px] font-bold">Invalid Reset Link</p>
        <p className="text-[13px] text-muted-foreground">This link is invalid or has expired.</p>
        <Button className="w-full h-10 text-[11px] uppercase tracking-widest" onClick={() => router.push("/forgot-password")}>
          Request New Link
        </Button>
      </div>
    );
  }

  return (
    <Card className="p-6">
      {success ? (
        <div className="text-center space-y-4 py-4">
          <div className="h-12 w-12 rounded-full bg-np-teal/10 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-6 w-6 text-np-teal" />
          </div>
          <div className="space-y-1">
            <p className="text-[14px] font-bold uppercase tracking-tight">Password Reset!</p>
            <p className="text-[13px] text-muted-foreground">
              Your password has been updated. Redirecting you to sign in...
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="label-category block">New Password</label>
            <PasswordInput
              name="password"
              placeholder="••••••••"
              required
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="label-category block">Confirm New Password</label>
            <PasswordInput
              name="confirmPassword"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-[12px] text-np-crimson font-medium bg-np-crimson/5 p-3 rounded-ui border border-np-crimson/20">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
          </Button>
        </form>
      )}
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <div
        className="fixed top-0 left-0 right-0 bottom-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 600px 400px at 50% 30%, rgba(180,140,60,0.04), transparent)",
        }}
      />

      <div className="relative w-full max-w-sm z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-card flex items-center justify-center mb-4 border border-np-gold/20 bg-np-gold/10">
            <Activity className="h-5 w-5 text-np-gold" />
          </div>
          <h1 className="text-[22px] font-semibold tracking-tight text-foreground">
            Set New Password
          </h1>
          <p className="text-[13px] mt-1 text-np-slate">
            Secure your NexPulse account
          </p>
        </div>

        <Suspense fallback={
          <Card className="p-12 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-np-gold" />
          </Card>
        }>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}

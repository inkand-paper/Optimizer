"use client";

import * as React from "react";
import Link from "next/link";
import { Button, Input } from "@/components/ui-elements";
import { AuthSplitLayout } from "@/components/auth-split-layout";
import { Loader2, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError]     = React.useState("");

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
        setError(data.message || "Failed to process request. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthSplitLayout headline="Secure credential recovery with cryptographic tokens.">
      <div className="space-y-6">
        <div className="space-y-1.5">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-2"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to sign in</span>
          </Link>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Reset Password
          </h1>
          <p className="text-[13px] text-muted-foreground">
            Enter your account email to receive a single-use recovery link.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-md text-[13px] bg-rose-500/10 border border-rose-500/20 text-rose-500">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="rounded-lg border border-border p-6 text-center space-y-4 bg-card">
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-[15px] font-semibold text-foreground">Recovery email dispatched</h2>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                If an account exists with that address, we have sent instructions to reset your password. Links expire in 1 hour.
              </p>
            </div>
            <Link href="/login" className="inline-flex w-full">
              <Button variant="outline" className="w-full">
                Return to Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground" htmlFor="email">
                Account Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@company.com"
                required
                autoFocus
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Password Recovery Link"}
            </Button>
          </form>
        )}
      </div>
    </AuthSplitLayout>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, PasswordInput } from "@/components/ui-elements";
import { AuthSplitLayout } from "@/components/auth-split-layout";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError]     = React.useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!token) {
      setError("Invalid or missing reset token. Please request a new link.");
      return;
    }

    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);
    const password = fd.get("password");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to reset password. The link may have expired.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthSplitLayout headline="Zero-trust credential updates with session invalidation.">
      <div className="space-y-6">
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Set New Password
          </h1>
          <p className="text-[13px] text-muted-foreground">
            Choose a strong password with at least 12 characters to secure your account.
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
              <h2 className="text-[15px] font-semibold text-foreground">Password updated</h2>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                Your credentials have been securely updated. Redirecting to sign in...
              </p>
            </div>
            <Link href="/login" className="inline-flex w-full">
              <Button variant="primary" className="w-full">
                Sign in now
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground" htmlFor="password">
                New Password (min. 12 characters)
              </label>
              <PasswordInput
                id="password"
                name="password"
                required
                minLength={12}
                autoFocus
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Update Password"}
            </Button>
          </form>
        )}
      </div>
    </AuthSplitLayout>
  );
}

export default function ResetPasswordPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>}>
      <ResetPasswordForm />
    </React.Suspense>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { Button, Input, PasswordInput } from "@/components/ui-elements";
import { AuthSplitLayout } from "@/components/auth-split-layout";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { signIn } from "next-auth/react";

export default function RegisterPage() {
  const [loading, setLoading] = React.useState(false);
  const [error, setError]     = React.useState("");
  const [sent, setSent]       = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
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
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthSplitLayout headline="High-density monitoring and autonomous pull-request guard.">
      <div className="space-y-6">
        <div className="space-y-1.5">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Create an account
          </h1>
          <p className="text-[13px] text-muted-foreground">
            Start global uptime checks and automated code reviews in minutes.
          </p>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 rounded-md text-[13px] bg-rose-500/10 border border-rose-500/20 text-rose-500">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {sent ? (
          <div className="rounded-lg border border-border p-6 text-center space-y-4 bg-card">
            <div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-[15px] font-semibold text-foreground">Check your inbox</h2>
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                We sent an activation link to your email address. Verify your account to proceed to console.
              </p>
            </div>
            <Link href="/login" className="inline-flex w-full">
              <Button variant="primary" className="w-full">
                Return to Sign In
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-2.5">
              <Button
                variant="outline"
                className="w-full text-xs font-medium"
                onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
              >
                <svg className="h-3.5 w-3.5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>
                </svg>
                GitHub
              </Button>
              <Button
                variant="outline"
                className="w-full text-xs font-medium"
                onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
              >
                <svg className="h-3.5 w-3.5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 border-t border-border" />
              <span className="relative bg-background px-3 text-[11px] uppercase tracking-wider text-muted-foreground font-mono">
                or email
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground" htmlFor="name">
                  Full Name
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Alex Rivera"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground" htmlFor="email">
                  Work Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@company.com"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground" htmlFor="password">
                  Password (min. 12 characters)
                </label>
                <PasswordInput
                  id="password"
                  name="password"
                  required
                  minLength={12}
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Developer Account"}
              </Button>
            </form>
          </div>
        )}

        <p className="text-center text-[13px] text-muted-foreground pt-2">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-foreground hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </AuthSplitLayout>
  );
}

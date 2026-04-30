"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, Button, Input, PasswordInput } from "@/components/ui-elements";
import { Activity, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError]     = React.useState("");

  // Read ?verified param client-side to avoid Suspense boundary issues
  const [isVerified, setIsVerified] = React.useState(false);
  React.useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setIsVerified(p.get("verified") === "true");
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const fd = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email:    fd.get("email"),
          password: fd.get("password"),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/dashboard");
      } else {
        setError(data.message || "Invalid credentials. Please try again.");
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
        {/* Logo mark */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="h-12 w-12 rounded-card flex items-center justify-center mb-4"
            style={{
              background: "rgba(180,140,60,0.10)",
              border: "0.5px solid rgba(180,140,60,0.4)",
            }}
          >
            <Activity className="h-5 w-5" style={{ color: "var(--np-gold)" }} />
          </div>
          <h1 className="text-[22px] font-semibold tracking-tight text-foreground">
            Sign in to NexPulse
          </h1>
          <p className="text-[13px] mt-1" style={{ color: "var(--np-slate)" }}>
            Infrastructure command centre
          </p>
        </div>

        <Card className="p-6">
          {/* Verified banner */}
          {isVerified && (
            <div
              className="flex items-center gap-2.5 p-3 rounded-ui mb-5 text-[13px]"
              style={{
                background: "rgba(29,158,117,0.08)",
                border: "0.5px solid var(--np-teal)",
                color: "var(--np-teal)",
              }}
            >
              ✓ Account activated — you can now sign in.
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="label-category"
                style={{ display: "block" }}
              >
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@company.com"
                required
                autoFocus
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="label-category"
                style={{ display: "block" }}
              >
                Password
              </label>
              <PasswordInput
                id="password"
                name="password"
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div
                className="flex items-center gap-2.5 p-3 rounded-ui text-[13px]"
                style={{
                  background: "rgba(163,45,45,0.08)",
                  border: "0.5px solid var(--np-crimson)",
                  color: "var(--np-crimson)",
                }}
              >
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </Card>

        <p className="text-center text-[13px] mt-5" style={{ color: "var(--np-slate)" }}>
          New to NexPulse?{" "}
          <Link
            href="/register"
            className="font-medium"
            style={{ color: "var(--np-gold)" }}
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}

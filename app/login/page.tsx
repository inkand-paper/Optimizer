"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, Button, Input, PasswordInput } from "@/components/ui-elements";
import { Activity, Loader2, CheckCircle2 } from "lucide-react";
import { Suspense } from "react";

/**
 * [ENTRY-LEVEL DEFINITION] - Login Page
 * Analogous to checking in at a hotel. You provide your ID (email/password), 
 * and if valid, you get a "key" (JWT) to access the rest of the building.
 */
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isVerified = searchParams.get("verified") === "true";
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/dashboard");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-black min-h-screen">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[120px] pointer-events-none" />
        
        <Card className="w-full max-w-md p-10 relative z-10 border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-black/50 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col items-center gap-2 mb-10 text-center">
            <div className="h-14 w-14 rounded-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-4 shadow-xl">
              <Activity className="h-7 w-7 text-blue-600" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase leading-none">
              Access Console
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-black uppercase tracking-[0.3em] mt-2">
              NexPulse Infrastructure Gateway
            </p>
          </div>

          <form onSubmit={handleSubmit} method="POST" className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500" htmlFor="email">Email Address</label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="infrastructure@nexpulse.io" 
                required 
                autoFocus
                className="h-12 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 font-bold"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500" htmlFor="password">Password</label>
              </div>
              <PasswordInput 
                id="password" 
                name="password" 
                required 
                className="h-12 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 font-bold"
              />
            </div>

            {isVerified && (
              <div className="p-4 flex items-center gap-3 text-xs font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10 rounded-md border border-emerald-100 dark:border-emerald-900/20">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Account Activated
              </div>
            )}

            {error && (
              <div className="p-4 text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 dark:bg-red-900/10 rounded-md border border-red-100 dark:border-red-900/20">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-14 font-black uppercase tracking-[0.2em] text-xs" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Authenticate"}
            </Button>
          </form>

          <p className="mt-8 text-center text-[9px] text-zinc-400 font-black uppercase tracking-[0.2em]">
            New Engineering Unit?{" "}
            <Link href="/register" className="text-blue-600 hover:text-blue-500 transition-colors">
              Initialize Account
            </Link>
          </p>
        </Card>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}

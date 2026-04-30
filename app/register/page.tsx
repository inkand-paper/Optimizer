"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, Button, Input, PasswordInput } from "@/components/ui-elements";
import { Activity, Loader2, Sparkles } from "lucide-react";

/**
 * [ENTRY-LEVEL DEFINITION] - Register Page
 * Sovereign Obsidian Aesthetic
 */
export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");
  const [isSent, setIsSent] = React.useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name");
    const email = formData.get("email");
    const password = formData.get("password");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        if (data.emailVerified) {
          localStorage.setItem("user", JSON.stringify(data.user));
          router.push("/dashboard");
        } else {
          setIsSent(true);
        }
      } else {
        setError(data.message || "Registration failed. This email may already be in use.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (isSent) {
    return (
      <div className="flex-1 flex flex-col bg-white dark:bg-black min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6 py-12">
          <Card className="w-full max-w-md p-10 text-center border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-black/50 backdrop-blur-xl">
            <div className="h-16 w-16 rounded-md bg-zinc-900 dark:bg-zinc-50 flex items-center justify-center mx-auto mb-6 shadow-2xl">
              <Activity className="h-8 w-8 text-blue-600 animate-pulse" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase mb-4">
              Check Inbox
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-widest mb-10 leading-relaxed">
              We&apos;ve dispatched a verification link to your infrastructure endpoint. Please authenticate to proceed.
            </p>
            <Link href="/login">
               <Button className="w-full h-14 font-black uppercase tracking-[0.2em] text-xs">Return to Login</Button>
            </Link>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-black min-h-screen">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6 py-12 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[140px] pointer-events-none" />
        
        <Card className="w-full max-w-md p-10 relative z-10 border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-black/50 backdrop-blur-xl">
          <div className="flex flex-col items-center gap-2 mb-10 text-center">
            <div className="h-14 w-14 rounded-md bg-zinc-900 dark:bg-zinc-50 flex items-center justify-center mb-4 shadow-2xl">
              <Sparkles className="h-7 w-7 text-blue-600" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase">
              Join Engine
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs font-black uppercase tracking-[0.2em]">
              Architect Your Digital Infrastructure
            </p>
          </div>

          <form onSubmit={handleSubmit} method="POST" className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500" htmlFor="name">Full Identity</label>
              <Input 
                id="name" 
                name="name" 
                placeholder="John Doe" 
                required 
                className="h-12 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500" htmlFor="email">Email Address</label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="infrastructure@nexpulse.io" 
                required 
                className="h-12 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500" htmlFor="password">Security Key</label>
              <PasswordInput 
                id="password" 
                name="password" 
                placeholder="••••••••"
                required 
                className="h-12 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 font-bold"
              />
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Min. 8 Alpha-Numerics</p>
            </div>

            {error && (
              <div className="p-4 text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-50 dark:bg-red-900/10 rounded-md border border-red-100 dark:border-red-900/20">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-14 font-black uppercase tracking-[0.2em] text-xs" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Deploy Architecture"}
            </Button>
          </form>

          <p className="mt-8 text-center text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest">
            Already Member?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-500 transition-colors">
              Access Dashboard
            </Link>
          </p>
        </Card>
      </main>
    </div>
  );
}

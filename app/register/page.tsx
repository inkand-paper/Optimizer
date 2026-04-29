"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, Button, Input, PasswordInput } from "@/components/ui-elements";
import { Activity, Loader2, Sparkles } from "lucide-react";

/**
 * [ENTRY-LEVEL DEFINITION] - Register Page
 * Analogous to signing up for a new club membership. 
 * We collect your info, give you a unique ID, and welcome you to the platform.
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
      <div className="flex-1 flex flex-col bg-zinc-50 dark:bg-zinc-950">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6 py-12">
          <Card className="w-full max-w-md p-8 text-center">
            <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-6">
              <Activity className="h-8 w-8 text-blue-600 animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
              Check your inbox!
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8 leading-relaxed">
              We&apos;ve sent a verification link to your email. Please click the link to activate your account and start optimizing.
            </p>
            <Link href="/login">
               <Button className="w-full">Back to Login</Button>
            </Link>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-6 py-12">
        <Card className="w-full max-w-md p-8">
          <div className="flex flex-col items-center gap-2 mb-8 text-center">
            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-2">
              <Sparkles className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Create your account
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              Start optimizing your Next.js project today
            </p>
          </div>

          <form onSubmit={handleSubmit} method="POST" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="name">Full Name</label>
              <Input 
                id="name" 
                name="name" 
                placeholder="John Doe" 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="email">Email</label>
              <Input 
                id="email" 
                name="email" 
                type="email" 
                placeholder="name@example.com" 
                required 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="password">Password</label>
              <PasswordInput 
                id="password" 
                name="password" 
                placeholder="••••••••"
                required 
              />
              <p className="text-[10px] text-zinc-400">At least 8 characters</p>
            </div>

            {error && (
              <div className="p-3 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/10 rounded-lg">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
            Already have an account?{" "}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Sign In
            </Link>
          </p>
        </Card>
      </main>
    </div>
  );
}

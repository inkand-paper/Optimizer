"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "./ui-elements";
import { Activity, Menu, X, BookOpen, LayoutDashboard, LogIn, LogOut, UserPlus, User, HelpCircle } from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        setIsLoggedIn(!!d?.success);
        setIsAdmin(d?.user?.role === "ADMIN");
      })
      .catch(() => {});
  }, [pathname]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setIsAdmin(false);
    setOpen(false);
    router.push("/login");
  }

  const navLink =
    "text-xs font-medium text-muted-foreground hover:text-foreground transition-colors";

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-semibold text-sm shrink-0 group">
          <div className="h-7 w-7 rounded border border-border bg-muted flex items-center justify-center text-foreground group-hover:border-foreground/30 transition-colors">
            <Activity className="h-3.5 w-3.5" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-foreground tracking-tight font-semibold">NexPulse</span>
            <span className="text-[10px] font-mono text-muted-foreground px-1 py-0.2 rounded bg-muted border border-border">v2.4</span>
          </div>
        </Link>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-5">
          <Link href="/docs" className={navLink}>Documentation</Link>
          <Link href="/faq" className={navLink}>FAQ</Link>
          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Link href="/dashboard/admin" className={navLink}>Admin</Link>
              )}
              <Link href="/dashboard" className={navLink}>Console</Link>
              <Link href="/dashboard/profile" className={navLink}>Settings</Link>
              <button 
                onClick={handleLogout} 
                className="text-xs font-medium text-muted-foreground hover:text-rose-500 transition-colors cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={navLink}>Sign In</Link>
              <Link href="/register">
                <Button size="sm" className="h-8 text-xs font-medium">
                  Get Started
                </Button>
              </Link>
            </>
          )}
          <div className="border-l border-border pl-4">
            <ThemeToggle />
          </div>
        </nav>

        {/* Mobile toggle */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setOpen(!open)}
            className="p-1.5 rounded border border-border text-muted-foreground hover:text-foreground"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden bg-card border-b border-border px-4 py-4 flex flex-col gap-3 animate-in fade-in duration-150">
          <Link href="/docs" onClick={() => setOpen(false)} className="flex items-center gap-2.5 text-xs font-medium text-foreground p-1.5 rounded hover:bg-muted">
            <BookOpen className="h-4 w-4 text-muted-foreground" /> Documentation
          </Link>
          <Link href="/faq" onClick={() => setOpen(false)} className="flex items-center gap-2.5 text-xs font-medium text-foreground p-1.5 rounded hover:bg-muted">
            <HelpCircle className="h-4 w-4 text-muted-foreground" /> FAQ
          </Link>
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2.5 text-xs font-medium text-foreground p-1.5 rounded hover:bg-muted">
                <LayoutDashboard className="h-4 w-4 text-muted-foreground" /> Console
              </Link>
              <Link href="/dashboard/profile" onClick={() => setOpen(false)} className="flex items-center gap-2.5 text-xs font-medium text-foreground p-1.5 rounded hover:bg-muted">
                <User className="h-4 w-4 text-muted-foreground" /> Profile Settings
              </Link>
              {isAdmin && (
                <Link href="/dashboard/admin" onClick={() => setOpen(false)} className="flex items-center gap-2.5 text-xs font-medium text-foreground p-1.5 rounded hover:bg-muted">
                  Admin Panel
                </Link>
              )}
              <button onClick={handleLogout} className="flex items-center gap-2.5 text-xs font-medium text-rose-500 p-1.5 rounded hover:bg-rose-500/10 text-left">
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="flex items-center gap-2.5 text-xs font-medium text-foreground p-1.5 rounded hover:bg-muted">
                <LogIn className="h-4 w-4 text-muted-foreground" /> Sign In
              </Link>
              <Link href="/register" onClick={() => setOpen(false)}>
                <Button size="sm" className="w-full text-xs font-medium">
                  <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Create Account
                </Button>
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
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
    "text-[13px] font-medium text-np-slate hover:text-foreground transition-colors";

  return (
    <header
      style={{ borderBottom: "0.5px solid var(--border)" }}
      className="sticky top-0 z-50 bg-background/95 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-semibold text-[15px] shrink-0">
          <Activity className="h-5 w-5 text-np-gold" />
          <span className="text-foreground">NexPulse</span>
        </Link>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/docs" className={navLink}>Docs</Link>
          <Link href="/faq" className={navLink}>FAQ</Link>
          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Link href="/dashboard/admin" className={navLink}>Admin</Link>
              )}
              <Link href="/dashboard" className={navLink}>Dashboard</Link>
              <Link href="/dashboard/profile" className={navLink}>Profile</Link>
              <button onClick={handleLogout} className="text-[13px] font-medium text-np-crimson hover:opacity-80 transition-opacity">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={navLink}>Login</Link>
              <Link
                href="/register"
                className="np-btn-primary text-[13px] h-9 px-4"
              >
                Get Started
              </Link>
            </>
          )}
          <ThemeToggle />
        </nav>

        {/* Mobile toggle */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-ui text-np-slate hover:text-foreground transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          style={{ borderTop: "0.5px solid var(--border)" }}
          className="md:hidden bg-background px-4 py-5 flex flex-col gap-4"
        >
          <Link href="/docs" onClick={() => setOpen(false)} className="flex items-center gap-3 text-[14px] font-medium">
            <BookOpen className="h-4 w-4 text-np-gold" /> Docs
          </Link>
          <Link href="/faq" onClick={() => setOpen(false)} className="flex items-center gap-3 text-[14px] font-medium">
            <HelpCircle className="h-4 w-4 text-np-gold" /> FAQ
          </Link>
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-3 text-[14px] font-medium">
                <LayoutDashboard className="h-4 w-4 text-np-gold" /> Dashboard
              </Link>
              <Link href="/dashboard/profile" onClick={() => setOpen(false)} className="flex items-center gap-3 text-[14px] font-medium">
                <User className="h-4 w-4 text-np-gold" /> Profile
              </Link>
              {isAdmin && (
                <Link href="/dashboard/admin" onClick={() => setOpen(false)} className="flex items-center gap-3 text-[14px] font-medium">
                  Dashboard — Admin
                </Link>
              )}
              <button onClick={handleLogout} className="flex items-center gap-3 text-[14px] font-medium text-np-crimson">
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="flex items-center gap-3 text-[14px] font-medium">
                <LogIn className="h-4 w-4 text-np-gold" /> Login
              </Link>
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="np-btn-primary w-full justify-center"
              >
                <UserPlus className="h-4 w-4 mr-2" /> Get Started
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}

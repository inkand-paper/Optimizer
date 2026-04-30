"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { Activity, LogOut, LayoutDashboard, UserPlus, LogIn, BookOpen, Menu, X, ShieldAlert } from "lucide-react";

/**
 * [PRODUCTION-GRADE] - Navbar
 * Sovereign Obsidian Aesthetic
 */
export function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          setIsLoggedIn(true);
          setIsAdmin(data.user?.role === 'ADMIN');
        } else {
          setIsLoggedIn(false);
          setIsAdmin(false);
        }
      } catch {
        setIsLoggedIn(false);
        setIsAdmin(false);
      }
    };
    
    checkAuth();
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setIsAdmin(false);
    setIsMobileMenuOpen(false);
    router.push("/login");
  }

  const LinkItem = ({ href, icon: Icon, children, className = "" }: any) => (
    <Link 
      href={href} 
      onClick={() => setIsMobileMenuOpen(false)}
      className={`flex items-center gap-3 ${className}`}
    >
      <Icon className="h-4 w-4 text-blue-600" /> <span className="uppercase tracking-[0.2em]">{children}</span>
    </Link>
  );

  return (
    <nav className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black sticky top-0 z-50">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-black text-xl tracking-tighter z-50">
          <Activity className="h-6 w-6 text-blue-600" />
          <span className="text-zinc-900 dark:text-white uppercase tracking-tighter">NexPulse</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link 
            href="/docs" 
            className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-white transition-colors"
          >
            Docs
          </Link>
          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Link 
                  href="/dashboard/admin" 
                  className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-white transition-colors"
                >
                  Admin
                </Link>
              )}
              <Link 
                href="/dashboard" 
                className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <button 
                onClick={handleLogout}
                className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 hover:text-red-600 transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-white transition-colors"
              >
                Login
              </Link>
              <Link 
                href="/register" 
                className="bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 px-6 py-2 rounded-md text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:bg-blue-600 hover:text-white flex items-center gap-1"
              >
                Get Started
              </Link>
            </>
          )}
          <div className="border-l border-zinc-200 dark:border-zinc-800 pl-6">
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Navigation Toggle */}
        <div className="flex md:hidden items-center gap-4 z-50">
          <ThemeToggle />
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 -mr-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-white dark:bg-black z-40 flex flex-col px-8 py-10 animate-in slide-in-from-top-4 duration-300">
          <div className="flex flex-col gap-8">
            <LinkItem href="/docs" icon={BookOpen} className="text-sm font-black text-zinc-900 dark:text-white">
              Documentation
            </LinkItem>
            
            {isLoggedIn ? (
              <>
                <LinkItem href="/dashboard" icon={LayoutDashboard} className="text-sm font-black text-zinc-900 dark:text-white">
                  Dashboard
                </LinkItem>
                {isAdmin && (
                  <LinkItem href="/dashboard/admin" icon={ShieldAlert} className="text-sm font-black text-zinc-900 dark:text-white">
                    Admin Portal
                  </LinkItem>
                )}
                <div className="h-px bg-zinc-100 dark:bg-zinc-900 my-4" />
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-4 text-sm font-black uppercase tracking-[0.2em] text-red-600 dark:text-red-500 w-full text-left"
                >
                  <LogOut className="h-5 w-5" /> Logout
                </button>
              </>
            ) : (
              <>
                <LinkItem href="/login" icon={LogIn} className="text-sm font-black text-zinc-900 dark:text-white">
                  Login
                </LinkItem>
                <Link 
                  href="/register" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-5 text-sm font-black uppercase tracking-[0.3em] bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 rounded-md flex items-center justify-center mt-6 shadow-xl"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

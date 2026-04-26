"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { Activity, LogOut, LayoutDashboard, UserPlus, LogIn, BookOpen, Menu, X, ShieldAlert } from "lucide-react";

/**
 * [ENTRY-LEVEL] - Navbar
 * Now with full mobile responsiveness and a sleek slide-out drawer.
 */
export function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [isAdmin, setIsAdmin] = React.useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  React.useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setIsAdmin(user.role === "ADMIN");
        } catch (e) {}
      } else {
        setIsAdmin(false);
      }
    };
    
    checkAuth();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setIsAdmin(false);
    setIsMobileMenuOpen(false);
    router.push("/login");
  }

  // Helper for closing menu when clicking a link
  const LinkItem = ({ href, icon: Icon, children, className = "" }: any) => (
    <Link 
      href={href} 
      onClick={() => setIsMobileMenuOpen(false)}
      className={`flex items-center gap-2 ${className}`}
    >
      <Icon className="h-4 w-4" /> <span>{children}</span>
    </Link>
  );

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight z-50">
          <Activity className="h-6 w-6 text-blue-600" />
          <span>NexPulse</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4">
          <Link 
            href="/docs" 
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5"
          >
            <BookOpen className="h-4 w-4" /> Docs
          </Link>
          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Link 
                  href="/dashboard/admin" 
                  className="flex items-center gap-1.5 text-sm font-bold text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 transition-colors px-3 py-1.5 rounded-xl"
                >
                  <ShieldAlert className="h-4 w-4" /> Admin
                </Link>
              )}
              <Link 
                href="/dashboard" 
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5"
              >
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-600 transition-colors bg-red-50 dark:bg-red-900/10 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/login" 
                className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5"
              >
                <LogIn className="h-4 w-4" /> Login
              </Link>
              <Link 
                href="/register" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-md active:scale-95 flex items-center gap-1"
              >
                <UserPlus className="h-4 w-4" /> Get Started
              </Link>
            </>
          )}
          <div className="border-l pl-4 ml-1">
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile Navigation Toggle */}
        <div className="flex md:hidden items-center gap-3 z-50">
          <ThemeToggle />
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 bg-background/95 backdrop-blur-md z-40 border-t flex flex-col p-4 animate-in slide-in-from-top-2">
          <div className="flex flex-col gap-4">
            <LinkItem href="/docs" icon={BookOpen} className="p-3 text-lg font-medium rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800">
              Documentation
            </LinkItem>
            
            {isLoggedIn ? (
              <>
                <LinkItem href="/dashboard" icon={LayoutDashboard} className="p-3 text-lg font-medium rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  Dashboard
                </LinkItem>
                {isAdmin && (
                  <LinkItem href="/dashboard/admin" icon={ShieldAlert} className="p-3 text-lg font-bold text-white bg-zinc-900 dark:bg-white dark:text-zinc-900 rounded-xl">
                    Admin Portal
                  </LinkItem>
                )}
                <div className="h-px bg-border my-2" />
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 p-3 text-lg font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl w-full text-left"
                >
                  <LogOut className="h-5 w-5" /> Logout
                </button>
              </>
            ) : (
              <>
                <div className="h-px bg-border my-2" />
                <LinkItem href="/login" icon={LogIn} className="p-3 text-lg font-medium rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800">
                  Login
                </LinkItem>
                <LinkItem href="/register" icon={UserPlus} className="p-3 text-lg font-bold bg-blue-600 text-white rounded-xl text-center justify-center mt-2 shadow-lg">
                  Get Started
                </LinkItem>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}


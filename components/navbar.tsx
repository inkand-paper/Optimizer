"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { Activity, LogOut, LayoutDashboard, UserPlus, LogIn } from "lucide-react";

/**
 * [ENTRY-LEVEL] - Navbar
 * Now dynamic! It checks if you are logged in and shows different buttons 
 * like "Dashboard" and "Logout" accordingly.
 */
export function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  // Check if token exists on load
  React.useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    // Listen for storage changes (optional but good for multi-tab consistency)
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    router.push("/login");
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <Activity className="h-6 w-6 text-blue-600" />
          <span>
            {/* [BRANDING] Next.js Optimizer Suite */}
            Next.js Optimizer
          </span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          {isLoggedIn ? (
            <>
              <Link 
                href="/dashboard" 
                className="hidden sm:flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" /> Dashboard
              </Link>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-1 text-sm font-medium text-red-500 hover:text-red-600 transition-colors bg-red-50 dark:bg-red-900/10 px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900"
              >
                <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Logout</span>
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
                <UserPlus className="h-4 w-4" /> <span className="hidden sm:inline">Get Started</span>
              </Link>
            </>
          )}
          <div className="border-l pl-2 sm:pl-4 ml-1">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}


"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

/**
 * app/dashboard/code-review/page.tsx
 * DEPRECATED: This standalone page is now integrated into the main dashboard tabs.
 * This file now handles redirection to ensure a unified UI experience.
 */
export default function CodeReviewRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Force redirect to the main dashboard audits tab
    router.replace("/dashboard?tab=audits");
  }, [router]);

  return (
    <div className="min-h-screen bg-np-obsidian flex flex-col items-center justify-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-np-gold" />
      <p className="text-[12px] font-mono text-muted-foreground animate-pulse tracking-widest uppercase">
        Synchronizing Neural Console...
      </p>
    </div>
  );
}
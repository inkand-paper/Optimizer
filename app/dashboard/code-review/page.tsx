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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-3">
      <Loader2 className="h-6 w-6 animate-spin text-foreground" />
      <p className="text-sm text-muted-foreground">
        Redirecting to audits...
      </p>
    </div>
  );
}
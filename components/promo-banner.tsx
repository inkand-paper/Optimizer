"use client";

import * as React from "react";
import { X, Tag, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Promotion {
  id: string;
  title: string;
  description?: string | null;
  discountCode: string;
  discountPercent: number;
  targetPlan: string;
  endsAt: string;
}

function useCountdown(endsAt: string) {
  const [timeLeft, setTimeLeft] = React.useState("");

  React.useEffect(() => {
    function calc() {
      const diff = new Date(endsAt).getTime() - Date.now();
      if (diff <= 0) { setTimeLeft("Expired"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (d > 0) setTimeLeft(`${d}d ${h}h ${m}m`);
      else if (h > 0) setTimeLeft(`${h}h ${m}m ${s}s`);
      else setTimeLeft(`${m}m ${s}s`);
    }
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, [endsAt]);

  return timeLeft;
}

export function PromoBanner({ userPlan }: { userPlan?: string }) {
  const [promo, setPromo] = React.useState<Promotion | null>(null);
  const [dismissed, setDismissed] = React.useState(() => {
    if (typeof window === "undefined") return false;
    return Boolean(sessionStorage.getItem("promo_dismissed"));
  });
  const [copied, setCopied] = React.useState(false);
  const timeLeft = useCountdown(promo?.endsAt || "");

  React.useEffect(() => {
    if (dismissed) return;
    fetch("/api/promotions")
      .then(r => r.json())
      .then(d => { if (d.promotion) setPromo(d.promotion); })
      .catch(() => {});
  }, [dismissed]);

  const dismiss = () => {
    sessionStorage.setItem("promo_dismissed", "1");
    setDismissed(true);
  };

  const copyCode = () => {
    if (!promo) return;
    navigator.clipboard.writeText(promo.discountCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!promo || dismissed || timeLeft === "Expired") return null;

  // Don't show if user is already on the target plan or higher
  if (promo.targetPlan === "PRO" && (userPlan === "PRO" || userPlan === "BUSINESS")) return null;
  if (promo.targetPlan === "BUSINESS" && userPlan === "BUSINESS") return null;

  return (
    <div className={cn(
      "relative w-full border-b border-np-gold/30 bg-np-gold/8",
      "animate-in slide-in-from-top-2 duration-500"
    )}>
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        {/* Icon */}
        <div className="flex items-center gap-2 shrink-0">
          <Tag className="h-3.5 w-3.5 text-np-gold" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-np-gold">Limited Offer</span>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0">
          <span className="text-[13px] font-medium text-foreground truncate">{promo.title}</span>
          {promo.description && (
            <span className="text-[11px] text-muted-foreground hidden sm:inline">{promo.description}</span>
          )}
        </div>

        {/* Code + timer */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span className="font-mono">{timeLeft}</span>
          </div>
          <button
            onClick={copyCode}
            className={cn(
              "px-3 py-1 rounded text-[11px] font-bold uppercase tracking-wider border transition-all",
              copied
                ? "bg-np-teal/20 border-np-teal/40 text-np-teal"
                : "bg-np-gold/15 border-np-gold/40 text-np-gold hover:bg-np-gold/25"
            )}
          >
            {copied ? "Copied!" : promo.discountCode}
          </button>
        </div>

        {/* Dismiss */}
        <button
          onClick={dismiss}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

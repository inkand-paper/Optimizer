"use client";

import * as React from "react";
import { X, Check, Zap, Shield, Globe, Loader2, AlertCircle, MessageCircle } from "lucide-react";
import { Button } from "./ui-elements";
import { cn } from "@/lib/utils";
import { PLAN_LIMITS } from "@/lib/plans";

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: string;
}

export function PricingModal({ isOpen, onClose, currentPlan = "FREE" }: PricingModalProps) {
  const [loadingPlan, setLoadingPlan] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  if (!isOpen) return null;

  const handleUpgrade = async (planId: string) => {
    setLoadingPlan(planId);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ plan: planId.toUpperCase() }),
      });

      const data = await res.json();

      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        setErrorMessage(
          data.message || "Billing checkout is currently awaiting store configuration. Please contact sales."
        );
      }
    } catch {
      setErrorMessage("Network error while connecting to checkout engine.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        className="relative w-full max-w-5xl bg-card rounded-lg border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 px-6 border-b border-border flex items-center justify-between bg-card">
          <div className="flex items-center gap-3">
            <div className="h-7 w-7 rounded border border-border bg-muted flex items-center justify-center text-foreground">
              <Zap className="h-3.5 w-3.5" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Upgrade Console Tier</h2>
              <p className="text-xs text-muted-foreground font-mono">Select infrastructure scale</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          <div className="max-w-xl">
            <h3 className="text-lg font-semibold tracking-tight text-foreground">
              Scale your observability and code audits
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Choose the capacity tier that fits your engineering team. Instant activation.
            </p>
          </div>

          {errorMessage && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded text-xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              <a
                href="mailto:support@nexpulse.io?subject=Enterprise Upgrade Inquiry"
                className="font-medium underline shrink-0 hover:text-rose-400"
              >
                Contact Desk
              </a>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(PLAN_LIMITS).map(([key, plan]) => {
              const isCurrent = currentPlan.toUpperCase() === key.toUpperCase();
              const isPro = key === 'PRO';

              return (
                <div 
                  key={key}
                  className={cn(
                    "p-5 rounded-lg border bg-card flex flex-col justify-between transition-colors",
                    isPro ? "border-foreground shadow-sm" : "border-border hover:border-foreground/30"
                  )}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">{plan.name}</span>
                      {isPro && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-foreground text-background font-medium">
                          POPULAR
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-mono font-bold text-foreground">{plan.price}</span>
                        <span className="text-xs text-muted-foreground font-mono">/month</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 min-h-[32px] leading-relaxed">
                        {plan.description}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-border text-xs">
                      <div className="flex items-center gap-2 font-mono font-medium text-foreground">
                        <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>{plan.checks.toLocaleString()} Checks / Month</span>
                      </div>
                      {plan.features.map((feature, i) => (
                        <div 
                          key={i} 
                          className={cn(
                            "flex items-start gap-2",
                            feature.active ? "text-foreground" : "text-muted-foreground"
                          )}
                        >
                          <Check className={cn("h-3.5 w-3.5 shrink-0 mt-0.5", feature.active ? "text-emerald-500" : "text-muted-foreground/40")} />
                          <span className="text-[11px] leading-tight">{feature.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6">
                    <Button 
                      variant={isPro ? 'primary' : 'outline'}
                      size="sm"
                      disabled={isCurrent || loadingPlan !== null}
                      onClick={() => handleUpgrade(key)}
                      className="w-full text-xs font-medium"
                    >
                      {loadingPlan === key ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : isCurrent ? (
                        "Current Plan"
                      ) : (
                        `Upgrade to ${plan.name}`
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-border bg-card flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-foreground" /> SOC-2 Encrypted</span>
            <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-foreground" /> Multi-Region Edge</span>
          </div>
          <div className="flex items-center gap-2">
            <span>Need custom quotas?</span>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-7 px-2.5"
              onClick={() => window.open('mailto:enterprise@nexpulse.io?subject=Custom Quota Request', '_blank')}
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

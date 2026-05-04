"use client";

import * as React from "react";
import { X, Check, Zap, Shield, Globe, MessageCircle } from "lucide-react";
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

  if (!isOpen) return null;

  const handleUpgrade = async (planId: string) => {
    setLoadingPlan(planId);
    // Simulate API call for upgrade
    setTimeout(() => {
      setLoadingPlan(null);
      window.location.href = "https://wa.me/8801345808742?text=I want to upgrade to " + planId;
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-6xl bg-card rounded-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-border flex items-center justify-between bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-ui bg-np-gold/10 flex items-center justify-center text-np-gold border border-np-gold/20 shadow-sm">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-[16px] font-semibold tracking-tight uppercase">Scale Your NexPulse</h2>
              <p className="label-category text-[10px] mt-0.5">Universal Infrastructure Monitoring</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-muted-foreground hover:bg-muted rounded-ui transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10">
          <div className="text-center mb-10">
            <h3 className="text-3xl font-semibold mb-3 tracking-tight uppercase">Select Your Mission Control</h3>
            <p className="text-muted-foreground max-w-xl mx-auto text-[14px]">Choose the architecture that matches your growth and unlock universal monitoring authority.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(PLAN_LIMITS).map(([key, plan]) => {
              const isCurrent = currentPlan.toUpperCase() === key.toUpperCase();
              const isPro = key === 'PRO';

              return (
                <div 
                  key={key}
                  className={cn(
                    "relative p-8 flex flex-col h-full transition-all duration-300 rounded-card bg-card border border-border",
                    isPro && "border-np-gold ring-1 ring-np-gold shadow-lg shadow-np-gold/5 z-10 np-grid-bg overflow-hidden"
                  )}
                >
                  {isPro && <div className="absolute top-0 right-0 w-32 h-32 bg-np-gold/10 rounded-full blur-[40px] -mr-10 -mt-10 pointer-events-none" />}
                  
                  <div className="mb-6 relative z-10">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-[16px] font-bold tracking-tight uppercase">{plan.name}</h4>
                      {isPro && (
                        <span className="text-[10px] font-semibold uppercase tracking-widest bg-np-gold text-white px-2.5 py-1 rounded-sm shadow-sm">Recommended</span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-3xl font-bold tracking-tight">{plan.price}</span>
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">/mo</span>
                    </div>
                    <p className="label-category text-muted-foreground leading-relaxed min-h-[40px] text-[11px]">
                      {plan.description}
                    </p>
                  </div>

                  <div className="space-y-5 mb-8 flex-grow relative z-10">
                    <p className="label-category text-muted-foreground border-b border-border pb-2 text-[10px]">Capabilities Matrix</p>
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3 text-[12px] font-semibold uppercase tracking-tight text-foreground">
                        <div className="h-5 w-5 rounded-ui flex items-center justify-center shrink-0 bg-np-gold/10 text-np-gold border border-np-gold/20">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                        <span>
                          {plan.checks.toLocaleString()} Checks
                        </span>
                      </li>
                      {plan.features.map((feature, i) => (
                        <li key={i} className={cn(
                          "flex items-start gap-3 text-[12px] transition-colors",
                          feature.active ? "text-foreground font-semibold uppercase tracking-tight" : "text-muted-foreground uppercase tracking-tight"
                        )}>
                          <div className={cn(
                            "h-5 w-5 rounded-ui flex items-center justify-center shrink-0",
                            feature.active ? "bg-muted text-foreground border border-border" : "bg-transparent border border-border text-muted-foreground"
                          )}>
                            <Check className="h-3.5 w-3.5" />
                          </div>
                          <span className="flex-1 mt-0.5">{feature.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    variant={isPro ? 'primary' : 'outline'}
                    disabled={isCurrent || loadingPlan !== null}
                    onClick={() => handleUpgrade(key)}
                    className={cn(
                      "w-full uppercase tracking-widest text-[11px] h-12 relative z-10",
                      isPro && "shadow-md"
                    )}
                  >
                    {loadingPlan === key ? "Calibrating..." : isCurrent ? "Active Console" : "Initialize Engine"}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-border bg-muted/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5 text-np-gold" /> Enterprise Security</span>
            <span className="flex items-center gap-1.5"><Globe className="h-3.5 w-3.5 text-np-gold" /> Global Monitoring</span>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-[10px] text-muted-foreground font-semibold">Local Payment Support Available</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-[10px] font-semibold uppercase tracking-widest h-9"
              onClick={() => window.open('https://wa.me/8801345808742?text=I want to pay via bKash', '_blank')}
            >
              <MessageCircle className="h-3.5 w-3.5 mr-2 text-np-teal" /> Chat with Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

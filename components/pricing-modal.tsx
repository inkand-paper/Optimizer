"use client";

import * as React from "react";
import { X, Check, Zap, Shield, Crown, Globe, MessageCircle } from "lucide-react";
import { Button, Card } from "./ui-elements";
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-6xl bg-white dark:bg-black rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-zinc-100 dark:border-zinc-900 flex items-center justify-between bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight">Scale Your NexPulse</h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest">Universal Infrastructure Monitoring</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md transition-colors"
          >
            <X className="h-5 w-5 text-zinc-500" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-4xl font-black mb-3 tracking-tight">Select Your Mission Control</h3>
            <p className="text-zinc-500 dark:text-zinc-400 font-bold max-w-xl mx-auto text-sm">Choose the architecture that matches your growth and unlock universal monitoring authority.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(PLAN_LIMITS).map(([key, plan]) => {
              const isCurrent = currentPlan.toUpperCase() === key.toUpperCase();
              const isPro = key === 'PRO';

              return (
                <Card 
                  key={key}
                  className={cn(
                    "relative p-8 flex flex-col h-full transition-all duration-300 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950",
                    isPro && "border-blue-600 ring-2 ring-blue-600/20 dark:ring-blue-500/20 shadow-2xl shadow-blue-500/10 z-10"
                  )}
                >
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xl font-black tracking-tighter uppercase">{plan.name}</h4>
                      {isPro && (
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-blue-600 text-white px-2.5 py-1 rounded-sm shadow-lg">Recommended</span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-4xl font-black tracking-tighter">{plan.price}</span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">/mo</span>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-tight text-zinc-500 dark:text-zinc-400 leading-relaxed min-h-[40px]">
                      {plan.description}
                    </p>
                  </div>

                  <div className="space-y-6 mb-8 flex-grow">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 border-b border-zinc-100 dark:border-zinc-900 pb-2">Capabilities Matrix</p>
                    <ul className="space-y-3.5">
                      <li className="flex items-center gap-3 text-xs font-black uppercase tracking-tight">
                        <div className="h-5 w-5 rounded-sm flex items-center justify-center shrink-0 bg-blue-600 text-white shadow-sm">
                          <Check className="h-3 w-3" />
                        </div>
                        <span className="text-zinc-900 dark:text-zinc-100">
                          {plan.checks.toLocaleString()} Checks
                        </span>
                      </li>
                      {plan.features.map((feature, i) => (
                        <li key={i} className={cn(
                          "flex items-start gap-3 text-xs leading-tight transition-colors",
                          feature.active ? "text-zinc-900 dark:text-zinc-100 font-black uppercase tracking-tight" : "text-zinc-300 dark:text-zinc-700 font-bold uppercase tracking-tight"
                        )}>
                          <div className={cn(
                            "h-5 w-5 rounded-sm flex items-center justify-center shrink-0 border",
                            feature.active ? "bg-zinc-900 dark:bg-white border-zinc-900 dark:border-white text-white dark:text-zinc-900" : "bg-transparent border-zinc-100 dark:border-zinc-800 text-zinc-200"
                          )}>
                            <Check className="h-3 w-3" />
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
                      "w-full font-black text-[10px] uppercase tracking-[0.2em] h-14",
                      isPro && "bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-xl shadow-blue-500/20"
                    )}
                  >
                    {loadingPlan === key ? "Calibrating..." : isCurrent ? "Active Console" : "Initialize Engine"}
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">
            <span className="flex items-center gap-1"><Shield className="h-3 w-3 text-blue-500" /> Enterprise Security</span>
            <span className="flex items-center gap-1"><Globe className="h-3 w-3 text-blue-500" /> Global Monitoring</span>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-[10px] text-zinc-500 font-bold mr-4">Local Payment Support Available</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-[10px] font-black uppercase tracking-widest h-8"
              onClick={() => window.open('https://wa.me/8801345808742?text=I want to pay via bKash', '_blank')}
            >
              <MessageCircle className="h-3 w-3 mr-2 text-green-500" /> Chat with Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

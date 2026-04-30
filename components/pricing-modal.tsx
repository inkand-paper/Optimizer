"use client";

import * as React from "react";
import { X, Check, Zap, Shield, Crown, Globe, MessageCircle } from "lucide-react";
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
    if (planId === "FREE" || planId === currentPlan) return;
    
    setLoadingPlan(planId);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      });
      
      const data = await res.json();
      if (res.ok && data.url) {
        window.location.href = data.url;
      } else {
        alert(data.message || "Failed to initiate checkout");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md" 
        onClick={onClose} 
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-white dark:bg-zinc-900 rounded-[var(--radius)] shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-indigo-600/5 to-transparent opacity-50 pointer-events-none" />
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5 text-zinc-400" />
          </button>
          
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white mb-4">
            Scale Your <span className="text-indigo-600">NexPulse</span>
          </h2>
          <p className="text-zinc-500 max-w-2xl mx-auto text-sm sm:text-base">
            Your current plan has reached its capacity. Choose a tier that matches your growth and unlock universal monitoring authority.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="px-6 sm:px-12 pb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.entries(PLAN_LIMITS).map(([key, plan]) => (
            <Card 
              key={key}
              className={cn(
                "relative p-8 border-zinc-100 dark:border-zinc-800 transition-all duration-300",
                key === 'PRO' && "border-indigo-500 ring-1 ring-indigo-500 shadow-xl shadow-indigo-500/10 z-10 bg-white dark:bg-zinc-900",
                currentPlan === key && "opacity-80"
              )}
            >
              {key === 'PRO' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="flex flex-col h-full">
                <div className="mb-8">
                  <div className={cn(
                    "h-12 w-12 rounded-xl flex items-center justify-center mb-4 shadow-sm",
                    key === 'PRO' ? "bg-indigo-600 text-white" : "bg-zinc-100 dark:bg-zinc-800 text-indigo-600"
                  )}>
                    {key === 'FREE' ? <Globe className="h-5 w-5" /> : key === 'PRO' ? <Zap className="h-5 w-5" /> : <Crown className="h-5 w-5" />}
                  </div>
                  <h3 className="text-xl font-black mb-1">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">
                      {plan.price}
                    </span>
                    <span className="text-sm text-zinc-400">
                      /month
                    </span>
                  </div>
                </div>

                <div className="space-y-4 flex-grow">
                   <div className="text-xs font-bold uppercase tracking-widest text-zinc-400">
                      What's Included
                   </div>
                   <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                         <div className="h-5 w-5 rounded-full flex items-center justify-center shrink-0 bg-indigo-600/10">
                            <Check className="h-3 w-3 text-indigo-600" />
                         </div>
                         <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
                            {plan.checks.toLocaleString()} Intelligence Checks
                         </span>
                      </li>
                      {plan.features.map((feature, i) => (
                        <li key={i} className={cn(
                          "flex items-center gap-3 text-sm transition-colors",
                          feature.active ? "text-zinc-700 dark:text-zinc-300 font-medium" : "text-zinc-400 opacity-50"
                        )}>
                          <div className={cn(
                            "h-5 w-5 rounded-full flex items-center justify-center shrink-0",
                            feature.active ? "bg-indigo-600/10 text-indigo-600" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-300"
                          )}>
                            <Check className="h-3 w-3" />
                          </div>
                          <span className="flex-1">{feature.text}</span>
                        </li>
                      ))}
                   </ul>
                </div>

                <Button 
                  className="mt-8 w-full h-12 font-bold"
                  variant={key === 'PRO' ? 'primary' : 'outline'}
                  onClick={() => handleUpgrade(key)}
                  disabled={loadingPlan !== null || currentPlan === key}
                >
                  {loadingPlan === key ? "Processing..." : currentPlan === key ? "Current Plan" : "Upgrade Now"}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Local Payments (bKash/Bank) */}
        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 sm:p-10 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-pink-500/10 flex items-center justify-center text-pink-500">
                 <Shield className="h-6 w-6" />
              </div>
              <div>
                 <h4 className="font-bold text-sm dark:text-white">Local Payments Supported</h4>
                 <p className="text-xs text-zinc-500">For bKash, Rocket, or Direct Bank Transfer</p>
              </div>
           </div>
           <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                className="rounded-xl flex items-center gap-2"
                onClick={() => window.open('https://wa.me/8801345808742?text=I want to pay via bKash', '_blank')}
              >
                 <MessageCircle className="h-4 w-4 text-green-500" />
                 Chat with Sales
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}

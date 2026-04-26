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
  if (!isOpen) return null;

  const plans = [
    {
      id: "FREE",
      name: "Starter",
      price: "$0",
      description: "Perfect for indie developers testing their first project.",
      icon: Globe,
      color: "zinc",
      features: PLAN_LIMITS.FREE.features,
      limits: `${PLAN_LIMITS.FREE.monitors} Monitors`
    },
    {
      id: "PRO",
      name: "Pro Optimizer",
      price: "$29",
      description: "The sweet spot for growing agencies and SaaS founders.",
      icon: Zap,
      color: "blue",
      popular: true,
      features: PLAN_LIMITS.PRO.features,
      limits: `${PLAN_LIMITS.PRO.monitors} Monitors`
    },
    {
      id: "BUSINESS",
      name: "Enterprise",
      price: "$99",
      description: "Unmatched power for high-traffic networks and teams.",
      icon: Crown,
      color: "purple",
      features: PLAN_LIMITS.BUSINESS.features,
      limits: `${PLAN_LIMITS.BUSINESS.monitors} Monitors`
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-md" 
        onClick={onClose} 
      />
      
      {/* Modal Container */}
      <div className="relative w-full max-w-5xl bg-white dark:bg-zinc-900 rounded-[40px] shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-blue-600/5 to-transparent opacity-50 pointer-events-none" />
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="h-5 w-5 text-zinc-400" />
          </button>
          
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900 dark:text-white mb-4">
            Scale Your <span className="text-blue-600">Intelligence</span>
          </h2>
          <p className="text-zinc-500 max-w-2xl mx-auto text-sm sm:text-base">
            Your current plan has reached its capacity. Choose a tier that matches your growth and unlock advanced monitoring features.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="px-6 sm:px-12 pb-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div 
              key={plan.id}
              className={cn(
                "relative group p-8 rounded-[32px] border transition-all duration-500 hover:scale-[1.02]",
                plan.popular 
                  ? "bg-blue-600 border-blue-500 shadow-2xl shadow-blue-600/20" 
                  : "bg-zinc-50 dark:bg-zinc-800/30 border-zinc-100 dark:border-zinc-800 hover:border-zinc-200 dark:hover:border-zinc-700",
                currentPlan === plan.id && "ring-2 ring-blue-600 ring-offset-4 dark:ring-offset-zinc-900"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-blue-600 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                  Most Popular
                </div>
              )}

              <div className="flex flex-col h-full">
                <div className="mb-8">
                  <div className={cn(
                    "h-12 w-12 rounded-2xl flex items-center justify-center mb-4 shadow-sm",
                    plan.popular ? "bg-white/20 text-white" : "bg-white dark:bg-zinc-800 text-blue-600"
                  )}>
                    <plan.icon className="h-6 w-6" />
                  </div>
                  <h3 className={cn("text-xl font-black mb-1", plan.popular ? "text-white" : "text-zinc-900 dark:text-white")}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className={cn("text-4xl font-black", plan.popular ? "text-white" : "text-zinc-900 dark:text-white")}>
                      {plan.price}
                    </span>
                    <span className={cn("text-sm", plan.popular ? "text-white/60" : "text-zinc-400")}>
                      /month
                    </span>
                  </div>
                </div>

                <div className="space-y-4 flex-1">
                   <div className={cn("text-xs font-bold uppercase tracking-widest opacity-60", plan.popular ? "text-white" : "text-zinc-400")}>
                      What's Included
                   </div>
                   <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                         <div className={cn("h-5 w-5 rounded-full flex items-center justify-center shrink-0", plan.popular ? "bg-white/20" : "bg-blue-600/10")}>
                            <Check className={cn("h-3 w-3", plan.popular ? "text-white" : "text-blue-600")} />
                         </div>
                         <span className={cn("text-sm font-bold", plan.popular ? "text-white" : "text-zinc-700 dark:text-zinc-300")}>{plan.limits}</span>
                      </li>
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <div className={cn("h-5 w-5 rounded-full flex items-center justify-center shrink-0", plan.popular ? "bg-white/20" : "bg-blue-600/10")}>
                            <Check className={cn("h-3 w-3", plan.popular ? "text-white" : "text-blue-600")} />
                          </div>
                          <span className={cn("text-sm font-medium", plan.popular ? "text-white/80" : "text-zinc-500 dark:text-zinc-400")}>{feature}</span>
                        </li>
                      ))}
                   </ul>
                </div>

                <Button 
                  className={cn(
                    "mt-8 w-full h-12 rounded-2xl font-bold transition-all active:scale-95",
                    plan.popular 
                      ? "bg-white text-blue-600 hover:bg-zinc-50 shadow-xl" 
                      : "bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:opacity-90"
                  )}
                  onClick={() => window.open(`https://wa.me/8801345808742?text=I'd like to upgrade to the ${plan.name} plan.`, '_blank')}
                >
                  {currentPlan === plan.id ? "Current Plan" : "Upgrade Now"}
                </Button>
              </div>
            </div>
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
                 <p className="text-xs text-zinc-500">Pay via bKash, Rocket, or Local Bank Transfer</p>
              </div>
           </div>
           <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                className="rounded-xl flex items-center gap-2"
                onClick={() => window.open('https://wa.me/8801345808742', '_blank')}
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

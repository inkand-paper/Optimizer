"use client";

import * as React from "react";
import { Card, Button, Input } from "./ui-elements";
import { Zap, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function PulseTrigger() {
  const [tag, setTag] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [method, setMethod] = React.useState<"tag" | "path">("tag");

  const handlePurge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tag) return;
    setLoading(true);
    setSuccess(false);
    
    // Simulate purge
    await new Promise((r) => setTimeout(r, 800));
    setLoading(false);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
    setTag("");
  };

  return (
    <Card className="p-8 relative overflow-hidden np-grid-bg group shadow-sm">
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-np-gold/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-np-gold/10 transition-colors duration-1000" />
      <Zap className="absolute -right-4 -bottom-4 h-48 w-48 text-np-gold/5 group-hover:text-np-gold/10 transition-colors duration-700 -rotate-12 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-ui bg-np-gold/10 flex items-center justify-center text-np-gold border border-np-gold/20">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-[18px] font-semibold tracking-tight uppercase">Pulse Command Center</h2>
              <p className="label-category text-[10px] mt-1">Manual Cache Optimization Console</p>
            </div>
          </div>

          <div className="flex gap-1 p-1 bg-muted border border-border rounded-ui w-fit">
            <button 
              type="button"
              onClick={() => setMethod("tag")}
              className={cn(
                "px-4 py-1.5 rounded-sm text-[11px] font-semibold uppercase tracking-widest transition-all",
                method === "tag" 
                  ? "bg-np-gold text-white shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              By Tag
            </button>
            <button 
              type="button"
              onClick={() => setMethod("path")}
              className={cn(
                "px-4 py-1.5 rounded-sm text-[11px] font-semibold uppercase tracking-widest transition-all",
                method === "path" 
                  ? "bg-np-gold text-white shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              By Path
            </button>
          </div>
        </div>

        <form onSubmit={handlePurge} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              value={tag}
              onChange={(e) => setTag(e.target.value)}
              placeholder={method === "tag" ? "NAMESPACE (E.G. PRODUCTS-LIST)" : "PATH (E.G. /BLOG/POST-1)"}
              className="h-12 pl-12 font-mono text-[12px] uppercase bg-card border-border shadow-sm focus:border-np-gold focus:ring-1 focus:ring-np-gold"
              required
            />
          </div>
          <Button type="submit" disabled={!tag || loading} className="h-12 px-8 uppercase tracking-widest text-[11px] shadow-sm">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Dispatch Sequence"}
          </Button>
        </form>

        {success && (
          <div className="mt-4 p-4 bg-np-teal/10 border border-np-teal/20 rounded-ui flex items-center gap-2 animate-in fade-in slide-in-from-left-4">
            <CheckCircle2 className="h-4 w-4 text-np-teal" />
            <p className="text-[11px] text-np-teal font-semibold uppercase tracking-widest">
              Optimization Sequence Deployed Successfully.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}

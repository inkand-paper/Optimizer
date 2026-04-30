import * as React from "react";
import { Card, Button, Input } from "./ui-elements";
import { Zap, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * [PRODUCTION-GRADE] - Pulse Command Center
 * Sovereign Obsidian Aesthetic
 */
export function PulseTrigger() {
  const [target, setTarget] = React.useState("");
  const [type, setType] = React.useState<"tag" | "path">("tag");
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const handlePulse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    try {
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const userEmail = user?.email || "tabir8431@gmail.com";

      const res = await fetch("/api/revalidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          [type]: target,
          secret: "nex-pulse-dev-secret-2024",
          email: userEmail 
        }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        alert("Pulse execution failed. Terminal response error.");
      }
    } catch (err) {
      alert("Error dispatching pulse sequence.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-8 bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 relative overflow-hidden group shadow-sm">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Zap className="h-32 w-32 text-blue-600" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-4 mb-8">
          <div className="h-12 w-12 rounded-md bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase tracking-tight">Pulse Command Center</h3>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Manual Cache Optimization Console</p>
          </div>
        </div>

        <form onSubmit={handlePulse} className="space-y-6">
          <div className="flex gap-1 p-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md w-fit">
            <button
              type="button"
              onClick={() => setType("tag")}
              className={cn(
                "px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all",
                type === 'tag' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              )}
            >
              By Tag
            </button>
            <button
              type="button"
              onClick={() => setType("path")}
              className={cn(
                "px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-sm transition-all",
                type === 'path' 
                  ? 'bg-blue-600 text-white shadow-sm' 
                  : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
              )}
            >
              By Path
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Input
                placeholder={type === 'tag' ? "NAMESPACE (e.g. products-list)" : "ENDPOINT (e.g. /blog/post-1)"}
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 font-black text-xs h-14 pl-12 uppercase tracking-tight"
                required
              />
              <ShieldCheck className="absolute left-4 top-5 h-4 w-4 text-zinc-400" />
            </div>
            <Button 
              type="submit" 
              disabled={loading || !target}
              className="h-14 px-10 font-black uppercase tracking-widest text-[10px] min-w-[180px] bg-zinc-900 text-white dark:bg-white dark:text-black hover:bg-blue-600 dark:hover:bg-blue-600 dark:hover:text-white transition-all shadow-xl"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : success ? <CheckCircle2 className="h-5 w-5" /> : "Dispatch Sequence"}
            </Button>
          </div>

          {success && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-md animate-in fade-in slide-in-from-left-4">
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest">
                Optimization dispatched. Infrastructure endpoint updated.
              </p>
            </div>
          )}
        </form>
      </div>
    </Card>
  );
}

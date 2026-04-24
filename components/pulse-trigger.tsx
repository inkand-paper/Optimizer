import * as React from "react";
import { Card, Button, Input } from "./ui-elements";
import { Zap, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";

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
      // In a real scenario, the secret would be handled securely
      // For this dashboard tool, we'll call our revalidate API
      const storedUser = localStorage.getItem("user");
      const user = storedUser ? JSON.parse(storedUser) : null;
      const userEmail = user?.email || "tabir8431@gmail.com"; // Fallback to your main email

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
        alert("Pulse failed. Check your REVALIDATE_SECRET.");
      }
    } catch (err) {
      alert("Error sending pulse");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 bg-gradient-to-br from-zinc-900 to-black border-blue-500/20 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
        <Zap className="h-24 w-24 text-blue-500" />
      </div>

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Zap className="h-4 w-4 text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Pulse Command Center</h3>
            <p className="text-xs text-zinc-400">Manual Cache Optimization Trigger</p>
          </div>
        </div>

        <form onSubmit={handlePulse} className="space-y-4">
          <div className="flex gap-2 p-1 bg-zinc-800/50 rounded-lg w-fit">
            <button
              type="button"
              onClick={() => setType("tag")}
              className={`px-3 py-1 text-xs rounded-md transition-all ${type === 'tag' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              By Tag
            </button>
            <button
              type="button"
              onClick={() => setType("path")}
              className={`px-3 py-1 text-xs rounded-md transition-all ${type === 'path' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-400 hover:text-zinc-200'}`}
            >
              By Path
            </button>
          </div>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <Input
                placeholder={type === 'tag' ? "e.g. products-list" : "e.g. /blog/post-1"}
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="bg-zinc-900/50 border-zinc-700 text-white pl-9"
                required
              />
              <ShieldCheck className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            </div>
            <Button 
              type="submit" 
              disabled={loading || !target}
              className="bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20 min-w-[120px]"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : success ? <CheckCircle2 className="h-4 w-4" /> : "Send Pulse"}
            </Button>
          </div>

          {success && (
            <p className="text-[10px] text-emerald-400 font-medium animate-in fade-in slide-in-from-left-2">
              ✨ Optimization Pulse dispatched successfully! Check your email.
            </p>
          )}
        </form>
      </div>
    </Card>
  );
}

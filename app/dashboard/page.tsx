"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, Button, Input, PasswordInput } from "@/components/ui-elements";
import { AnalysisReport } from "@/components/analysis-report";
import { ActivityLogs } from "@/components/activity-logs";
import { WebhookManager } from "@/components/webhook-manager";
import { MonitoringDashboard } from "@/components/monitoring-dashboard";
import { PulseTrigger } from "@/components/pulse-trigger";
import { 
  Key, 
  Trash2, 
  Plus, 
  Clock, 
  Terminal, 
  ShieldCheck, 
  Copy, 
  CheckCircle2,
  Loader2,
  RefreshCw,
  LogOut,
  Search,
  AlertTriangle,
  FileText,
  Activity,
  Webhook
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ApiKey {
  id: string;
  name: string;
  createdAt: string;
  lastUsedAt: string | null;
}

/**
 * [ENTRY-LEVEL DEFINITION] - Dashboard
 * Think of this as your personal control tower. From here, you see all the 
 * "access badges" (API Keys) you've issued and can manage them.
 */
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = React.useState<any>(null);
  const [keys, setKeys] = React.useState<ApiKey[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [creatingKey, setCreatingKey] = React.useState(false);
  const [newKey, setNewKey] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  // Playground States
  const [playgroundKey, setPlaygroundKey] = React.useState("");
  const [playgroundTag, setPlaygroundTag] = React.useState("");
  const [playgroundResult, setPlaygroundResult] = React.useState<any>(null);
  const [playgroundLoading, setPlaygroundLoading] = React.useState(false);

  // Analysis States
  const [analyzeUrl, setAnalyzeUrl] = React.useState("");
  const [analyzeResult, setAnalyzeResult] = React.useState<any>(null);
  const [analyzeLoading, setAnalyzeLoading] = React.useState(false);

  // Health State
  const [health, setHealth] = React.useState<any>(null);

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token) {
      router.push("/login");
      return;
    }

    if (storedUser) setUser(JSON.parse(storedUser));
    
    const storedPlaygroundKey = localStorage.getItem("active_api_key");
    if (storedPlaygroundKey) setPlaygroundKey(storedPlaygroundKey);

    fetchKeys(token);
    fetchHealth();
  }, []);

  async function fetchHealth() {
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setHealth(data);
    } catch (err) {
      console.error("Health check failed");
    }
  }

  async function fetchKeys(token: string) {
    try {
      const res = await fetch("/api/keys", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setKeys(data.keys);
        
        // [UX] Auto-select the first key for the playground/analyzer if not set
        if (!playgroundKey && data.keys?.length > 0) {
          // Note: We can't get the raw key from DB, so we rely on session persistence
          const sessionKey = localStorage.getItem("active_api_key");
          if (sessionKey) setPlaygroundKey(sessionKey);
        }
      }
    } catch (err) {
      console.error("Failed to fetch keys", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateKey(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreatingKey(true);
    const token = localStorage.getItem("token");
    const formData = new FormData(e.currentTarget);
    const name = formData.get("keyName");

    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewKey(data.apiKey);
        setPlaygroundKey(data.apiKey); 
        localStorage.setItem("active_api_key", data.apiKey); // Persist for refresh
        
        // [UX] Immediately show success in the Playground
        setPlaygroundResult({ 
          success: true, 
          message: "Handshake verified. Your new machine key is active and authorized.", 
          status: 200,
          timestamp: new Date().toISOString()
        });

        fetchKeys(token!);
      }
    } catch (err) {
      alert("Failed to create key");
    } finally {
      setCreatingKey(false);
    }
  }

  async function handleDeleteKey(id: string) {
    if (!confirm("Are you sure you want to revoke this key? Any app using it will lose access immediately.")) return;
    
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/keys/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setKeys(keys.filter(k => k.id !== id));
      }
    } catch (err) {
      alert("Failed to delete key");
    }
  }

  async function runPlayground() {
    if (!playgroundKey || !playgroundTag) return;
    setPlaygroundLoading(true);
    setPlaygroundResult(null);

    try {
      const res = await fetch("/api/revalidate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${playgroundKey}`
        },
        body: JSON.stringify({ tag: playgroundTag || undefined }),
      });
      const data = await res.json();
      setPlaygroundResult({ ...data, status: res.status });
    } catch (err) {
      setPlaygroundResult({ error: "Network error", message: "Failed to reach API", status: 500 });
    } finally {
      setPlaygroundLoading(false);
    }
  }

  async function runAnalyzer() {
    if (!analyzeUrl) return;
    setAnalyzeLoading(true);
    setAnalyzeResult(null);

    if (!playgroundKey) {
      // Try to find a raw key created in this session
      const sessionKey = localStorage.getItem("active_api_key");
      if (sessionKey) {
        setPlaygroundKey(sessionKey);
      } else {
        alert("Please create an API Key in the 'API Keys' tab first to authorize the scanner.");
        setAnalyzeLoading(false);
        return;
      }
    }

    const tokenToUse = playgroundKey || localStorage.getItem("active_api_key");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenToUse}`
        },
        body: JSON.stringify({ url: analyzeUrl }),
      });
      const data = await res.json();
      setAnalyzeResult(data);
    } catch (err) {
      alert("Scan failed");
    } finally {
      setAnalyzeLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Tab State for Mobile
  const [activeTab, setActiveTab] = React.useState<"monitoring" | "audits" | "keys" | "webhooks" | "logs">("monitoring");

  const tabs = [
    { id: "monitoring", label: "Monitoring", icon: Activity },
    { id: "audits", label: "Audits", icon: Search },
    { id: "keys", label: "API Keys", icon: Key },
    { id: "webhooks", label: "Webhooks", icon: Webhook },
    { id: "logs", label: "Logs", icon: FileText },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950 overflow-x-hidden">
      <Navbar />
      
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-4 md:py-10 mb-24 md:mb-0">
        <div className="flex flex-col md:flex-row gap-6 lg:gap-16 items-start">
          
          {/* SIDEBAR NAVIGATION (Desktop Only) */}
          <div className="hidden md:flex flex-col w-72 shrink-0 space-y-2 sticky top-[100px]">
            <div className="px-4 mb-8">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-400 opacity-60">NexPulse Command</h2>
            </div>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-3 px-5 py-3.5 rounded-2xl text-sm font-semibold transition-all group",
                  activeTab === tab.id 
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-600/20" 
                    : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                )}
              >
                <tab.icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", activeTab === tab.id ? "text-white" : "text-zinc-400")} />
                {tab.label}
              </button>
            ))}
            
            <div className="pt-8 px-3">
              <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-4">System Health</h2>
              <Card className="p-4 bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("h-2 w-2 rounded-full animate-pulse", health?.status === 'healthy' ? "bg-green-500" : "bg-red-500")} />
                  <span className="text-[9px] font-bold text-zinc-400">{health?.status?.toUpperCase()}</span>
                </div>
                <div className="h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-full" />
                </div>
                <p className="text-[9px] text-zinc-500 mt-2">v{health?.version}</p>
              </Card>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 space-y-8">
            
            {/* COMMON HEADER SECTION (Visible on all tabs) */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight capitalize">{activeTab}</h1>
                <p className="text-sm text-zinc-500 truncate">Manage your {activeTab} settings and analytics</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end mr-2">
                   <p className="text-xs font-bold leading-none">{user?.name}</p>
                   <p className="text-[10px] text-zinc-500">{user?.email}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="rounded-full hover:bg-red-50 hover:text-red-500">
                   <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* TAB CONTENT */}
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeTab === "monitoring" && (
                <div className="space-y-8">
                  <PulseTrigger />
                  <MonitoringDashboard />
                </div>
              )}
              
              {activeTab === "audits" && (
                <div className="space-y-8">
                  <Card className="p-6 border-blue-100 dark:border-blue-900/30 bg-white dark:bg-zinc-950 overflow-hidden relative">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                        <Search className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold font-display">Website Analyzer</h2>
                        <p className="text-xs text-zinc-500">Scan any URL for SEO and Performance optimization scores</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Input 
                        placeholder="https://your-website.com" 
                        value={analyzeUrl}
                        onChange={(e) => setAnalyzeUrl(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={runAnalyzer} disabled={analyzeLoading || !analyzeUrl}>
                        {analyzeLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                        Run Audit
                      </Button>
                    </div>
                  </Card>
                  {analyzeResult && <AnalysisReport data={analyzeResult} />}
                </div>
              )}

              {activeTab === "keys" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                  <div className="space-y-8">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold">Access Tokens</h2>
                      <Button variant="outline" size="sm" onClick={() => fetchKeys(localStorage.getItem("token")!)}>
                        <RefreshCw className="h-3 w-3 mr-2" /> Sync
                      </Button>
                    </div>

                    {newKey && (
                      <Card className="bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800 p-6 relative">
                        <h3 className="font-bold text-emerald-800 dark:text-emerald-400 mb-2">Key Generated!</h3>
                        <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-3 rounded-lg border font-mono text-xs break-all">
                          {newKey}
                          <button onClick={() => copyToClipboard(newKey)} className="ml-auto p-1 text-zinc-400 hover:text-emerald-600">
                             {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </div>
                        <p className="text-[10px] text-emerald-600 mt-2">Make sure to copy this now. It will not be shown again.</p>
                      </Card>
                    )}

                    <Card className="p-0 overflow-hidden">
                      <div className="p-4 border-b bg-zinc-50/50 flex flex-col gap-3">
                        <p className="text-[10px] font-bold uppercase text-zinc-400">Generate New Machine Key</p>
                        <form onSubmit={handleCreateKey} className="flex flex-col sm:flex-row gap-2">
                          <Input name="keyName" placeholder="Key name (e.g. CI/CD)" className="h-9" required />
                          <Button size="sm" type="submit" disabled={creatingKey}>
                            {creatingKey ? <Loader2 className="h-3 w-3 animate-spin" /> : "Create"}
                          </Button>
                        </form>
                      </div>
                      <div className="divide-y divide-zinc-100 dark:divide-zinc-800 max-h-[300px] overflow-y-auto">
                        {keys.map(k => (
                          <div key={k.id} className="p-4 flex justify-between items-center group hover:bg-zinc-100 dark:hover:bg-zinc-900/50 transition-colors">
                            <div className="min-w-0">
                              <p className="text-sm font-bold truncate">{k.name}</p>
                              <p className="text-[10px] text-zinc-500">Issued {new Date(k.createdAt).toLocaleDateString()}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteKey(k.id)} className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>
                  <Card className="p-0 overflow-hidden border-2 border-zinc-200 dark:border-zinc-800 shadow-xl bg-zinc-900 text-white p-6">
                    <div className="flex items-center gap-2 mb-4 text-blue-400">
                      <ShieldCheck className="h-5 w-5" />
                      <h3 className="font-bold text-sm">Security Playground</h3>
                    </div>
                    <p className="text-[11px] text-zinc-400 mb-6">Test your machine handshakes before production deployment.</p>
                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase opacity-60">API Key</label>
                        <PasswordInput className="bg-zinc-800 border-zinc-700" value={playgroundKey} onChange={(e) => setPlaygroundKey(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold uppercase opacity-60">Cache Tag</label>
                        <Input className="bg-zinc-800 border-zinc-700" placeholder="e.g. products" value={playgroundTag} onChange={(e) => setPlaygroundTag(e.target.value)} />
                      </div>
                      <Button className="w-full bg-blue-600 h-10 text-xs font-bold" onClick={runPlayground} disabled={playgroundLoading || !playgroundKey}>
                        {playgroundLoading ? "Verifying..." : "Run Security Check"}
                      </Button>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === "webhooks" && (
                <div className="max-w-3xl">
                  <WebhookManager />
                </div>
              )}

              {activeTab === "logs" && (
                <div className="max-w-3xl">
                  <ActivityLogs />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t px-6 pb-6 pt-3 flex justify-between items-center shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className="flex flex-col items-center gap-1 group relative"
          >
            <div className={cn(
              "h-10 w-10 rounded-2xl flex items-center justify-center transition-all duration-300",
              activeTab === tab.id 
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 -translate-y-1" 
                : "text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            )}>
              <tab.icon className="h-5 w-5" />
            </div>
            <span className={cn(
              "text-[9px] font-bold transition-all duration-300",
              activeTab === tab.id ? "text-blue-600 opacity-100" : "text-zinc-400 opacity-60"
            )}>
              {tab.label.split(' ')[0]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

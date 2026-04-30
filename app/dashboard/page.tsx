"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Card, Button, Input, PasswordInput } from "@/components/ui-elements";
import { AnalysisReport } from "@/components/analysis-report";
import { ActivityLogs } from "@/components/activity-logs";
import { WebhookManager } from "@/components/webhook-manager";
import { MonitoringDashboard } from "@/components/monitoring-dashboard";
import { PulseTrigger } from "@/components/pulse-trigger";
import { PricingModal } from "@/components/pricing-modal";
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
  Webhook,
  ShieldAlert,
  BarChart4
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
  const [showPricing, setShowPricing] = React.useState(false);
  const [currentUserPlan, setCurrentUserPlan] = React.useState("FREE");

  // Analysis States
  const [analyzeUrl, setAnalyzeUrl] = React.useState("");
  const [analyzeResult, setAnalyzeResult] = React.useState<any>(null);
  const [analyzeLoading, setAnalyzeLoading] = React.useState(false);

  // Health State
  const [health, setHealth] = React.useState<any>(null);

  React.useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
    
    // [SYNC] Fetch fresh user data from server (reads the HttpOnly cookie securely)
    fetch("/api/auth/me", { credentials: 'include' })
      .then(res => {
        if (!res.ok) { router.push("/login"); return null; }
        return res.json();
      })
      .then(data => {
        if (data?.success && data.user) {
          setUser(data.user);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
      })
      .catch(() => router.push("/login"));

    const storedPlaygroundKey = localStorage.getItem("active_api_key");
    if (storedPlaygroundKey) setPlaygroundKey(storedPlaygroundKey);

    fetchKeys();
    fetchHealth();
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.plan) setCurrentUserPlan(u.plan);
      } catch (e) {}
    }

    const handleOpenPricing = () => setShowPricing(true);
    window.addEventListener('open-pricing', handleOpenPricing);
    return () => window.removeEventListener('open-pricing', handleOpenPricing);
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

  async function fetchKeys() {
    try {
      const res = await fetch("/api/keys", { credentials: 'include' });
      const data = await res.json();
      if (res.ok) {
        setKeys(data.keys);
        
        // Auto-select the first key for the playground/analyzer if not set
        if (!playgroundKey && data.keys?.length > 0) {
          const sessionKey = localStorage.getItem("active_api_key");
          if (sessionKey) setPlaygroundKey(sessionKey);
        }
      }
    } catch (err) {
      console.error("Failed to fetch keys", err);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateKey(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreatingKey(true);
    const formData = new FormData(e.currentTarget);
    const name = formData.get("keyName");

    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewKey(data.apiKey);
        setPlaygroundKey(data.apiKey); 
        localStorage.setItem("active_api_key", data.apiKey);
        
        setPlaygroundResult({ 
          success: true, 
          message: "Handshake verified. Your new machine key is active and authorized.", 
          status: 200,
          timestamp: new Date().toISOString()
        });

        fetchKeys();
      } else if (res.status === 403) {
        if (user?.role === 'ADMIN') {
          alert(data.message || "Admin access error");
        } else {
          setShowPricing(true);
        }
      } else {
        alert(data.message || "Failed to create key");
      }
    } catch (err) {
      alert("Failed to create key");
    } finally {
      setCreatingKey(false);
    }
  }

  async function handleDeleteKey(id: string) {
    if (!confirm("Are you sure you want to revoke this key? Any app using it will lose access immediately.")) return;
    
    try {
      const res = await fetch(`/api/keys/${id}`, {
        method: "DELETE",
        credentials: 'include'
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

  if (user && !user.emailVerified) {
    return (
      <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6 py-12">
          <Card className="w-full max-w-md p-8 text-center border-rose-100 dark:border-rose-900/30">
            <div className="h-16 w-16 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center mx-auto mb-6">
              <ShieldAlert className="h-8 w-8 text-rose-600" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
              Verify your email
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm mb-8 leading-relaxed">
              Your account is currently limited. Please check your email inbox and click the verification link to unlock the NexPulse dashboard.
            </p>
            <div className="space-y-3">
              <Button onClick={() => window.location.reload()} className="w-full">
                 I&apos;ve verified my email
              </Button>
              <Button variant="ghost" onClick={handleLogout} className="w-full text-zinc-500">
                 Logout
              </Button>
            </div>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-black overflow-x-hidden">
      <Navbar />
      
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-10 mb-24 md:mb-0">
        <div className="flex flex-col md:flex-row gap-6 lg:gap-16 items-stretch md:items-start">
          
          {/* SIDEBAR NAVIGATION (Desktop Only) */}
          <div className="hidden md:flex flex-col w-72 shrink-0 space-y-1 sticky top-[100px]">
            <div className="px-4 mb-6">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 opacity-60">NexPulse Command</h2>
            </div>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={cn(
                  "flex items-center gap-3 px-5 py-3 rounded-md text-sm font-black uppercase tracking-widest transition-all group",
                  activeTab === tab.id 
                    ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 shadow-sm" 
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-900/50"
                )}
              >
                <tab.icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", activeTab === tab.id ? "text-blue-600" : "text-zinc-400")} />
                {tab.label}
              </button>
            ))}
            
            <div className="pt-8 px-4">
              <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4">System Health</h2>
              <div className="p-4 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                <div className="flex items-center justify-between mb-3">
                  <div className={cn("h-2 w-2 rounded-full animate-pulse", health?.status === 'healthy' ? "bg-green-500" : "bg-red-500")} />
                  <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{health?.status || 'OFFLINE'}</span>
                </div>
                <div className="h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-full" />
                </div>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-[9px] text-zinc-500 font-black">v{health?.version || '1.0.0'}</p>
                  {user?.role === 'ADMIN' && (
                    <Link href="/dashboard/admin" className="text-blue-600 hover:text-blue-500 transition-colors">
                      <ShieldAlert className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 space-y-10">
            
            {/* COMMON HEADER SECTION */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-100 dark:border-zinc-900 pb-8">
              <div className="min-w-0">
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">{activeTab}</h1>
                <p className="text-xs text-zinc-500 font-black uppercase tracking-[0.2em] mt-2">Manage infrastructure and global analytics</p>
              </div>
              <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-950 p-2 rounded-md border border-zinc-200 dark:border-zinc-800">
                <div className="flex flex-col items-end mr-4 pl-2">
                   <div className="flex items-center gap-2">
                     <p className="text-xs font-black uppercase tracking-tight">{user?.name}</p>
                     <span className={cn(
                       "text-[8px] px-2 py-0.5 rounded-sm font-black uppercase tracking-widest",
                       user?.role === 'ADMIN' ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" :
                       user?.plan === 'FREE' ? "bg-zinc-100 text-zinc-500" : 
                       "bg-blue-600 text-white"
                     )}>
                       {user?.role === 'ADMIN' ? 'ADMIN' : (user?.plan || 'FREE')}
                     </span>
                   </div>
                   <p className="text-[9px] text-zinc-400 font-bold tracking-tight">{user?.email}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} className="h-10 w-10 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20">
                   <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* TAB CONTENT */}
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {activeTab === "monitoring" && (
                <div className="space-y-10">
                  <PulseTrigger />
                  <MonitoringDashboard />
                </div>
              )}
              
              {activeTab === "audits" && (
                <div className="space-y-10">
                  <Card className="p-8 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Search className="h-32 w-32 text-blue-600" />
                    </div>
                    <div className="flex items-center gap-4 mb-8 relative z-10">
                      <div className="h-12 w-12 rounded-md bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-500/20">
                        <Search className="h-6 w-6" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black uppercase tracking-tight">Website Analyzer</h2>
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">SEO & Infrastructure Audit Engine</p>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 relative z-10">
                      <Input 
                        placeholder="https://infrastructure-target.com" 
                        value={analyzeUrl}
                        onChange={(e) => setAnalyzeUrl(e.target.value)}
                        className="flex-1 h-14 bg-zinc-50 dark:bg-zinc-950 font-bold"
                      />
                      <Button onClick={runAnalyzer} disabled={analyzeLoading || !analyzeUrl} className="h-14 px-8 font-black uppercase tracking-widest text-xs">
                        {analyzeLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                        Execute Audit
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
                      <h2 className="text-xl font-black uppercase tracking-tight">Access Control</h2>
                      <Button variant="outline" size="sm" onClick={() => fetchKeys()} className="font-black uppercase tracking-widest text-[10px]">
                        <RefreshCw className="h-3 w-3 mr-2" /> Sync Tokens
                      </Button>
                    </div>

                    {newKey && (
                      <Card className="bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 p-8 relative">
                        <div className="flex items-center gap-2 mb-4">
                          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                          <h3 className="font-black text-xs uppercase tracking-widest text-emerald-800 dark:text-emerald-400">Token Generated</h3>
                        </div>
                        <div className="flex items-center gap-2 bg-white dark:bg-black p-4 rounded-md border border-emerald-200 dark:border-emerald-800 font-mono text-xs break-all font-black">
                          {newKey}
                          <button onClick={() => copyToClipboard(newKey)} className="ml-auto p-2 text-zinc-400 hover:text-emerald-600 transition-colors">
                             {copied ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5" />}
                          </button>
                        </div>
                        <p className="text-[10px] text-emerald-600 mt-4 font-bold uppercase tracking-widest">Store this securely. It will not be shown again.</p>
                      </Card>
                    )}

                    <Card className="p-0 overflow-hidden bg-white dark:bg-black border-zinc-200 dark:border-zinc-800">
                      <div className="p-6 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/50">
                        <p className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] mb-4">Provision New Machine Key</p>
                        <form onSubmit={handleCreateKey} className="flex flex-col sm:flex-row gap-3">
                          <Input name="keyName" placeholder="Endpoint Identifier" className="h-12 bg-white dark:bg-black font-bold" required />
                          <Button type="submit" disabled={creatingKey} className="h-12 px-6 font-black uppercase tracking-widest text-[10px]">
                            {creatingKey ? <Loader2 className="h-3 w-3 animate-spin" /> : "Deploy Key"}
                          </Button>
                        </form>
                      </div>
                      <div className="divide-y divide-zinc-100 dark:divide-zinc-900 max-h-[400px] overflow-y-auto">
                        {keys.map(k => (
                          <div key={k.id} className="p-5 flex justify-between items-center group hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                            <div className="min-w-0">
                              <p className="text-sm font-black uppercase tracking-tight truncate">{k.name}</p>
                              <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-1">Issued {new Date(k.createdAt).toLocaleDateString()}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => handleDeleteKey(k.id)} className="opacity-0 group-hover:opacity-100 text-zinc-400 hover:text-red-500 transition-all">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </Card>
                  </div>

                  <Card className="p-8 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black shadow-2xl relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      <ShieldCheck className="h-32 w-32 text-blue-600" />
                    </div>
                    <div className="flex items-center gap-3 mb-8 relative z-10">
                      <div className="h-10 w-10 rounded-md bg-zinc-900 dark:bg-zinc-50 flex items-center justify-center text-white dark:text-zinc-900 shadow-xl">
                        <Terminal className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="font-black text-xl uppercase tracking-tight">Security Playground</h3>
                        <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">Simulate Machine Handshakes</p>
                      </div>
                    </div>
                    <div className="space-y-6 relative z-10">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Authorized Key</label>
                        <PasswordInput className="h-12 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 font-bold" value={playgroundKey} onChange={(e) => setPlaygroundKey(e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Namespace / Tag</label>
                        <Input className="h-12 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 font-bold" placeholder="e.g. products-v2" value={playgroundTag} onChange={(e) => setPlaygroundTag(e.target.value)} />
                      </div>
                      <Button className="w-full h-14 font-black uppercase tracking-[0.2em] text-xs" onClick={runPlayground} disabled={playgroundLoading || !playgroundKey}>
                        {playgroundLoading ? "Authenticating..." : "Execute Security Check"}
                      </Button>
                    </div>
                  </Card>
                </div>
              )}

              {activeTab === "webhooks" && (
                <div className="max-w-4xl">
                  <WebhookManager onLimitReached={() => setShowPricing(true)} />
                </div>
              )}

              {activeTab === "logs" && (
                <div className="max-w-4xl">
                  <ActivityLogs />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-black/95 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-6 pb-6 pt-3 flex justify-between items-center shadow-2xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className="flex flex-col items-center gap-1 group relative"
          >
            <div className={cn(
              "h-12 w-12 rounded-md flex items-center justify-center transition-all duration-300",
              activeTab === tab.id 
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xl" 
                : "text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900"
            )}>
              <tab.icon className={cn("h-5 w-5", activeTab === tab.id && "text-blue-500")} />
            </div>
            <span className={cn(
              "text-[9px] font-black uppercase tracking-widest transition-all duration-300",
              activeTab === tab.id ? "text-zinc-900 dark:text-white" : "text-zinc-400"
            )}>
              {tab.label.split(' ')[0]}
            </span>
          </button>
        ))}
      </div>

      <PricingModal 
        isOpen={showPricing} 
        onClose={() => setShowPricing(false)} 
        currentPlan={currentUserPlan} 
      />
    </div>
  );
}

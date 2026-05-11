"use client";

import { signOut } from "next-auth/react";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, Button, Input, PasswordInput, StatusDot } from "@/components/ui-elements";
import { AnalysisReport } from "@/components/analysis-report";
import { ActivityLogs } from "@/components/activity-logs";
import { WebhookManager } from "@/components/webhook-manager";
import { useSearchParams } from "next/navigation";
import { MonitoringDashboard } from "@/components/monitoring-dashboard";
import { CodeAuditConsole } from "@/components/code-audit-console";
import { PricingModal } from "@/components/pricing-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import type { AnalyzeResponse } from "@/lib/types";


import {
  Activity, Key, Plus, Terminal, ShieldCheck, Copy,
  CheckCircle2, Loader2, RefreshCw, LogOut, Search, FileText,
  Webhook, ShieldAlert, Book, Home, User,
  Menu, X, HelpCircle
} from "lucide-react";

interface ApiKey { id: string; name: string; createdAt: string; lastUsedAt: string | null; }
interface UserProfile { id?: string; name?: string; email?: string; role?: string; plan?: string; emailVerified?: boolean; }

type Tab = "monitoring" | "seo" | "audits" | "keys" | "webhooks" | "logs";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "monitoring", label: "Monitoring",   icon: Activity  },
  { id: "seo",        label: "SEO Analyzer", icon: Search    },
  { id: "audits",     label: "Code Audit",   icon: ShieldCheck },
  { id: "keys",       label: "API Keys",     icon: Key       },
  { id: "webhooks",   label: "Webhooks",     icon: Webhook   },
  { id: "logs",       label: "Logs",         icon: FileText  },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser]           = React.useState<UserProfile | null>(null);
  const [keys, setKeys]           = React.useState<ApiKey[]>([]);
  const [loading, setLoading]     = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<Tab>("monitoring");
  const [health, setHealth]       = React.useState<{ status?: string } | null>(null);
  const searchParams = useSearchParams();
  const [currentUserPlan, setCurrentUserPlan] = React.useState("FREE");
  const [authLoading, setAuthLoading] = React.useState(true);
  const [showPricing, setShowPricing] = React.useState(false);

  React.useEffect(() => {
    const tabParam = searchParams.get("tab") as Tab;
    if (tabParam && TABS.some(t => t.id === tabParam) && tabParam !== activeTab) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab(tabParam);
    }
  }, [searchParams, activeTab]);

  // Key creation
  const [creatingKey, setCreatingKey] = React.useState(false);
  const [newKey, setNewKey]           = React.useState<string | null>(null);
  const [copied, setCopied]           = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Playground
  const [playgroundKey, setPlaygroundKey] = React.useState("");
  const [playgroundTag, setPlaygroundTag] = React.useState("");
  const [playgroundResult, setPlaygroundResult] = React.useState<Record<string, unknown> | null>(null);
  const [playgroundLoading, setPlaygroundLoading] = React.useState(false);

  // Analyzer
  const [analyzeUrl, setAnalyzeUrl]       = React.useState("");
  const [analyzeResult, setAnalyzeResult] = React.useState<AnalyzeResponse | null>(null);
  const [analyzeLoading, setAnalyzeLoading] = React.useState(false);

  React.useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setUser(u);
        setCurrentUserPlan(u.plan || "FREE");
      } catch {}
    }

    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => { 
        if (!r.ok) { 
          if (!storedUser) router.push("/login"); 
          setAuthLoading(false);
          return null; 
        } 
        return r.json(); 
      })
      .then((d) => { 
        if (d?.success) { 
          setUser(d.user); 
          setCurrentUserPlan(d.user.plan || "FREE"); 
          localStorage.setItem("user", JSON.stringify(d.user)); 
        }
        setAuthLoading(false);
      })
      .catch(() => { 
        if (!localStorage.getItem("user")) router.push("/login");
        setAuthLoading(false);
      });

    const sk = localStorage.getItem("active_api_key");
    if (sk) setPlaygroundKey(sk);

    fetchKeys();
    fetchHealth();

    const onPricing = () => setShowPricing(true);
    window.addEventListener("open-pricing", onPricing);
    return () => window.removeEventListener("open-pricing", onPricing);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchHealth() {
    try { const r = await fetch("/api/health"); setHealth(await r.json()); } catch {}
  }

  async function fetchKeys() {
    try {
      const r = await fetch("/api/keys", { credentials: "include" });
      const d = await r.json();
      if (r.ok) setKeys(d.keys);
    } catch { router.push("/login"); }
    finally { setLoading(false); }
  }

  async function handleCreateKey(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreatingKey(true);
    const name = new FormData(e.currentTarget).get("keyName");
    try {
      const r = await fetch("/api/keys", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ name }) });
      const d = await r.json();
      if (r.ok) { setNewKey(d.apiKey); setPlaygroundKey(d.apiKey); localStorage.setItem("active_api_key", d.apiKey); fetchKeys(); }
      else if (r.status === 403) { if (user?.role !== "ADMIN") setShowPricing(true); }
      else alert(d.message || "Failed");
    } catch { alert("Failed to create key"); }
    finally { setCreatingKey(false); }
  }

  async function handleDeleteKey(id: string) {
    if (!confirm("Revoke this key? Apps using it will lose access immediately.")) return;
    try {
      const r = await fetch(`/api/keys/${id}`, { method: "DELETE", credentials: "include" });
      if (r.ok) setKeys(keys.filter((k) => k.id !== id));
    } catch { alert("Failed to delete key"); }
  }

  async function runPlayground() {
    if (!playgroundKey || !playgroundTag) return;
    setPlaygroundLoading(true); setPlaygroundResult(null);
    try {
      const r = await fetch("/api/revalidate", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${playgroundKey}` }, body: JSON.stringify({ tag: playgroundTag }) });
      setPlaygroundResult({ ...(await r.json()), status: r.status });
    } catch { setPlaygroundResult({ error: "Network error", status: 500 }); }
    finally { setPlaygroundLoading(false); }
  }

  async function runAnalyzer() {
    if (!analyzeUrl) return;
    const token = playgroundKey || localStorage.getItem("active_api_key");
    if (!token) { alert("Create an API key first."); return; }
    setAnalyzeLoading(true); setAnalyzeResult(null);
    try {
      const r = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ url: analyzeUrl }) });
      setAnalyzeResult(await r.json());
    } catch { alert("Scan failed"); }
    finally { setAnalyzeLoading(false); }
  }

  async function handleLogout() {
    localStorage.removeItem("user");
    // Clear custom JWT cookie
    try { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }); } catch {}
    // Clear NextAuth OAuth session (Google / GitHub)
    await signOut({ redirect: false });
    router.push("/login");
  }

  const copyKey = (t: string) => { navigator.clipboard.writeText(t); setCopied(true); setTimeout(() => setCopied(false), 2000); };

  if (loading || authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-6 w-6 animate-spin text-np-gold" />
    </div>
  );

  if (user && !user.emailVerified) return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm p-8 text-center animate-in fade-in zoom-in-95 duration-300">
        <ShieldAlert className="h-8 w-8 text-np-crimson mx-auto mb-4" />
        <h1 className="text-lg font-semibold mb-2">Verify your email</h1>
        <p className="text-[13px] text-muted-foreground mb-6">Check your inbox and click the activation link to unlock the dashboard.</p>
        <Button onClick={() => window.location.reload()} className="w-full">I&apos;ve verified</Button>
        <Button variant="ghost" onClick={handleLogout} className="w-full mt-2 text-muted-foreground">Logout</Button>
      </Card>
    </div>
  );
  /* ──────────── MAIN LAYOUT ──────────── */
  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Sidebar ────────────────────────────── */}
      <aside
        className="hidden md:flex flex-col w-56 shrink-0 sticky top-0 h-screen overflow-y-auto"
        style={{ borderRight: "0.5px solid var(--border)" }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 px-5 h-14 shrink-0" style={{ borderBottom: "0.5px solid var(--border)" }}>
          <Activity className="h-4 w-4 text-np-gold" />
          <span className="text-[14px] font-semibold">NexPulse</span>
        </Link>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-2 space-y-0.5">
          <p className="label-category px-3 py-2">Workspace</p>
          {TABS.map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-[13px] font-medium transition-all",
                  active
                    ? "np-sidebar-active"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <t.icon className="h-4 w-4 shrink-0" />
                {t.label}
              </button>
            );
          })}
          {user?.role === 'ADMIN' && (
            <>
              <div className="pt-4 pb-1">
                <p className="label-category px-3">System</p>
              </div>
              <Link
                href="/dashboard/admin"
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-[13px] font-medium text-np-gold hover:bg-np-gold/10 transition-all"
              >
                <ShieldCheck className="h-4 w-4 shrink-0" />
                Admin Panel
              </Link>
            </>
          )}

          <div className="pt-4 pb-1">
            <p className="label-category px-3">Resources</p>
          </div>
          <Link
            href="/docs"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <Book className="h-4 w-4 shrink-0" />
            Documentation
          </Link>
          <Link
            href="/faq"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <HelpCircle className="h-4 w-4 shrink-0" />
            FAQ
          </Link>
          <Link
            href="/dashboard/profile"
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[6px] text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
          >
            <User className="h-4 w-4 shrink-0" />
            Profile Settings
          </Link>
        </nav>

        {/* Health widget */}
        <div className="p-3" style={{ borderTop: "0.5px solid var(--border)" }}>
          <div className="np-card p-3 flex items-center gap-3">
            <StatusDot status={health?.status === "healthy" ? "healthy" : "error"} />
            <div className="min-w-0">
              <p className="text-[12px] font-medium truncate">{health?.status || "Offline"}</p>
              <p className="label-category text-[10px]">Infrastructure</p>
            </div>
          </div>
          {/* User */}
          <div className="mt-2 flex items-center justify-between px-1">
            <div className="min-w-0">
              <p className="text-[12px] font-medium truncate">{user?.name}</p>
              <p className="label-category text-[10px] truncate">{user?.plan || "FREE"}</p>
            </div>
            <div className="flex items-center gap-0.5">
              <ThemeToggle />
              <button onClick={handleLogout} className="p-1.5 rounded-ui text-np-slate hover:text-np-crimson transition-colors" title="Logout">
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main content ───────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header
          className="h-14 flex items-center justify-between px-4 sm:px-6 shrink-0 relative z-[60]"
          style={{ borderBottom: "0.5px solid var(--border)" }}
        >
          <div className="flex items-center gap-3">
            <Link href="/" className="md:hidden flex items-center justify-center p-1.5 rounded-ui bg-np-gold/10 text-np-gold">
              <Home className="h-4 w-4" />
            </Link>
            <div>
              <h1 className="text-[15px] font-semibold capitalize">{activeTab === "monitoring" ? "Command Center" : activeTab}</h1>
              <p className="label-category text-[10px] hidden sm:block">NexPulse Dashboard</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="mono-gold text-[11px] hidden sm:block">{user?.email}</span>
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-ui text-np-slate hover:text-foreground transition-colors"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
            <button onClick={handleLogout} className="hidden md:block p-2 rounded-ui text-np-slate hover:text-np-crimson transition-colors" title="Logout">
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          {/* Mobile Drawer Overlay */}
          {mobileMenuOpen && (
            <>
              <div className="md:hidden fixed inset-0 z-[100] bg-background/40 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
              <div 
                className="md:hidden fixed top-0 right-0 bottom-0 w-[280px] z-[110] bg-background border-l border-border shadow-2xl p-6 flex flex-col animate-in slide-in-from-right duration-300"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-np-gold" />
                    <span className="text-[14px] font-semibold">Workspace</span>
                  </div>
                  <button onClick={() => setMobileMenuOpen(false)} className="p-2 -mr-2 rounded-ui hover:bg-muted transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 space-y-6 overflow-y-auto np-scroll -mx-2 px-2">
                  <div className="space-y-1">
                    <p className="label-category px-3 mb-2">Primary Nodes</p>
                    {TABS.map((t) => (
                      <button 
                        key={t.id}
                        onClick={() => { setActiveTab(t.id); setMobileMenuOpen(false); }}
                        className={cn("w-full flex items-center gap-3 p-3 rounded-ui text-[14px] font-medium transition-all", activeTab === t.id ? "bg-np-gold/10 text-np-gold" : "text-muted-foreground hover:bg-muted/50")}
                      >
                        <t.icon className="h-4 w-4" />
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1">
                    <p className="label-category px-3 mb-2">Personal</p>
                    <Link href="/dashboard/profile" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-ui text-[14px] font-medium text-muted-foreground hover:bg-muted/50">
                      <User className="h-4 w-4" />
                      Profile Settings
                    </Link>
                    <Link href="/docs" onClick={() => setMobileMenuOpen(false)} className="flex items-center gap-3 p-3 rounded-ui text-[14px] font-medium text-muted-foreground hover:bg-muted/50">
                      <Book className="h-4 w-4" />
                      Documentation
                    </Link>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between p-3">
                      <span className="text-[14px] font-medium text-muted-foreground">Appearance</span>
                      <ThemeToggle />
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-auto border-t border-border">
                  <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 p-3 rounded-ui bg-np-crimson/5 text-np-crimson text-[14px] font-bold transition-all hover:bg-np-crimson/10"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout Archive
                  </button>
                </div>
              </div>
            </>
          )}
        </header>

        {/* Tab content */}
        <main className="flex-1 p-4 sm:p-6 pb-24 md:pb-6 overflow-auto np-scroll">

          {/* MONITORING */}
          {activeTab === "monitoring" && (
            <div className="space-y-6 w-full">
              <MonitoringDashboard />
            </div>
          )}

          {/* SEO ANALYZER */}
          {activeTab === "seo" && (
            <div className="space-y-5 w-full animate-in fade-in duration-500">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-9 w-9 rounded-ui flex items-center justify-center bg-np-gold/10">
                    <Search className="h-4 w-4 text-np-gold" />
                  </div>
                  <div>
                    <h2 className="text-[14px] font-semibold">Website Analyser</h2>
                    <p className="label-category text-[10px]">SEO &amp; infrastructure audit engine</p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Input
                    placeholder="https://your-site.com"
                    value={analyzeUrl}
                    onChange={(e) => setAnalyzeUrl(e.target.value)}
                    className="sm:flex-1"
                  />
                  <Button onClick={runAnalyzer} disabled={analyzeLoading || !analyzeUrl} className="shrink-0 w-full sm:w-auto">
                    {analyzeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Scan"}
                  </Button>
                </div>
              </Card>
              {analyzeResult && <AnalysisReport data={analyzeResult} />}
            </div>
          )}

          {/* CODE AUDIT */}
          {activeTab === "audits" && (
            <div className="w-full">
               <CodeAuditConsole />
            </div>
          )}

          {/* API KEYS */}
          {activeTab === "keys" && (
            <div className="grid lg:grid-cols-2 gap-5 w-full items-start">
              {/* Left — key list */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-[14px] font-semibold">Access keys</h2>
                  <Button variant="outline" size="sm" onClick={fetchKeys}>
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5" /> Refresh
                  </Button>
                </div>

                {newKey && (
                  <Card className="p-4" style={{ borderLeft: "3px solid var(--np-teal)" }}>
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-4 w-4 text-np-teal" />
                      <span className="text-[12px] font-semibold text-np-teal">Key generated — copy now</span>
                    </div>
                    <div className="flex items-center gap-2 bg-np-obsidian rounded-ui p-3 font-mono text-[12px] text-np-gold break-all">
                      <span className="flex-1">{newKey}</span>
                      <button onClick={() => copyKey(newKey)} className="shrink-0 text-np-slate hover:text-np-gold transition-colors">
                        {copied ? <CheckCircle2 className="h-4 w-4 text-np-teal" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </Card>
                )}

                <Card className="overflow-hidden">
                  <div className="p-4" style={{ borderBottom: "0.5px solid var(--border)" }}>
                    <p className="label-category mb-3">Provision new key</p>
                    <form onSubmit={handleCreateKey} className="flex flex-col sm:flex-row gap-2">
                      <Input name="keyName" placeholder="Key name" className="sm:flex-1" required />
                      <Button type="submit" disabled={creatingKey} size="md" className="w-full sm:w-auto">
                        {creatingKey ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Plus className="h-3.5 w-3.5 mr-1" />Create</>}
                      </Button>
                    </form>
                  </div>
                  <div className="divide-y divide-border">
                    {keys.length === 0 && (
                      <p className="p-5 text-[13px] text-muted-foreground text-center">No keys yet</p>
                    )}
                    {keys.map((k) => (
                      <div key={k.id} className="flex items-center justify-between px-4 py-3 group hover:bg-muted/40 transition-colors">
                        <div className="min-w-0">
                          <p className="text-[13px] font-medium truncate">{k.name}</p>
                          <p className="mono-gold text-[11px]">
                            Issued {new Date(k.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteKey(k.id)}
                          className="opacity-0 group-hover:opacity-100 np-btn-danger h-8 px-3 text-[12px] transition-opacity"
                        >
                          Revoke
                        </button>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Right — playground */}
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="h-9 w-9 rounded-ui flex items-center justify-center bg-np-gold/10">
                    <Terminal className="h-4 w-4 text-np-gold" />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-semibold">Revalidation Playground</h3>
                    <p className="label-category text-[10px]">Test cache purge handshakes</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="label-category text-[10px] block mb-1.5">API key</label>
                    <PasswordInput value={playgroundKey} onChange={(e) => setPlaygroundKey(e.target.value)} />
                  </div>
                  <div>
                    <label className="label-category text-[10px] block mb-1.5">Cache tag / path</label>
                    <Input placeholder="e.g. products-v2" value={playgroundTag} onChange={(e) => setPlaygroundTag(e.target.value)} />
                  </div>
                  <Button className="w-full" onClick={runPlayground} disabled={playgroundLoading || !playgroundKey}>
                    {playgroundLoading ? "Running..." : "Execute purge"}
                  </Button>
                </div>
                {playgroundResult && (
                  <div className="mt-4 np-codeblock text-[12px]">
                    {JSON.stringify(playgroundResult, null, 2)}
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* WEBHOOKS */}
          {activeTab === "webhooks" && (
            <div className="w-full">
              <WebhookManager onLimitReached={() => setShowPricing(true)} />
            </div>
          )}

          {/* LOGS */}
          {activeTab === "logs" && (
            <div className="w-full">
              <ActivityLogs />
            </div>
          )}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center h-16 px-2 bg-background/95 backdrop-blur-md"
        style={{ borderTop: "0.5px solid var(--border)" }}
      >
        {TABS.filter(t => t.id !== "logs").map((t) => {
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-ui transition-all",
                active ? "text-np-gold" : "text-np-slate"
              )}
            >
              <t.icon className="h-5 w-5" />
              <span className="text-[9px] font-semibold uppercase tracking-wide">{t.label.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>

      <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} currentPlan={currentUserPlan} />
    </div>
  );
}

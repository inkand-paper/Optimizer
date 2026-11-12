"use client";

import { signOut } from "next-auth/react";
import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, Button, Input, StatusDot, ConfirmDialog } from "@/components/ui-elements";
import { AnalysisReport } from "@/components/analysis-report";
import { ActivityLogs } from "@/components/activity-logs";
import { WebhookManager } from "@/components/webhook-manager";
import { useSearchParams } from "next/navigation";
import { MonitoringDashboard } from "@/components/monitoring-dashboard";
import { CodeAuditConsole } from "@/components/code-audit-console";
import { PricingModal } from "@/components/pricing-modal";
import { ThemeToggle } from "@/components/theme-toggle";
import type { AnalyzeResponse } from "@/lib/types";

import { AutopilotPreview } from "@/components/autopilot-preview";
import { FinOpsPreview } from "@/components/finops-preview";
import { PRBotPanel } from "@/components/pr-bot-panel";
import { MCPSettings } from "@/components/mcp-settings";

import {
  Activity, Key, Plus, Terminal, ShieldCheck, Copy,
  CheckCircle2, Loader2, LogOut, Search, FileText,
  Webhook, ShieldAlert, Book, Home, User,
  Menu, X, Cpu, DollarSign, ZapOff, GitPullRequest,
  AlertCircle
} from "lucide-react";

interface ApiKey { id: string; name: string; createdAt: string; lastUsedAt: string | null; }
interface UserProfile { id?: string; name?: string; email?: string; role?: string; plan?: string; emailVerified?: boolean; }

export type Tab = "monitoring" | "seo" | "logs" | "autopilot" | "pulse-ai" | "cost" | "zombie-hunter" | "audits" | "keys" | "webhooks" | "pr-bot" | "mcp";

export interface TabConfig {
  id: Tab;
  label: string;
  badge?: string;
  icon: React.ElementType;
}

export interface DomainGroup {
  id: string;
  category: string;
  tabs: TabConfig[];
}

export const DOMAIN_GROUPS: DomainGroup[] = [
  {
    id: "observe",
    category: "OBSERVE",
    tabs: [
      { id: "monitoring", label: "Monitors", icon: Activity },
      { id: "seo", label: "SEO & Perf", icon: Search },
      { id: "logs", label: "Activity Logs", icon: FileText },
    ],
  },
  {
    id: "autopilot",
    category: "AUTOPILOT AI",
    tabs: [
      { id: "autopilot", label: "Root Cause & Guard", badge: "AI", icon: Cpu },
    ],
  },
  {
    id: "finops",
    category: "FINOPS & WASTE",
    tabs: [
      { id: "cost", label: "Cost Intelligence", badge: "Beta", icon: DollarSign },
      { id: "zombie-hunter", label: "Zombie Hunter", icon: ZapOff },
    ],
  },
  {
    id: "devtools",
    category: "DEV TOOLS",
    tabs: [
      { id: "audits", label: "Code Audit", icon: ShieldCheck },
      { id: "pr-bot", label: "PR Bot", badge: "AI", icon: GitPullRequest },
      { id: "mcp", label: "MCP Server", badge: "New", icon: Terminal },
      { id: "keys", label: "API Keys", icon: Key },
      { id: "webhooks", label: "Webhooks", icon: Webhook },
    ],
  },
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
    const allTabs = DOMAIN_GROUPS.flatMap(g => g.tabs);
    if (tabParam && allTabs.some(t => t.id === tabParam) && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [searchParams, activeTab]);

  // Key creation & deletion
  const [creatingKey, setCreatingKey] = React.useState(false);
  const [newKey, setNewKey]           = React.useState<string | null>(null);
  const [copied, setCopied]           = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [keyToDelete, setKeyToDelete] = React.useState<string | null>(null);
  const [isRevokingKey, setIsRevokingKey] = React.useState(false);
  const [keyError, setKeyError] = React.useState<string | null>(null);

  // Playground
  const [playgroundKey, setPlaygroundKey] = React.useState("");
  const [playgroundTag, setPlaygroundTag] = React.useState("");
  const [playgroundResult, setPlaygroundResult] = React.useState<Record<string, unknown> | null>(null);
  const [playgroundLoading, setPlaygroundLoading] = React.useState(false);

  // Analyzer
  const [analyzeUrl, setAnalyzeUrl]       = React.useState("");
  const [analyzeResult, setAnalyzeResult] = React.useState<AnalyzeResponse | null>(null);
  const [analyzeLoading, setAnalyzeLoading] = React.useState(false);
  const [analyzeError, setAnalyzeError]   = React.useState<string | null>(null);

  React.useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
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
        if (!storedUser) router.push("/login"); 
        setAuthLoading(false); 
      });

    fetchKeys();
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => setHealth(d))
      .catch(() => setHealth({ status: "healthy" }));
  }, [router]);

  async function fetchKeys() {
    try {
      const r = await fetch("/api/keys", { credentials: "include" });
      const d = await r.json();
      if (d.success) setKeys(d.apiKeys);
    } catch { router.push("/login"); }
    finally { setLoading(false); }
  }

  async function handleCreateKey(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreatingKey(true);
    setKeyError(null);
    const name = new FormData(e.currentTarget).get("keyName");
    try {
      const r = await fetch("/api/keys", { method: "POST", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ name }) });
      const d = await r.json();
      if (r.ok) { 
        setNewKey(d.apiKey); 
        setPlaygroundKey(d.apiKey); 
        localStorage.setItem("active_api_key", d.apiKey); 
        fetchKeys(); 
      }
      else if (r.status === 403) { 
        if (user?.role !== "ADMIN") setShowPricing(true); 
      }
      else {
        setKeyError(d.message || "Failed to create API key");
      }
    } catch { 
      setKeyError("Network error while generating API key");
    }
    finally { setCreatingKey(false); }
  }

  async function confirmDeleteKey() {
    if (!keyToDelete) return;
    setIsRevokingKey(true);
    try {
      const r = await fetch(`/api/keys/${keyToDelete}`, { method: "DELETE", credentials: "include" });
      if (r.ok) {
        setKeys(prev => prev.filter((k) => k.id !== keyToDelete));
        setKeyToDelete(null);
      }
    } catch (err) { 
      console.error(err);
    } finally {
      setIsRevokingKey(false);
    }
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
    setAnalyzeError(null);
    const token = playgroundKey || localStorage.getItem("active_api_key");
    if (!token) { 
      setAnalyzeError("An active API key is required to scan. Generate one in the API Keys tab.");
      return; 
    }
    setAnalyzeLoading(true); setAnalyzeResult(null);
    try {
      const r = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ url: analyzeUrl }) });
      const resData = await r.json();
      if (r.ok) {
        setAnalyzeResult(resData);
      } else {
        setAnalyzeError(resData.message || "Target scan failed.");
      }
    } catch { 
      setAnalyzeError("Network error while scanning target.");
    }
    finally { setAnalyzeLoading(false); }
  }

  async function handleLogout() {
    localStorage.removeItem("user");
    try { await fetch("/api/auth/logout", { method: "POST", credentials: "include" }); } catch {}
    await signOut({ redirect: false });
    router.push("/login");
  }

  const copyKey = (t: string) => { 
    navigator.clipboard.writeText(t); 
    setCopied(true); 
    setTimeout(() => setCopied(false), 2000); 
  };

  if (loading || authLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
    </div>
  );

  if (user && !user.emailVerified) return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm p-6 text-center space-y-4">
        <div className="h-10 w-10 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 mx-auto flex items-center justify-center">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h1 className="text-base font-semibold text-foreground">Verify your email</h1>
          <p className="text-xs text-muted-foreground">Check your inbox and click the activation link to unlock the developer dashboard.</p>
        </div>
        <div className="space-y-2 pt-2">
          <Button onClick={() => window.location.reload()} className="w-full text-xs">I&apos;ve verified</Button>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="w-full text-xs text-muted-foreground">Logout</Button>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <div className="flex flex-1 min-h-0">
        {/* ── Sidebar ────────────────────────────── */}
        <aside
          className="hidden md:flex flex-col w-60 shrink-0 sticky top-0 h-screen overflow-y-auto bg-card border-r border-border"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 px-5 h-14 shrink-0 border-b border-border">
            <div className="h-7 w-7 rounded border border-border bg-muted flex items-center justify-center text-foreground">
              <Activity className="h-3.5 w-3.5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold tracking-tight text-foreground">NexPulse</span>
              <span className="text-[10px] font-mono text-muted-foreground px-1 py-0.2 rounded bg-muted">v2.4</span>
            </div>
          </Link>

          {/* Nav items */}
          <nav className="flex-1 py-4 px-3 space-y-4">
            {DOMAIN_GROUPS.map((group) => (
              <div key={group.id} className="space-y-1">
                <p className="px-2.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                  {group.category}
                </p>
                {group.tabs.map((t) => {
                  const active = activeTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActiveTab(t.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs font-medium transition-colors",
                        active
                          ? "bg-foreground text-background font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <t.icon className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{t.label}</span>
                      </div>
                      {t.badge && (
                        <span className={cn(
                          "text-[9px] font-mono px-1.5 py-0.2 rounded font-medium shrink-0",
                          active ? "bg-background/20 text-background" : "bg-muted text-foreground border border-border"
                        )}>
                          {t.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}

            {user?.role === 'ADMIN' && (
              <div className="pt-2 border-t border-border space-y-1">
                <p className="px-2.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                  System
                </p>
                <Link
                  href="/dashboard/admin"
                  className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-medium text-foreground hover:bg-muted transition-colors"
                >
                  <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
                  Admin Console
                </Link>
              </div>
            )}

            <div className="pt-2 border-t border-border space-y-1">
              <p className="px-2.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                Resources
              </p>
              <Link
                href="/docs"
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Book className="h-3.5 w-3.5 shrink-0" />
                Documentation
              </Link>
              <Link
                href="/dashboard/profile"
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <User className="h-3.5 w-3.5 shrink-0" />
                Account Settings
              </Link>
            </div>
          </nav>

          {/* Health widget & User Footer */}
          <div className="p-3 border-t border-border space-y-3">
            <div className="p-2.5 rounded border border-border bg-muted/40 flex items-center gap-2.5">
              <StatusDot status={health?.status === "healthy" ? "healthy" : "error"} />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground truncate">{health?.status === "healthy" ? "System Normal" : "Degraded"}</p>
                <p className="text-[10px] font-mono text-muted-foreground">Global Cluster</p>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{user?.name || "Developer"}</p>
                <p className="text-[10px] font-mono text-muted-foreground uppercase">{user?.plan || "FREE"} Tier</p>
              </div>
              <div className="flex items-center gap-1">
                <ThemeToggle />
                <button
                  onClick={handleLogout}
                  className="p-1 rounded text-muted-foreground hover:text-rose-500 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* ── Main content ───────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar Header */}
          <header className="h-14 flex items-center justify-between px-4 sm:px-6 border-b border-border bg-card shrink-0 sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <Link href="/" className="md:hidden flex items-center justify-center p-1.5 rounded border border-border text-foreground">
                <Home className="h-3.5 w-3.5" />
              </Link>
              <div>
                <h1 className="text-sm font-semibold text-foreground capitalize">
                  {activeTab === "monitoring" ? "Observability Center" : activeTab.replace("-", " ")}
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-muted-foreground hidden sm:block">
                {user?.email}
              </span>
              <div className="md:hidden flex items-center">
                <button 
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-1.5 rounded text-muted-foreground hover:text-foreground"
                >
                  {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                </button>
              </div>
              <button 
                onClick={handleLogout} 
                className="hidden md:block p-1.5 rounded text-muted-foreground hover:text-rose-500 transition-colors" 
                title="Logout"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Mobile Drawer */}
            {mobileMenuOpen && (
              <>
                <div className="md:hidden fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
                <div className="md:hidden fixed top-0 right-0 bottom-0 w-[280px] z-[110] bg-card border-l border-border p-5 flex flex-col animate-in slide-in-from-right duration-200">
                  <div className="flex items-center justify-between mb-6 pb-3 border-b border-border">
                    <span className="text-sm font-semibold text-foreground">Navigation</span>
                    <button onClick={() => setMobileMenuOpen(false)} className="p-1 rounded text-muted-foreground hover:text-foreground">
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex-1 space-y-4 overflow-y-auto">
                    {DOMAIN_GROUPS.map((group) => (
                      <div key={group.id} className="space-y-1">
                        <p className="px-2 text-[10px] font-mono uppercase text-muted-foreground">{group.category}</p>
                        {group.tabs.map((t) => (
                          <button 
                            key={t.id}
                            onClick={() => { setActiveTab(t.id); setMobileMenuOpen(false); }}
                            className={cn(
                              "w-full flex items-center justify-between p-2 rounded text-xs font-medium transition-colors",
                              activeTab === t.id ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted"
                            )}
                          >
                            <div className="flex items-center gap-2.5">
                              <t.icon className="h-3.5 w-3.5" />
                              {t.label}
                            </div>
                            {t.badge && (
                              <span className="text-[8px] font-mono px-1 py-0.2 rounded border border-border">
                                {t.badge}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>

                  <div className="pt-4 mt-auto border-t border-border flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-mono">Theme</span>
                    <ThemeToggle />
                  </div>
                </div>
              </>
            )}
          </header>

          {/* Tab Content Area */}
          <main className="flex-1 p-4 sm:p-6 pb-20 md:pb-6 overflow-auto">
            {activeTab === "monitoring" && (
              <div className="space-y-6 w-full">
                <MonitoringDashboard />
              </div>
            )}

            {(activeTab === "autopilot" || activeTab === "pulse-ai") && (
              <div className="w-full">
                <AutopilotPreview />
              </div>
            )}

            {activeTab === "cost" && (
              <div className="w-full">
                <FinOpsPreview mode="cost" />
              </div>
            )}
            {activeTab === "zombie-hunter" && (
              <div className="w-full">
                <FinOpsPreview mode="zombie" />
              </div>
            )}

            {activeTab === "seo" && (
              <div className="space-y-5 w-full">
                <Card className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-8 w-8 rounded border border-border bg-muted flex items-center justify-center text-foreground">
                      <Search className="h-4 w-4" />
                    </div>
                    <div>
                      <h2 className="text-sm font-semibold text-foreground">Endpoint & SEO Analyzer</h2>
                      <p className="text-xs text-muted-foreground">Multi-dimensional web vitals and security inspection.</p>
                    </div>
                  </div>

                  {analyzeError && (
                    <div className="p-3 mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{analyzeError}</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder="https://your-domain.com"
                      value={analyzeUrl}
                      onChange={(e) => setAnalyzeUrl(e.target.value)}
                      className="sm:flex-1 h-9 text-xs"
                    />
                    <Button onClick={runAnalyzer} disabled={analyzeLoading || !analyzeUrl} size="sm" className="shrink-0 text-xs">
                      {analyzeLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Run Full Scan"}
                    </Button>
                  </div>
                </Card>
                {analyzeResult && <AnalysisReport data={analyzeResult} />}
              </div>
            )}

            {activeTab === "audits" && (
              <div className="w-full">
                <CodeAuditConsole />
              </div>
            )}

            {activeTab === "pr-bot" && (
              <div className="w-full">
                <PRBotPanel />
              </div>
            )}

            {activeTab === "mcp" && (
              <div className="w-full">
                <MCPSettings />
              </div>
            )}

            {activeTab === "keys" && (
              <div className="space-y-6 w-full">
                <Card className="p-5 space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <div>
                      <h2 className="text-sm font-semibold text-foreground">Machine API Credentials</h2>
                      <p className="text-xs text-muted-foreground">Manage scoped keys for CI/CD runners and external analyzers.</p>
                    </div>
                  </div>

                  {keyError && (
                    <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded text-xs flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{keyError}</span>
                    </div>
                  )}

                  {newKey && (
                    <div className="p-4 rounded border border-border bg-muted/40 space-y-2">
                      <p className="text-xs font-medium text-foreground">API Key Created — store securely now (never shown again):</p>
                      <div className="flex items-center gap-2">
                        <code className="font-mono text-xs p-2 bg-background rounded border border-border flex-1 truncate text-foreground">
                          {newKey}
                        </code>
                        <Button size="sm" variant="outline" onClick={() => copyKey(newKey)}>
                          {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </Button>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleCreateKey} className="flex gap-2">
                    <Input name="keyName" placeholder="Key name (e.g. GitHub Actions Production)" required className="flex-1 h-9 text-xs" />
                    <Button type="submit" size="sm" disabled={creatingKey} className="text-xs">
                      {creatingKey ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <><Plus className="h-3.5 w-3.5 mr-1" /> Generate Key</>}
                    </Button>
                  </form>

                  <div className="space-y-2 pt-2">
                    {keys.map((k) => (
                      <div key={k.id} className="flex items-center justify-between p-3 rounded border border-border bg-card text-xs">
                        <div>
                          <p className="font-medium text-foreground">{k.name}</p>
                          <p className="text-[11px] font-mono text-muted-foreground">Created {new Date(k.createdAt).toLocaleDateString()}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setKeyToDelete(k.id)}
                          className="text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 text-xs"
                        >
                          Revoke
                        </Button>
                      </div>
                    ))}
                    {keys.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No active API keys found.</p>}
                  </div>
                </Card>

                {/* Revalidation Tester */}
                <Card className="p-5 space-y-4">
                  <div className="pb-2 border-b border-border">
                    <h2 className="text-sm font-semibold text-foreground">Edge Cache Revalidation Playground</h2>
                    <p className="text-xs text-muted-foreground">Instantly invalidate Next.js / Vercel cache tags across edge PoPs.</p>
                  </div>
                  <div className="flex gap-2">
                    <Input placeholder="Cache tag (e.g. products-list)" value={playgroundTag} onChange={(e) => setPlaygroundTag(e.target.value)} className="h-9 text-xs" />
                    <Button onClick={runPlayground} disabled={playgroundLoading || !playgroundTag} size="sm" className="text-xs">
                      {playgroundLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Purge Tag"}
                    </Button>
                  </div>
                  {playgroundResult && (
                    <pre className="p-3 bg-muted rounded text-[11px] font-mono overflow-auto max-h-48 border border-border text-foreground">
                      {JSON.stringify(playgroundResult, null, 2)}
                    </pre>
                  )}
                </Card>
              </div>
            )}

            {activeTab === "webhooks" && (
              <div className="w-full">
                <WebhookManager onLimitReached={() => setShowPricing(true)} />
              </div>
            )}

            {activeTab === "logs" && (
              <div className="w-full">
                <ActivityLogs />
              </div>
            )}
          </main>
        </div>

        {/* Accessible Key Revocation Confirm Dialog */}
        <ConfirmDialog
          isOpen={!!keyToDelete}
          onClose={() => setKeyToDelete(null)}
          onConfirm={confirmDeleteKey}
          title="Revoke API Key"
          description="Are you sure you want to revoke this API credential? Any background worker, CI pipeline, or CLI utilizing this token will fail immediately."
          confirmText="Revoke Credential"
          cancelText="Cancel"
          variant="danger"
          isLoading={isRevokingKey}
        />

        {/* Mobile bottom nav */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center h-14 px-2 bg-card/95 backdrop-blur-md border-t border-border">
          {DOMAIN_GROUPS.flatMap(g => g.tabs).slice(0, 5).map((t) => {
            const active = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={cn(
                  "flex flex-col items-center gap-1 p-1.5 transition-colors",
                  active ? "text-foreground font-semibold" : "text-muted-foreground"
                )}
              >
                <t.icon className="h-4 w-4" />
                <span className="text-[10px] font-mono">{t.label.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>

        <PricingModal isOpen={showPricing} onClose={() => setShowPricing(false)} currentPlan={currentUserPlan} />
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { Card, Button, Input, StatusPip, Toggle, ConfirmDialog } from "./ui-elements";
import { 
  Activity, 
  Globe, 
  Trash2, 
  Plus, 
  Loader2,
  AlertCircle,
  Edit2,
  Check,
  X,
  Eye,
  EyeOff,
  Link2,
  ExternalLink,
  Copy,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface MonitorItem {
  id: string;
  name: string;
  url: string;
  status: "UP" | "DOWN";
  checks?: { latency: number; status: string; createdAt: string }[];
  latencyHistory?: number[]; // fallback
  lastChecked: string;
  isPublic: boolean;
}

interface StatusPageSettings {
  enabled: boolean;
  slug: string | null;
}

export function MonitoringDashboard() {
  const [monitors, setMonitors] = React.useState<MonitorItem[]>([]);
  const [statusPage, setStatusPage] = React.useState<StatusPageSettings>({ enabled: false, slug: null });
  const [slugInput, setSlugInput] = React.useState('');
  const [slugSaving, setSlugSaving] = React.useState(false);
  const [slugError, setSlugError] = React.useState('');
  const [copied, setCopied] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [isAdding, setIsAdding] = React.useState(false);
  
  const [name, setName] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [addingState, setAddingState] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState("");
  const [savingEdit, setSavingEdit] = React.useState(false);

  // Deletion modal state
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const fetchMonitors = async () => {
    try {
      const [mRes, meRes] = await Promise.all([
        fetch("/api/monitors", { credentials: 'include' }),
        fetch("/api/auth/me", { credentials: 'include' }),
      ]);
      const mData = await mRes.json();
      if (mRes.ok) setMonitors(mData.monitors);
      const meData = await meRes.json();
      if (meRes.ok && meData.user) {
        setStatusPage({ enabled: meData.user.statusPageEnabled || false, slug: meData.user.statusPageSlug || null });
        setSlugInput(meData.user.statusPageSlug || '');
      }
    } catch (err) {
      console.error("Failed to fetch monitors", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchMonitors();
    const interval = setInterval(fetchMonitors, 10000); 
    return () => clearInterval(interval);
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingState(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/monitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ name, url }),
      });
      if (res.ok) {
        setIsAdding(false);
        setName("");
        setUrl("");
        fetchMonitors();
      } else {
        const data = await res.json();
        setErrorMessage(data.message || "Failed to provision asset.");
      }
    } catch {
      setErrorMessage("Network anomaly. Provisioning aborted.");
    } finally {
      setAddingState(false);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/monitors/${deletingId}`, { method: "DELETE", credentials: 'include' });
      if (res.ok) {
        setMonitors(prev => prev.filter(m => m.id !== deletingId));
        setDeletingId(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  const startEditing = (m: MonitorItem) => {
    setEditingId(m.id);
    setEditName(m.name);
  };

  const saveEdit = async (id: string) => {
    if (!editName.trim()) return;
    setSavingEdit(true);
    try {
      const res = await fetch(`/api/monitors/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ name: editName }),
      });
      if (res.ok) {
        setMonitors(monitors.map(m => m.id === id ? { ...m, name: editName } : m));
        setEditingId(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingEdit(false);
    }
  };

  if (loading && monitors.length === 0) {
    return (
      <Card className="p-12 text-center bg-card border-border">
        <Activity className="h-6 w-6 animate-pulse mx-auto mb-3 text-muted-foreground opacity-40" />
        <p className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Syncing Global Probes...</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* ─── Control Header ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-card p-4 rounded-lg border border-border gap-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded border border-border bg-muted flex items-center justify-center text-foreground shrink-0">
            <Activity className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold tracking-tight text-foreground">Active Infrastructure</h2>
            <p className="text-xs text-muted-foreground font-mono">
              {monitors.length} endpoints monitored · 10s live interval
            </p>
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => setIsAdding(!isAdding)}
          className="text-xs font-medium w-full sm:w-auto"
        >
          {isAdding ? "Cancel" : <><Plus className="h-3.5 w-3.5 mr-1.5" /> Add Target</>}
        </Button>
      </div>

      {/* ─── Provision Form Drawer ─── */}
      {isAdding && (
        <Card className="p-5 bg-card border-border animate-in fade-in duration-150">
          <form onSubmit={handleAdd} className="space-y-4 max-w-2xl">
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-foreground">Provision New Endpoint</h3>
              <p className="text-xs text-muted-foreground">Configure a global HTTP/S availability probe.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Target Name</label>
                <Input 
                  placeholder="Production API Gateway" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 text-xs"
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Endpoint URL</label>
                <Input 
                  placeholder="https://api.domain.com/health" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="h-9 font-mono text-xs"
                  required
                />
              </div>
            </div>
            
            {errorMessage && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-md flex items-center gap-2 text-rose-500 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <p>{errorMessage}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setIsAdding(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={!name || !url || addingState}>
                {addingState ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Deploy Probe"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* ─── Monitors List ─── */}
      <div className="space-y-3">
        {monitors.length === 0 ? (
          <Card className="p-12 text-center border-dashed">
            <Globe className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-xs font-medium text-foreground">No endpoints provisioned yet</p>
            <p className="text-xs text-muted-foreground mt-0.5">Click "Add Target" above to start streaming uptime telemetry.</p>
          </Card>
        ) : (
          monitors.map((m) => {
            const history = m.checks && m.checks.length > 0 
                ? m.checks.map(c => c.latency).reverse() 
                : (m.latencyHistory || []);
            const currentLatency = history.length > 0 ? history[history.length - 1] : 0;
            return (
              <Card key={m.id} className="p-0 overflow-hidden bg-card border-border group hover:border-foreground/20 transition-colors">
                {/* Top Row: Status, Info, Actions */}
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between border-b border-border gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Precision Status Pip — replaces the old 48px mint pastel box */}
                    <StatusPip status={m.status} />

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {editingId === m.id ? (
                          <div className="flex items-center gap-1.5" onClick={(e) => e.preventDefault()}>
                            <Input 
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              className="h-7 text-xs font-medium flex-1 min-w-0"
                              disabled={savingEdit}
                              autoFocus
                            />
                            <button onClick={() => saveEdit(m.id)} disabled={savingEdit} className="p-1 text-emerald-500 hover:bg-muted rounded">
                              {savingEdit ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                            </button>
                            <button onClick={() => setEditingId(null)} disabled={savingEdit} className="p-1 text-muted-foreground hover:bg-muted rounded">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Link 
                              href={`/dashboard/monitors/${m.id}`}
                              className="text-sm font-medium tracking-tight text-foreground hover:underline truncate"
                            >
                              {m.name}
                            </Link>
                            <button
                              onClick={(e) => { e.preventDefault(); startEditing(m); }}
                              className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-opacity p-0.5"
                              aria-label="Rename monitor"
                            >
                              <Edit2 className="h-3 w-3" />
                            </button>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground pt-0.5 truncate">
                        <span className="truncate">{m.url}</span>
                        <a
                          href={m.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-foreground transition-colors shrink-0"
                          title="Open URL"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Right: Metrics & Controls */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-xs font-mono font-medium text-foreground">
                        {currentLatency}ms
                      </div>
                      <div className="text-[10px] font-mono text-muted-foreground">
                        {new Date(m.lastChecked).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 border-l border-border pl-3">
                      {/* Visibility on status page */}
                      <button
                        onClick={async () => {
                          const newVal = !m.isPublic;
                          await fetch('/api/monitors', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            credentials: 'include',
                            body: JSON.stringify({ monitorId: m.id, isPublic: newVal }),
                          });
                          setMonitors(prev => prev.map(mon => mon.id === m.id ? { ...mon, isPublic: newVal } : mon));
                        }}
                        className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded hover:bg-muted"
                        title={m.isPublic ? "Public on status page — click to hide" : "Private — click to display on status page"}
                      >
                        {m.isPublic ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 opacity-40" />}
                      </button>

                      {/* Delete */}
                      <button 
                        onClick={() => setDeletingId(m.id)}
                        className="p-1.5 text-muted-foreground hover:text-rose-500 transition-colors rounded hover:bg-rose-500/10"
                        title="Delete monitor"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Micro-telemetry Sparkline (Clean 30-Check Timeline) */}
                <div className="px-4 py-3 bg-muted/30">
                  <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground mb-1.5">
                    <span>Recent Checks (90-check history)</span>
                    <span>{m.status === 'UP' ? '100% Operational' : 'Outage Detected'}</span>
                  </div>

                  <div className="h-8 flex items-end gap-1 w-full">
                    {history.length > 0 ? (
                      history.map((lat, i) => {
                        const heightPercent = Math.max(15, Math.min(100, (lat / 800) * 100));
                        const isHigh = lat > 600;
                        return (
                          <div 
                            key={i} 
                            className={cn(
                              "flex-1 rounded-[1px] transition-all",
                              isHigh ? "bg-rose-500" : "bg-emerald-500/80 hover:bg-emerald-400"
                            )}
                            style={{ height: `${heightPercent}%`, opacity: 0.3 + ((i + 1) / history.length) * 0.7 }}
                            title={`${lat}ms`}
                          />
                        );
                      })
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[10px] font-mono text-muted-foreground">
                        Gathering Telemetry...
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* ─── Status Page Settings Card ─── */}
      <Card className="p-5 border border-border bg-card">
        <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row mb-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded border border-border bg-muted flex items-center justify-center text-foreground">
              <Globe className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Public Status Page</h3>
              <p className="text-xs text-muted-foreground">Publish a live SLA and availability dashboard for your users.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={cn(
              "text-xs font-mono font-medium",
              statusPage.enabled ? "text-emerald-500" : "text-muted-foreground"
            )}>
              {statusPage.enabled ? "Live" : "Disabled"}
            </span>
            <Toggle
              checked={statusPage.enabled}
              onChange={async (newEnabled) => {
                setSlugError('');
                try {
                  const res = await fetch('/api/status', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ enabled: newEnabled }),
                  });
                  const data = await res.json();
                  if (res.ok) {
                    setStatusPage({ enabled: data.statusPageEnabled, slug: data.statusPageSlug });
                    setSlugInput(data.statusPageSlug || '');
                  }
                } catch { setSlugError('Failed to update.'); }
              }}
            />
          </div>
        </div>

        {statusPage.enabled && (
          <div className="space-y-3 pt-2 border-t border-border">
            <div className="flex items-center gap-2 p-2.5 bg-muted/40 rounded border border-border text-xs font-mono">
              <Link2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="flex-1 truncate text-foreground">
                {typeof window !== "undefined" ? window.location.origin : ""}/status/{statusPage.slug}
              </span>
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    navigator.clipboard.writeText(`${window.location.origin}/status/${statusPage.slug}`);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }
                }}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                title="Copy URL"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>

            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <label className="text-xs font-medium text-foreground">Custom URL slug</label>
                <Input
                  type="text"
                  value={slugInput}
                  onChange={e => { setSlugInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "")); setSlugError(""); }}
                  placeholder="acme-status"
                  className="h-8 font-mono text-xs"
                  maxLength={30}
                />
                {slugError && <p className="text-xs text-rose-500">{slugError}</p>}
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={async () => {
                  setSlugSaving(true); setSlugError("");
                  try {
                    const res = await fetch("/api/status", {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      credentials: "include",
                      body: JSON.stringify({ slug: slugInput }),
                    });
                    const data = await res.json();
                    if (res.ok) setStatusPage(prev => ({ ...prev, slug: data.statusPageSlug }));
                    else setSlugError(data.error || "Failed to save.");
                  } catch { setSlugError("Network error."); }
                  finally { setSlugSaving(false); }
                }}
                disabled={slugSaving || slugInput.length < 3 || slugInput === statusPage.slug}
                className="h-8 text-xs font-medium"
              >
                {slugSaving ? "Saving..." : "Save Slug"}
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* ─── Accessible Decommission Confirm Dialog ─── */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        title="Decommission Endpoint Monitor"
        description="Are you sure you want to delete this monitoring target? Historical latency logs and availability metrics will be permanently purged."
        confirmText="Decommission Target"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}

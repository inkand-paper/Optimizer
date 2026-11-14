"use client";

import * as React from "react";
import { Navbar } from "@/components/navbar";
import { Users, Zap, Search, ArrowLeft, Trash2, GraduationCap, Check, X, Eye, Clock, ChevronDown, Loader2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Card, Button, Input } from "@/components/ui-elements";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  plan: string;
  createdAt: string;
  _count: {
    monitors: number;
    apiKeys: number;
  };
}

interface StudentTrial {
  id: string;
  eduEmail: string;
  studentIdUrl: string | null;
  status: string;
  rejectionReason: string | null;
  rejectionNote: string | null;
  submittedAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    plan: string;
  };
}

const REJECTION_REASONS = [
  { value: 'wrong_document', label: 'Wrong document — please upload your student ID card, not a transcript or enrollment letter' },
  { value: 'unreadable', label: 'Document unreadable — image is too blurry or cropped' },
  { value: 'name_mismatch', label: 'Name on ID does not match your account name' },
  { value: 'expired_id', label: 'Student ID card appears to be expired' },
  { value: 'not_student_id', label: 'Unable to verify this as a valid student ID' },
  { value: 'contact_us', label: 'Unable to verify — please contact us directly at nexpulse.team@gmail.com' },
];

export default function AdminPortal() {
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<'users' | 'trials'>('users');
  const [trials, setTrials] = React.useState<StudentTrial[]>([]);
  const [trialsLoading, setTrialsLoading] = React.useState(false);
  const [reviewingTrial, setReviewingTrial] = React.useState<StudentTrial | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState('');
  const [rejectionNote, setRejectionNote] = React.useState('');
  const [reviewLoading, setReviewLoading] = React.useState(false);
  const [trialFilter, setTrialFilter] = React.useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [giftTarget, setGiftTarget] = React.useState<AdminUser | null>(null);
  const [giftPlan, setGiftPlan] = React.useState<'PRO' | 'BUSINESS'>('PRO');
  const [giftDays, setGiftDays] = React.useState(30);
  const [giftPermanent, setGiftPermanent] = React.useState(false);
  const [giftReason, setGiftReason] = React.useState('');
  const [giftLoading, setGiftLoading] = React.useState(false);

  const handleGift = async () => {
    if (!giftTarget) return;
    setGiftLoading(true);
    try {
      const res = await fetch('/api/admin/gift-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          userId: giftTarget.id,
          plan: giftPlan,
          days: giftPermanent ? undefined : giftDays,
          permanent: giftPermanent,
          reason: giftReason || undefined,
        }),
      });
      if (res.ok) {
        setUsers(prev => prev.map(u => u.id === giftTarget.id ? { ...u, plan: giftPlan } : u));
        setGiftTarget(null);
        setGiftReason('');
      }
    } catch {
      console.error('Gift failed');
    } finally {
      setGiftLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users", { credentials: 'include' });
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch {
      console.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  const fetchTrials = async (status = trialFilter) => {
    setTrialsLoading(true);
    try {
      const res = await fetch(`/api/admin/student-trials?status=${status}`, { credentials: 'include' });
      const data = await res.json();
      if (data.success) setTrials(data.trials);
    } catch {
      console.error('Failed to load student trials');
    } finally {
      setTrialsLoading(false);
    }
  };

  const handleReview = async (action: 'APPROVE' | 'REJECT') => {
    if (!reviewingTrial) return;
    if (action === 'REJECT' && !rejectionReason) return;
    setReviewLoading(true);
    try {
      const res = await fetch('/api/admin/student-trials', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          trialId: reviewingTrial.id,
          action,
          rejectionReason: REJECTION_REASONS.find(r => r.value === rejectionReason)?.label,
          rejectionNote: rejectionNote || undefined,
        }),
      });
      if (res.ok) {
        setTrials(prev => prev.filter(t => t.id !== reviewingTrial.id));
        setReviewingTrial(null);
        setRejectionReason('');
        setRejectionNote('');
      }
    } catch {
      console.error('Review action failed');
    } finally {
      setReviewLoading(false);
    }
  };

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, []);

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (activeTab === 'trials') fetchTrials(trialFilter);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, trialFilter]);

  const updateUser = async (userId: string, data: Record<string, unknown>) => {
    setUpdatingId(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: 'include',
        body: JSON.stringify({ userId, ...data })
      });
      if (res.ok) {
         fetchUsers();
      } else {
         const errorData = await res.json();
         alert(errorData.error || "Failed to update user");
      }
    } catch {
      alert("Network error: Update failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to permanently delete this user? This cannot be undone.")) return;
    
    setUpdatingId(userId);
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
        credentials: 'include'
      });
      
      const data = await res.json();
      if (res.ok) {
        fetchUsers();
      } else {
        alert(data.error || "Failed to delete user");
      }
    } catch {
      console.error("Delete failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(search.toLowerCase()) || 
    (u.name?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:py-10">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="flex items-center gap-2 text-[11px] font-semibold  text-muted-foreground hover:text-foreground mb-6 transition-all group w-fit">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span>Back to dashboard</span>
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight ">
                Admin console
              </h1>
              <p className="label-category text-muted-foreground mt-2">Manage users, plans, and student trial applications.</p>
            </div>
            {/* Stats card */}
            <Card className="p-4 flex items-center gap-3 sm:min-w-[180px]">
              <div className="h-10 w-10 rounded-ui bg-muted flex items-center justify-center border border-border shrink-0">
                <Users className="h-4 w-4 text-foreground" />
              </div>
              <div>
                <p className="label-category text-muted-foreground text-[9px] mb-0.5">Total Users</p>
                <p className="text-2xl font-semibold leading-none">{users.length}</p>
              </div>
            </Card>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setActiveTab('users')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-ui text-[12px] font-medium  border transition-all",
              activeTab === 'users'
                ? "bg-foreground text-background font-semibold"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <Users className="h-3.5 w-3.5" />
            Users
          </button>
          <button
            onClick={() => setActiveTab('trials')}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-ui text-[12px] font-medium  border transition-all",
              activeTab === 'trials'
                ? "bg-foreground text-background font-semibold"
                : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            <GraduationCap className="h-3.5 w-3.5" />
            Student Trials
            {trials.filter(t => t.status === 'PENDING').length > 0 && activeTab !== 'trials' && (
              <span className="h-4 w-4 rounded-full bg-np-crimson text-white text-[9px] flex items-center justify-center">
                {trials.filter(t => t.status === 'PENDING').length}
              </span>
            )}
          </button>
        </div>

        <Card className="overflow-hidden">
          {/* Header */}
          <div className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border bg-muted/20">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="SEARCH OPERATOR (EMAIL/IDENTITY)..."
                className="w-full pl-10 bg-card font-mono text-[12px] "
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button 
              variant="outline"
              onClick={fetchUsers} 
              className="h-10 w-10 p-0 shrink-0 border-border"
            >
               <Zap className={cn("h-4 w-4 text-muted-foreground", loading && "animate-spin text-foreground")} />
            </Button>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="px-6 py-4 label-category text-muted-foreground">User</th>
                  <th className="px-6 py-4 label-category text-muted-foreground">Plan / Role</th>
                  <th className="px-6 py-4 label-category text-muted-foreground text-center">Usage</th>
                  <th className="px-6 py-4 label-category text-muted-foreground">Joined</th>
                  <th className="px-6 py-4 label-category text-muted-foreground text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/20 transition-all group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-ui bg-muted border border-border flex items-center justify-center text-foreground font-bold text-sm  shrink-0">
                          {user.name?.[0] || user.email[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold truncate">{user.name || "Unnamed"}</p>
                          <p className="text-[11px] text-muted-foreground truncate font-mono">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <select
                          value={user.plan}
                          onChange={(e) => updateUser(user.id, { plan: e.target.value })}
                          disabled={updatingId === user.id}
                          className="text-[10px] font-semibold  px-2 py-1.5 rounded bg-muted border border-border focus:border-border outline-none"
                        >
                          <option value="FREE">Free</option>
                          <option value="PRO">PRO</option>
                          <option value="BUSINESS">Agency</option>
                        </select>
                        <select
                          value={user.role}
                          onChange={(e) => updateUser(user.id, { role: e.target.value })}
                          disabled={updatingId === user.id}
                          className="text-[10px] font-semibold  px-2 py-1.5 rounded bg-muted text-foreground border border-border outline-none"
                        >
                          <option value="DEVELOPER">Developer</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-4">
                        <div className="text-center">
                          <p className="text-[12px] font-mono font-semibold">{user._count.monitors}</p>
                          <p className="text-[9px]  text-muted-foreground">Monitors</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[12px] font-mono font-semibold">{user._count.apiKeys}</p>
                          <p className="text-[9px]  text-muted-foreground">Keys</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[11px] font-mono text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => { setGiftTarget(user); setGiftPlan('PRO'); setGiftDays(30); setGiftPermanent(false); setGiftReason(''); }}
                          className="p-2 text-muted-foreground hover:text-foreground transition-all opacity-0 group-hover:opacity-100"
                          title="Gift PRO"
                        >
                          <Zap className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          disabled={updatingId === user.id}
                          className="p-2 text-muted-foreground hover:text-status-down transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                          title="Delete user"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="md:hidden divide-y divide-border">
            {filteredUsers.map((user) => (
              <div key={user.id} className="p-4 space-y-3">
                {/* Identity */}
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-ui bg-muted border border-border flex items-center justify-center text-foreground font-bold text-sm  shrink-0">
                    {user.name?.[0] || user.email[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold truncate">{user.name || "Unnamed"}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => { setGiftTarget(user); setGiftPlan('PRO'); setGiftDays(30); setGiftPermanent(false); setGiftReason(''); }}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors shrink-0"
                    title="Gift PRO"
                  >
                    <Zap className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteUser(user.id)}
                    disabled={updatingId === user.id}
                    className="p-2 text-muted-foreground hover:text-status-down transition-colors shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  <select
                    value={user.plan}
                    onChange={(e) => updateUser(user.id, { plan: e.target.value })}
                    disabled={updatingId === user.id}
                    className="flex-1 text-[11px] font-semibold  px-3 py-2 rounded bg-muted border border-border focus:border-border outline-none"
                  >
                    <option value="FREE">Free</option>
                    <option value="PRO">PRO</option>
                    <option value="BUSINESS">Agency</option>
                  </select>
                  <select
                    value={user.role}
                    onChange={(e) => updateUser(user.id, { role: e.target.value })}
                    disabled={updatingId === user.id}
                    className="flex-1 text-[11px] font-semibold  px-3 py-2 rounded bg-muted text-foreground border border-border outline-none"
                  >
                    <option value="DEVELOPER">Developer</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                  <span>{user._count.monitors} monitors</span>
                  <span>{user._count.apiKeys} keys</span>
                  <span className="ml-auto">{new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Student Trials Panel ── */}
        {activeTab === 'trials' && (
          <Card className="overflow-hidden mt-8">
            {/* Filter tabs */}
            <div className="p-5 border-b border-border bg-muted/20 flex items-center gap-3">
              {(['PENDING', 'APPROVED', 'REJECTED'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setTrialFilter(s)}
                  className={cn(
                    "px-3 py-1.5 rounded text-[11px] font-medium  transition-all",
                    trialFilter === s
                      ? s === 'PENDING' ? "bg-primary text-primary-foreground/15 text-foreground"
                        : s === 'APPROVED' ? "bg-np-teal/15 text-status-up"
                        : "bg-np-crimson/15 text-status-down"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>

            {trialsLoading ? (
              <div className="p-12 text-center text-muted-foreground text-[13px]">Loading...</div>
            ) : trials.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground text-[13px]">
                No {trialFilter.toLowerCase()} applications.
              </div>
            ) : (
              <div className="divide-y divide-border">
                {trials.map(trial => (
                  <div key={trial.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[13px] font-medium truncate">{trial.user.name || trial.user.email}</p>
                        <span className="text-[10px] text-muted-foreground shrink-0">{trial.user.email}</span>
                      </div>
                      <p className="text-[12px] text-foreground truncate">{trial.eduEmail}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(trial.submittedAt).toLocaleDateString()}
                        </span>
                        {trial.rejectionReason && (
                          <span className="text-[10px] text-status-down truncate max-w-xs">{trial.rejectionReason}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* View ID card — triggers 302 redirect from server to signed URL */}
                      {trial.studentIdUrl && (
                        <button
                          onClick={() => {
                            window.open(`/api/admin/student-trials/signed-url?trialId=${trial.id}`, '_blank');
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-border text-[11px] text-muted-foreground hover:text-foreground hover:border-border transition-all"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View ID
                        </button>
                      )}

                      {trial.status === 'PENDING' && (
                        <button
                          onClick={() => { setReviewingTrial(trial); setRejectionReason(''); setRejectionNote(''); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-border text-[11px] text-foreground hover:bg-muted transition-all"
                        >
                          Review
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}
      </main>

      {/* ── Gift PRO Modal ── */}
      {giftTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-background border border-border rounded-ui shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-bold  flex items-center gap-2">
                <Zap className="h-4 w-4 text-foreground" />
                Gift Plan Access
              </h3>
              <button onClick={() => setGiftTarget(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* User info */}
            <div className="p-3 bg-muted/30 rounded-ui">
              <p className="text-[13px] font-medium">{giftTarget.name || giftTarget.email}</p>
              <p className="text-[11px] text-muted-foreground">{giftTarget.email}</p>
              <p className="text-[10px] text-muted-foreground mt-1">Current plan: <span className="text-foreground">{giftTarget.plan}</span></p>
            </div>

            {/* Plan picker */}
            <div className="space-y-2">
              <p className="label-category text-[10px]">Plan to Gift</p>
              <div className="grid grid-cols-2 gap-2">
                {(['PRO', 'BUSINESS'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setGiftPlan(p)}
                    className={cn(
                      "py-2.5 rounded-ui border text-[12px] font-semibold  transition-all",
                      giftPlan === p
                        ? "bg-foreground text-background font-semibold"
                        : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {p === 'BUSINESS' ? 'Agency' : p}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="space-y-3">
              <p className="label-category text-[10px]">Duration</p>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-[12px] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={giftPermanent}
                    onChange={e => setGiftPermanent(e.target.checked)}
                    className="rounded"
                  />
                  Permanent (no expiry)
                </label>
              </div>
              {!giftPermanent && (
                <div className="grid grid-cols-4 gap-2">
                  {[7, 30, 60, 90].map(d => (
                    <button
                      key={d}
                      onClick={() => setGiftDays(d)}
                      className={cn(
                        "py-2 rounded-ui border text-[11px] font-medium transition-all",
                        giftDays === d
                          ? "bg-foreground text-background font-semibold"
                          : "border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {d}d
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Internal reason */}
            <div className="space-y-2">
              <p className="label-category text-[10px]">Internal Note (optional)</p>
              <input
                type="text"
                value={giftReason}
                onChange={e => setGiftReason(e.target.value)}
                placeholder="e.g. launch promo, influencer, partner"
                className="w-full h-9 px-3 rounded-ui bg-muted/30 border border-border text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Confirm */}
            <Button
              onClick={handleGift}
              disabled={giftLoading}
              className="w-full h-10 text-[11px]  flex items-center justify-center gap-2"
            >
              {giftLoading
                ? <><Loader2 className="h-4 w-4 animate-spin" />Gifting...</>
                : <><Zap className="h-4 w-4" />Gift {giftPlan} {giftPermanent ? 'Permanently' : `for ${giftDays} days`}</>
              }
            </Button>
          </div>
        </div>
      )}

      {/* ── Review Modal ── */}
      {reviewingTrial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-background border border-border rounded-ui shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-bold ">Review application</h3>
              <button onClick={() => setReviewingTrial(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Applicant info */}
            <div className="p-4 bg-muted/30 rounded-ui space-y-1">
              <p className="text-[13px] font-medium">{reviewingTrial.user.name || reviewingTrial.user.email}</p>
              <p className="text-[11px] text-muted-foreground">{reviewingTrial.user.email}</p>
              <p className="text-[12px] text-foreground">{reviewingTrial.eduEmail}</p>
              <p className="text-[10px] text-muted-foreground">Submitted {new Date(reviewingTrial.submittedAt).toLocaleDateString()}</p>
            </div>

            {/* ID card preview — loads via signed URL */}
            {reviewingTrial.studentIdUrl && (
              <div className="space-y-2">
                <p className="label-category text-[10px]">Student ID Card</p>
                <button
                  onClick={() => {
                    window.open(`/api/admin/student-trials/signed-url?trialId=${reviewingTrial.id}`, '_blank');
                  }}
                  className="w-full flex items-center justify-center gap-2 p-4 border border-border rounded-ui text-[12px] text-foreground hover:bg-primary text-primary-foreground/5 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                  Open ID card (secure link, expires in 60s)
                </button>
              </div>
            )}

            {/* Rejection reason picker */}
            <div className="space-y-2">
              <p className="label-category text-[10px]">Rejection Reason (required if rejecting)</p>
              <div className="relative">
                <select
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  className="w-full h-10 px-3 pr-8 rounded-ui bg-muted/30 border border-border text-[12px] text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Select a reason...</option>
                  {REJECTION_REASONS.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            {/* Optional note */}
            <div className="space-y-2">
              <p className="label-category text-[10px]">Additional Note (optional)</p>
              <textarea
                value={rejectionNote}
                onChange={e => setRejectionNote(e.target.value)}
                placeholder="Add any extra context for the applicant..."
                rows={2}
                className="w-full px-3 py-2 rounded-ui bg-muted/30 border border-border text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <Button
                onClick={() => handleReview('APPROVE')}
                disabled={reviewLoading}
                className="flex-1 flex items-center justify-center gap-2 h-10 text-[11px]  bg-foreground text-background hover:opacity-90 font-medium"
              >
                <Check className="h-3.5 w-3.5" />
                Approve
              </Button>
              <Button
                onClick={() => handleReview('REJECT')}
                disabled={reviewLoading || !rejectionReason}
                variant="outline"
                className="flex-1 flex items-center justify-center gap-2 h-10 text-[11px]  border-status-down/20 text-status-down hover:bg-status-down/10 disabled:opacity-40"
              >
                <X className="h-3.5 w-3.5" />
                Reject
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

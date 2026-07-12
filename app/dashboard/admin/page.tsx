"use client";

import * as React from "react";
import { Navbar } from "@/components/navbar";
import { Users, Zap, Search, ArrowLeft, Trash2, GraduationCap, Check, X, Eye, Clock, ChevronDown } from "lucide-react";
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
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <Link href="/dashboard" className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground hover:text-np-gold mb-6 transition-all group w-fit">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
              <span>Return to Mission Control</span>
            </Link>
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight uppercase">
              Executive<br />
              <span className="text-np-gold">Administration</span>
            </h1>
            <p className="label-category text-muted-foreground mt-3 max-w-md">Manage global user access, infrastructure tiers, and system scaling.</p>
          </div>
          
          <Card className="p-5 flex items-center gap-4 min-w-[240px]">
            <div className="flex items-center gap-3 mt-6">
            <button
              onClick={() => setActiveTab('users')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-ui text-[12px] font-medium uppercase tracking-wider border transition-all",
                activeTab === 'users'
                  ? "bg-np-gold/15 border-np-gold/40 text-np-gold"
                  : "border-border text-muted-foreground hover:text-foreground"
              )}
            >
              <Users className="h-3.5 w-3.5" />
              Users
            </button>
            <button
              onClick={() => setActiveTab('trials')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-ui text-[12px] font-medium uppercase tracking-wider border transition-all",
                activeTab === 'trials'
                  ? "bg-np-gold/15 border-np-gold/40 text-np-gold"
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
          <div className="h-12 w-12 rounded-ui bg-np-gold/10 flex items-center justify-center border border-np-gold/20">
              <Users className="h-5 w-5 text-np-gold" />
            </div>
            <div>
              <p className="label-category text-muted-foreground mb-1">Total Authorized Units</p>
              <p className="text-3xl font-semibold leading-none">{users.length}</p>
            </div>
          </Card>
        </div>

        <Card className="overflow-hidden">
          {/* Header */}
          <div className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-border bg-muted/20">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="text" 
                placeholder="SEARCH OPERATOR (EMAIL/IDENTITY)..."
                className="w-full pl-10 bg-card font-mono text-[12px] uppercase"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button 
              variant="outline"
              onClick={fetchUsers} 
              className="h-10 w-10 p-0 shrink-0 border-border"
            >
               <Zap className={cn("h-4 w-4 text-muted-foreground", loading && "animate-spin text-np-gold")} />
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
                        <div className="h-9 w-9 rounded-ui bg-np-gold/10 border border-np-gold/20 flex items-center justify-center text-np-gold font-bold text-sm uppercase shrink-0">
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
                          className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1.5 rounded bg-muted border border-border focus:border-np-gold outline-none"
                        >
                          <option value="FREE">Free</option>
                          <option value="PRO">PRO</option>
                          <option value="BUSINESS">Agency</option>
                        </select>
                        <select
                          value={user.role}
                          onChange={(e) => updateUser(user.id, { role: e.target.value })}
                          disabled={updatingId === user.id}
                          className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1.5 rounded bg-np-gold/10 text-np-gold border border-np-gold/20 outline-none"
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
                          <p className="text-[9px] uppercase text-muted-foreground">Monitors</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[12px] font-mono font-semibold">{user._count.apiKeys}</p>
                          <p className="text-[9px] uppercase text-muted-foreground">Keys</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[11px] font-mono text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => deleteUser(user.id)}
                        disabled={updatingId === user.id}
                        className="p-2 text-muted-foreground hover:text-np-crimson transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                        title="Delete user"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
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
                  <div className="h-9 w-9 rounded-ui bg-np-gold/10 border border-np-gold/20 flex items-center justify-center text-np-gold font-bold text-sm uppercase shrink-0">
                    {user.name?.[0] || user.email[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold truncate">{user.name || "Unnamed"}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <button
                    onClick={() => deleteUser(user.id)}
                    disabled={updatingId === user.id}
                    className="p-2 text-muted-foreground hover:text-np-crimson transition-colors shrink-0"
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
                    className="flex-1 text-[11px] font-semibold uppercase tracking-wider px-3 py-2 rounded bg-muted border border-border focus:border-np-gold outline-none"
                  >
                    <option value="FREE">Free</option>
                    <option value="PRO">PRO</option>
                    <option value="BUSINESS">Agency</option>
                  </select>
                  <select
                    value={user.role}
                    onChange={(e) => updateUser(user.id, { role: e.target.value })}
                    disabled={updatingId === user.id}
                    className="flex-1 text-[11px] font-semibold uppercase tracking-wider px-3 py-2 rounded bg-np-gold/10 text-np-gold border border-np-gold/20 outline-none"
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
                    "px-3 py-1.5 rounded text-[11px] font-medium uppercase tracking-wider transition-all",
                    trialFilter === s
                      ? s === 'PENDING' ? "bg-np-gold/15 text-np-gold"
                        : s === 'APPROVED' ? "bg-np-teal/15 text-np-teal"
                        : "bg-np-crimson/15 text-np-crimson"
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
                      <p className="text-[12px] text-np-gold truncate">{trial.eduEmail}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(trial.submittedAt).toLocaleDateString()}
                        </span>
                        {trial.rejectionReason && (
                          <span className="text-[10px] text-np-crimson truncate max-w-xs">{trial.rejectionReason}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {/* View ID card — fetches signed URL (private blob) */}
                      {trial.studentIdUrl && (
                        <button
                          onClick={async () => {
                            const res = await fetch(`/api/admin/student-trials/signed-url?trialId=${trial.id}`, { credentials: 'include' });
                            const data = await res.json();
                            if (data.url) window.open(data.url, '_blank');
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-border text-[11px] text-muted-foreground hover:text-foreground hover:border-np-gold/40 transition-all"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View ID
                        </button>
                      )}

                      {trial.status === 'PENDING' && (
                        <button
                          onClick={() => { setReviewingTrial(trial); setRejectionReason(''); setRejectionNote(''); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-np-gold/30 text-[11px] text-np-gold hover:bg-np-gold/10 transition-all"
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

      {/* ── Review Modal ── */}
      {reviewingTrial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-background border border-border rounded-ui shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-bold uppercase">Review Application</h3>
              <button onClick={() => setReviewingTrial(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Applicant info */}
            <div className="p-4 bg-muted/30 rounded-ui space-y-1">
              <p className="text-[13px] font-medium">{reviewingTrial.user.name || reviewingTrial.user.email}</p>
              <p className="text-[11px] text-muted-foreground">{reviewingTrial.user.email}</p>
              <p className="text-[12px] text-np-gold">{reviewingTrial.eduEmail}</p>
              <p className="text-[10px] text-muted-foreground">Submitted {new Date(reviewingTrial.submittedAt).toLocaleDateString()}</p>
            </div>

            {/* ID card preview — loads via signed URL */}
            {reviewingTrial.studentIdUrl && (
              <div className="space-y-2">
                <p className="label-category text-[10px]">Student ID Card</p>
                <button
                  onClick={async () => {
                    const res = await fetch(`/api/admin/student-trials/signed-url?trialId=${reviewingTrial.id}`, { credentials: 'include' });
                    const data = await res.json();
                    if (data.url) window.open(data.url, '_blank');
                  }}
                  className="w-full flex items-center justify-center gap-2 p-4 border border-border rounded-ui text-[12px] text-np-gold hover:bg-np-gold/5 transition-colors"
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
                  className="w-full h-10 px-3 pr-8 rounded-ui bg-muted/30 border border-border text-[12px] text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-np-gold/50"
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
                className="w-full px-3 py-2 rounded-ui bg-muted/30 border border-border text-[12px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-np-gold/50 resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <Button
                onClick={() => handleReview('APPROVE')}
                disabled={reviewLoading}
                className="flex-1 flex items-center justify-center gap-2 h-10 text-[11px] uppercase tracking-wider bg-np-teal/15 border border-np-teal/30 text-np-teal hover:bg-np-teal/25"
              >
                <Check className="h-3.5 w-3.5" />
                Approve
              </Button>
              <Button
                onClick={() => handleReview('REJECT')}
                disabled={reviewLoading || !rejectionReason}
                variant="outline"
                className="flex-1 flex items-center justify-center gap-2 h-10 text-[11px] uppercase tracking-wider border-np-crimson/30 text-np-crimson hover:bg-np-crimson/10 disabled:opacity-40"
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

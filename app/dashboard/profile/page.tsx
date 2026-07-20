"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Input, Badge } from "@/components/ui-elements";
import { User, Shield, Mail, Calendar, Key, ShieldCheck, Loader2, Camera, AlertTriangle, Eye, EyeOff, X, Check, ArrowLeft, GraduationCap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getGravatarUrl } from "@/lib/gravatar";
import Image from "next/image";
import { PLAN_LIMITS } from "@/lib/plans";

interface UserIdentity {
  id: string;
  name?: string;
  email?: string;
  role?: string;
  plan?: string;
  emailVerified?: boolean;
  twoFactorEnabled?: boolean;
  weeklyDigestEnabled?: boolean;
  createdAt?: string;
  image?: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = React.useState<UserIdentity | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState({ type: "", text: "" });

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [image, setImage] = React.useState<string | null>(null);
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [mfaSetup, setMfaSetup] = React.useState({ isOpen: false, qrCode: "", secret: "" });
  const [isPricingOpen, setIsPricingOpen] = React.useState(false);
  const [studentTrial, setStudentTrial] = React.useState<{ hasTrial: boolean; status?: string; eduEmail?: string; expiresAt?: string; isExpired?: boolean; rejectionReason?: string; rejectionNote?: string } | null>(null);
  const [studentEduEmail, setStudentEduEmail] = React.useState("");
  const [studentLoading, setStudentLoading] = React.useState(false);
  const [studentFile, setStudentFile] = React.useState<File | null>(null);
  const [studentFilePreview, setStudentFilePreview] = React.useState<string | null>(null);
  const [studentUploadProgress, setStudentUploadProgress] = React.useState<'idle' | 'uploading' | 'done'>('idle');
  const studentFileRef = React.useRef<HTMLInputElement>(null);
  const [mfaCode, setMfaCode] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [digestEnabled, setDigestEnabled] = React.useState(true);
  const [digestSaving, setDigestSaving] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 3000);

    const init = async () => {
      try {
        const r = await fetch("/api/auth/me", { credentials: "include" });
        const d = await r.json();
        if (d.success) {
          setUser(d.user);
          setName(d.user.name || "");
          setEmail(d.user.email || "");
          setImage(d.user.image || null);
          setDigestEnabled(d.user.weeklyDigestEnabled !== false);
        } else {
          router.push("/login");
        }
        // Fetch student trial status
        fetch("/api/student/verify", { credentials: "include" })
          .then(r => r.json())
          .then(d => setStudentTrial(d))
          .catch(() => {});
      } catch (err) {
        console.error("Identity fetch failed:", err);
      } finally {
        clearTimeout(timer);
        setLoading(false);
      }
    };

    init();
    return () => clearTimeout(timer);
  }, [router]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/auth/update", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, image }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage({ type: "success", text: "Identity updated successfully." });
        if (user) setUser({ ...user, name, image });
      } else {
        setMessage({ type: "error", text: data.message || "Failed to update." });
      }
    } catch {
      setMessage({ type: "error", text: "Network anomaly detected." });
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: "error", text: "Image too large (max 2MB)." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-np-gold" />
        <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground animate-pulse">Synchronizing Infrastructure...</p>
      </div>
    );
  }

  const profileUser = user || {
    name: "Operator",
    email: "",
    role: "DEVELOPER",
    plan: "FREE",
    emailVerified: false,
    twoFactorEnabled: false,
    createdAt: new Date().toISOString()
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500">

        {/* ── Header ── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight uppercase">
              Operator <span className="text-np-gold">Profile</span>
            </h1>
            <p className="label-category text-muted-foreground mt-1 text-[10px] sm:text-[11px]">
              Manage your system credentials and authorization level.
            </p>
          </div>
          <Link href="/dashboard" className="np-btn-outline h-9 sm:h-10 px-4 text-[11px] flex items-center gap-2 self-start sm:self-auto">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Link>
        </div>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">

          {/* ── Left column: Avatar + Tier card ── */}
          <div className="md:col-span-1 space-y-4 sm:space-y-6">

            {/* Avatar card */}
            <Card className="p-5 sm:p-6 text-center space-y-4 relative overflow-hidden group">
              <div className="absolute inset-0 bg-np-gold/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              {/* Avatar */}
              <div className="relative group mx-auto w-20 sm:w-24">
                <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-full overflow-hidden border-2 border-np-gold/20 flex items-center justify-center bg-np-gold/10 text-np-gold text-2xl sm:text-3xl font-bold">
                  {image ? (
                    <Image src={image} alt="Avatar" width={96} height={96} className="w-full h-full object-cover" />
                  ) : profileUser.email ? (
                    <Image src={getGravatarUrl(profileUser.email)} alt="Avatar" width={96} height={96} className="w-full h-full object-cover" unoptimized />
                  ) : (
                    profileUser.name?.[0] || "?"
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-1.5 bg-np-ink border border-border rounded-full text-muted-foreground hover:text-np-gold transition-colors shadow-xl z-20"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageChange} />
              </div>

              {/* Identity */}
              <div className="relative z-10">
                <h2 className="text-base sm:text-lg font-bold uppercase truncate px-2">{profileUser.name || "Unnamed Unit"}</h2>
                <div className="flex items-center justify-center flex-wrap gap-2 mt-1">
                  <p className="label-category text-[10px] text-np-gold">{profileUser.role} · {profileUser.plan} TIER</p>
                  {profileUser.emailVerified ? (
                    <Badge variant="success" className="h-4 px-1.5 text-[8px] uppercase tracking-tighter">Verified</Badge>
                  ) : (
                    <Badge variant="danger" className="h-4 px-1.5 text-[8px] uppercase tracking-tighter">Unverified</Badge>
                  )}
                </div>
              </div>

              {/* Meta */}
              <div className="pt-4 border-t border-border space-y-2.5 text-left relative z-10">
                <div className="flex items-center gap-3 text-[12px] text-muted-foreground min-w-0">
                  <Mail className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{profileUser.email || "Syncing..."}</span>
                </div>
                <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  <span>Joined {profileUser.createdAt ? new Date(profileUser.createdAt).toLocaleDateString() : "—"}</span>
                </div>
              </div>
            </Card>

            {/* Tier card */}
            <Card className="p-5 sm:p-6 bg-np-gold/5 border-np-gold/20 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
                <ShieldCheck className="h-16 w-16 sm:h-20 sm:w-20" />
              </div>
              <div className="flex items-center gap-3 mb-4 text-np-gold relative z-10">
                <ShieldCheck className="h-5 w-5 shrink-0" />
                <h3 className="text-[13px] font-bold uppercase">System Tier</h3>
              </div>

              {profileUser.plan === "BUSINESS" ? (
                <div className="space-y-4 relative z-10">
                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                    You have achieved the <span className="text-np-gold font-bold">OPERATIONAL PEAK</span>. Your account is authorized for maximum infrastructure throughput.
                  </p>
                  <div className="p-3 bg-np-gold/10 rounded-ui border border-np-gold/20 flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-np-gold animate-pulse" />
                    <span className="text-[10px] uppercase font-bold text-np-gold">All Limits Unlocked</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 relative z-10">
                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                    Operating on the <span className="text-np-gold font-bold">{profileUser.plan}</span> protocol. Upgrade to expand your monitoring perimeter.
                  </p>
                  <Button
                    onClick={() => setIsPricingOpen(true)}
                    variant="outline"
                    className="w-full text-[11px] uppercase tracking-widest h-9"
                  >
                    Manage Subscription
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* ── Right column: Forms ── */}
          <div className="md:col-span-2 space-y-4 sm:space-y-6">

            {/* Personal Identity */}
            <Card className="p-5 sm:p-8">
              <h3 className="text-[14px] font-bold uppercase mb-5 sm:mb-6 flex items-center gap-2">
                <User className="h-4 w-4 text-np-gold shrink-0" />
                Personal Identity
              </h3>
              <form onSubmit={handleUpdate} className="space-y-5 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="label-category text-[10px]">Full Name</label>
                    <Input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="bg-muted/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="label-category text-[10px]">Email Address</label>
                    <Input
                      value={email}
                      disabled
                      className="bg-muted opacity-50 cursor-not-allowed"
                    />
                  </div>
                </div>

                {message.text && (
                  <div className={cn(
                    "p-3 rounded-ui text-[12px] font-medium",
                    message.type === "success"
                      ? "bg-np-teal/10 text-np-teal border border-np-teal/20"
                      : "bg-np-crimson/10 text-np-crimson border border-np-crimson/20"
                  )}>
                    {message.text}
                  </div>
                )}

                <Button type="submit" disabled={saving} className="w-full sm:w-auto px-8 sm:px-10 h-10 sm:h-11 uppercase tracking-widest text-[11px]">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                </Button>
              </form>
            </Card>

            {/* Security Credentials */}
            <Card className="p-5 sm:p-8">
              <h3 className="text-[14px] font-bold uppercase mb-5 sm:mb-6 flex items-center gap-2">
                <Key className="h-4 w-4 text-np-gold shrink-0" />
                Security Credentials
              </h3>
              <form onSubmit={async (e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const currentPassword = formData.get("currentPassword");
                const newPassword = formData.get("newPassword");
                const confirmPassword = formData.get("confirmPassword");

                if (newPassword !== confirmPassword) {
                  setMessage({ type: "error", text: "Passwords do not match." });
                  return;
                }

                setSaving(true);
                try {
                  const res = await fetch("/api/auth/change-password", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ currentPassword, newPassword }),
                  });
                  const data = await res.json();
                  if (res.ok) setMessage({ type: "success", text: "Password updated successfully." });
                  else setMessage({ type: "error", text: data.error || "Update failed." });
                } catch {
                  setMessage({ type: "error", text: "Security synchronization failed." });
                } finally {
                  setSaving(false);
                }
              }} className="space-y-5 sm:space-y-6">
                {/* Stack all 3 fields on mobile, 2-col on sm+ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="label-category text-[10px]">Current Password</label>
                    <div className="relative">
                      <Input
                        name="currentPassword"
                        type={showCurrent ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="bg-muted/30 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-np-gold transition-colors"
                      >
                        {showCurrent ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="label-category text-[10px]">New Password</label>
                    <div className="relative">
                      <Input
                        name="newPassword"
                        type={showNew ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        className="bg-muted/30 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-np-gold transition-colors"
                      >
                        {showNew ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </div>
                  {/* Confirm spans full width on sm+ to avoid orphan */}
                  <div className="space-y-2 sm:col-span-1">
                    <label className="label-category text-[10px]">Confirm New Password</label>
                    <Input
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="bg-muted/30"
                    />
                  </div>
                </div>
                <Button type="submit" disabled={saving} variant="outline" className="w-full sm:w-auto px-8 sm:px-10 h-10 sm:h-11 uppercase tracking-widest text-[11px]">
                  Update Password
                </Button>
              </form>
            </Card>

            {/* Advanced Protection */}
            <Card className="p-5 sm:p-8">
              <h3 className="text-[14px] font-bold uppercase mb-5 sm:mb-6 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-np-gold shrink-0" />
                Advanced Protection
              </h3>
              <div className="space-y-4">

                {/* Email unverified warning */}
                {!profileUser.emailVerified && (
                  <div className="p-3 sm:p-4 bg-np-crimson/5 border border-np-crimson/20 rounded-ui">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-start sm:items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-np-crimson shrink-0 mt-0.5 sm:mt-0" />
                        <div>
                          <p className="text-[12px] font-bold uppercase text-np-crimson">Email Unverified</p>
                          <p className="text-[11px] text-muted-foreground">Verify your email to secure your account.</p>
                        </div>
                      </div>
                      <Button
                        onClick={async () => {
                          setSaving(true);
                          try {
                            const res = await fetch("/api/auth/verify/resend", { method: "POST" });
                            if (res.ok) setMessage({ type: "success", text: "Verification link dispatched." });
                            else setMessage({ type: "error", text: "Dispatch failed." });
                          } catch {
                            setMessage({ type: "error", text: "Network anomaly." });
                          } finally {
                            setSaving(false);
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="h-8 text-[10px] uppercase border-np-crimson/30 hover:bg-np-crimson/10 text-np-crimson self-start sm:self-auto"
                      >
                        Resend
                      </Button>
                    </div>
                  </div>
                )}

                {/* MFA */}
                <div className="p-4 bg-muted/40 rounded-ui border border-dashed border-border flex flex-col gap-4">
                  <div className="flex items-start sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3">
                      <Shield className="h-5 w-5 text-np-slate shrink-0 mt-0.5 sm:mt-0" />
                      <div>
                        <p className="text-[12px] font-bold uppercase">Multi-Factor Auth (MFA)</p>
                        <p className="text-[10px] text-muted-foreground">High-security layer for your account access.</p>
                      </div>
                    </div>
                    {profileUser.twoFactorEnabled ? (
                      <Badge variant="success" className="text-[8px] uppercase shrink-0">Enabled</Badge>
                    ) : (
                      <Button
                        onClick={async () => {
                          setSaving(true);
                          try {
                            const res = await fetch("/api/auth/2fa/setup", { method: "POST" });
                            const data = await res.json();
                            if (data.qrCodeUrl) {
                              setMfaSetup({ isOpen: true, qrCode: data.qrCodeUrl, secret: data.secret });
                            } else {
                              setMessage({ type: "error", text: data.error || "MFA Setup failed." });
                            }
                          } catch {
                            setMessage({ type: "error", text: "Security anomaly detected." });
                          } finally {
                            setSaving(false);
                          }
                        }}
                        variant="outline"
                        size="sm"
                        className="h-8 text-[10px] uppercase shrink-0"
                      >
                        Setup MFA
                      </Button>
                    )}
                  </div>

                  {mfaSetup.isOpen && (
                    <div className="p-4 bg-background border border-border rounded-ui space-y-4 animate-in fade-in slide-in-from-top-2">
                      <p className="text-[11px] text-muted-foreground text-center">Scan this QR code with your Authenticator app.</p>
                      <div className="bg-white p-2 w-32 h-32 mx-auto rounded-md relative">
                        <Image
                          src={mfaSetup.qrCode}
                          alt="MFA QR Code"
                          fill
                          unoptimized
                          className="object-contain"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="label-category text-[9px] text-center block">Enter 6-digit code</label>
                        <div className="flex gap-2">
                          <Input
                            value={mfaCode || ""}
                            onChange={(e) => setMfaCode(e.target.value)}
                            placeholder="000000"
                            className="text-center tracking-[0.5em] font-mono"
                            maxLength={6}
                          />
                          <Button
                            onClick={async () => {
                              setSaving(true);
                              try {
                                const res = await fetch("/api/auth/2fa/enable", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ code: mfaCode }),
                                });
                                if (res.ok) {
                                  setMessage({ type: "success", text: "MFA active. Security level: Maximum." });
                                  setMfaSetup({ isOpen: false, qrCode: "", secret: "" });
                                  if (user) setUser({ ...user, twoFactorEnabled: true });
                                } else {
                                  const d = await res.json();
                                  setMessage({ type: "error", text: d.error || "Invalid code." });
                                }
                              } catch {
                                setMessage({ type: "error", text: "Verification failed." });
                              } finally {
                                setSaving(false);
                              }
                            }}
                            className="px-5 sm:px-6 h-10 text-[10px] uppercase shrink-0"
                          >
                            Verify
                          </Button>
                        </div>
                      </div>
                      <button
                        onClick={() => setMfaSetup({ isOpen: false, qrCode: "", secret: "" })}
                        className="text-[10px] text-muted-foreground hover:text-foreground w-full text-center"
                      >
                        Cancel Setup
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Weekly Digest toggle */}
              <div className="p-4 bg-muted/40 rounded-ui border border-dashed border-border flex items-center justify-between gap-4">
                <div>
                  <p className="text-[12px] font-bold uppercase">Weekly Email Digest</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Monday morning summary of uptime, incidents, and code audit scores.
                  </p>
                </div>
                <button
                  onClick={async () => {
                    const newVal = !digestEnabled;
                    setDigestSaving(true);
                    try {
                      await fetch('/api/auth/update', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ weeklyDigestEnabled: newVal }),
                      });
                      setDigestEnabled(newVal);
                    } catch { /* silent */ }
                    finally { setDigestSaving(false); }
                  }}
                  disabled={digestSaving}
                  className={cn(
                    "shrink-0 px-3 py-1.5 rounded-ui border text-[11px] font-semibold uppercase tracking-wider transition-all",
                    digestEnabled
                      ? "bg-np-teal/10 border-np-teal/30 text-np-teal"
                      : "border-border text-muted-foreground"
                  )}
                >
                  {digestEnabled ? "On" : "Off"}
                </button>
              </div>
            </Card>

            {/* Student Trial */}
            {profileUser.plan === 'FREE' && (
              <Card className="p-5 sm:p-8">
                <h3 className="text-[14px] font-bold uppercase mb-5 sm:mb-6 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-np-gold shrink-0" />
                  Student Access
                </h3>

                {/* ── APPROVED ── */}
                {studentTrial?.status === 'APPROVED' && (
                  <div className="p-4 bg-np-teal/5 border border-np-teal/20 rounded-ui space-y-2">
                    <p className="text-[12px] font-bold uppercase text-np-teal">
                      {studentTrial.isExpired ? 'Trial Expired' : 'Trial Active'}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      Verified with <span className="text-np-gold">{studentTrial.eduEmail}</span>
                      {studentTrial.expiresAt && (
                        <span> — {studentTrial.isExpired ? 'expired' : 'expires'} {new Date(studentTrial.expiresAt).toLocaleDateString()}</span>
                      )}
                    </p>
                  </div>
                )}

                {/* ── PENDING ── */}
                {studentTrial?.status === 'PENDING' && (
                  <div className="p-4 bg-np-gold/5 border border-np-gold/20 rounded-ui space-y-2">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-3.5 w-3.5 text-np-gold animate-spin" />
                      <p className="text-[12px] font-bold uppercase text-np-gold">Under Review</p>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Your application is being reviewed. We will email <span className="text-np-gold">{studentTrial.eduEmail}</span> within 1-2 business days.
                    </p>
                  </div>
                )}

                {/* ── REJECTED ── */}
                {studentTrial?.status === 'REJECTED' && (
                  <div className="space-y-4">
                    <div className="p-4 bg-np-crimson/5 border border-np-crimson/20 rounded-ui space-y-2">
                      <p className="text-[12px] font-bold uppercase text-np-crimson">Application Not Approved</p>
                      <p className="text-[11px] text-muted-foreground">
                        {studentTrial.rejectionReason || 'We were unable to verify your student status.'}
                      </p>
                      {studentTrial.rejectionNote && (
                        <p className="text-[11px] text-muted-foreground italic">{studentTrial.rejectionNote}</p>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1">You can reapply below with corrected information.</p>
                    </div>
                    {/* Fall through to the form below */}
                  </div>
                )}

                {/* ── FORM (no trial yet, or rejected) ── */}
                {(!studentTrial?.hasTrial || studentTrial?.status === 'REJECTED') && (
                  <div className="space-y-4 mt-2">
                    {!studentTrial?.hasTrial && (
                      <p className="text-[13px] text-muted-foreground leading-relaxed">
                        Are you a student? Submit your institutional email and student ID card to get <span className="text-np-gold font-bold">30 days of PRO access</span> free. We review all applications manually within 1-2 business days.
                      </p>
                    )}

                    <div className="space-y-4">
                      {/* Email */}
                      <div className="space-y-2">
                        <label className="label-category text-[10px]">Institutional Email</label>
                        <input
                          type="email"
                          value={studentEduEmail}
                          onChange={e => setStudentEduEmail(e.target.value)}
                          placeholder="you@university.edu.bd"
                          className="w-full h-10 px-3 rounded-ui bg-muted/30 border border-border text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-np-gold/50"
                        />
                        <p className="text-[10px] text-muted-foreground">Any institutional email is accepted — .edu, .ac.uk, .edu.bd, .com.bd, or your university domain.</p>
                      </div>

                      {/* ID Card Upload */}
                      <div className="space-y-2">
                        <label className="label-category text-[10px]">Student ID Card</label>
                        <div
                          onClick={() => studentFileRef.current?.click()}
                          className={cn(
                            "relative border-2 border-dashed rounded-ui p-4 cursor-pointer transition-colors text-center",
                            studentFile ? "border-np-gold/40 bg-np-gold/5" : "border-border hover:border-np-gold/40 hover:bg-muted/40"
                          )}
                        >
                          {studentFilePreview && studentFile?.type.startsWith('image/') ? (
                            <div className="flex flex-col items-center gap-2">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={studentFilePreview} alt="ID preview" className="max-h-32 rounded object-contain" />
                              <p className="text-[10px] text-np-gold">{studentFile.name}</p>
                            </div>
                          ) : studentFile ? (
                            <div className="flex flex-col items-center gap-2 py-2">
                              <div className="h-10 w-10 rounded bg-np-gold/10 flex items-center justify-center">
                                <GraduationCap className="h-5 w-5 text-np-gold" />
                              </div>
                              <p className="text-[10px] text-np-gold">{studentFile.name}</p>
                            </div>
                          ) : (
                            <div className="py-2 space-y-1">
                              <Camera className="h-6 w-6 text-muted-foreground mx-auto" />
                              <p className="text-[12px] text-muted-foreground">Click to upload your student ID card</p>
                              <p className="text-[10px] text-muted-foreground">JPG, PNG, WebP or PDF — max 5MB</p>
                            </div>
                          )}
                          <input
                            ref={studentFileRef}
                            type="file"
                            className="hidden"
                            accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                            onChange={e => {
                              const f = e.target.files?.[0] || null;
                              setStudentFile(f);
                              if (f && f.type.startsWith('image/')) {
                                const reader = new FileReader();
                                reader.onloadend = () => setStudentFilePreview(reader.result as string);
                                reader.readAsDataURL(f);
                              } else {
                                setStudentFilePreview(null);
                              }
                            }}
                          />
                        </div>
                      </div>

                      {message.text && (
                        <p className={cn("text-[11px]", message.type === 'error' ? "text-np-crimson" : "text-np-teal")}>
                          {message.text}
                        </p>
                      )}

                      <Button
                        onClick={async () => {
                          if (!studentEduEmail || !studentFile) {
                            setMessage({ type: 'error', text: 'Please fill in your email and upload your student ID card.' });
                            return;
                          }
                          setStudentLoading(true);
                          setMessage({ type: '', text: '' });
                          try {
                            // Step 1: Upload ID card
                            setStudentUploadProgress('uploading');
                            const form = new FormData();
                            form.append('file', studentFile);
                            const uploadRes = await fetch('/api/student/upload', {
                              method: 'POST',
                              credentials: 'include',
                              body: form,
                            });
                            const uploadData = await uploadRes.json();
                            if (!uploadRes.ok) {
                              setMessage({ type: 'error', text: uploadData.error || 'Upload failed.' });
                              return;
                            }
                            setStudentUploadProgress('done');

                            // Step 2: Submit application
                            const res = await fetch('/api/student/verify', {
                              method: 'POST',
                              headers: { 'Content-Type': 'application/json' },
                              credentials: 'include',
                              body: JSON.stringify({ eduEmail: studentEduEmail, studentIdUrl: uploadData.url }),
                            });
                            const data = await res.json();
                            if (res.ok) {
                              setMessage({ type: 'success', text: 'Application submitted! We will review and email you within 1-2 business days.' });
                              setStudentTrial({ hasTrial: true, status: 'PENDING', eduEmail: studentEduEmail });
                            } else {
                              setMessage({ type: 'error', text: data.error || 'Submission failed.' });
                            }
                          } catch {
                            setMessage({ type: 'error', text: 'Network error. Please try again.' });
                          } finally {
                            setStudentLoading(false);
                            setStudentUploadProgress('idle');
                          }
                        }}
                        disabled={studentLoading || !studentEduEmail || !studentFile}
                        className="w-full sm:w-auto px-8 h-10 uppercase tracking-widest text-[11px]"
                      >
                        {studentLoading
                          ? studentUploadProgress === 'uploading'
                            ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Uploading ID...</>
                            : <><Loader2 className="h-4 w-4 animate-spin mr-2" />Submitting...</>
                          : 'Submit Application'
                        }
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* ── Pricing Modal ── */}
      {isPricingOpen && (
        <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-3 sm:p-6 bg-background/80 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
          <div className="relative w-full max-w-5xl bg-background border border-border rounded-ui shadow-2xl p-5 sm:p-8 lg:p-12 my-4 sm:my-0 animate-in zoom-in-95 duration-300">
            <button
              onClick={() => setIsPricingOpen(false)}
              className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 text-muted-foreground hover:text-np-gold transition-colors"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            <div className="text-center mb-8 sm:mb-14">
              <p className="label-category mb-3">Infrastructure Tiers</p>
              <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight uppercase">
                Operational <span className="text-np-gold">Protocols</span>
              </h2>
              <p className="text-muted-foreground mt-2 text-sm max-w-lg mx-auto">
                Select the authorization level that matches your production throughput requirements.
              </p>
            </div>

            {/* Plan cards: stack on mobile, 3-col on md+ */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 items-stretch">
              {Object.entries(PLAN_LIMITS).map(([key, plan]) => {
                const isPro = key === "PRO";
                const isCurrent = profileUser.plan === key;
                return (
                  <Card
                    key={key}
                    className={cn(
                      "p-5 sm:p-7 flex flex-col gap-5 sm:gap-6 relative transition-all",
                      isPro && "ring-1 ring-np-gold shadow-np-gold/5 shadow-2xl sm:scale-105 z-10",
                      isCurrent && "opacity-100 border-np-gold/40 bg-np-gold/5"
                    )}
                  >
                    {isPro && (
                      <div
                        className="absolute -top-3 left-0 right-0 h-0.5 rounded-t-card"
                        style={{ background: "var(--np-gold)" }}
                      />
                    )}
                    {isCurrent && (
                      <div className="absolute top-2 right-3">
                        <Badge variant="success" className="text-[7px] uppercase tracking-widest bg-np-teal/10 text-np-teal">Active</Badge>
                      </div>
                    )}
                    <div>
                      <p className="label-category mb-2">{plan.name}</p>
                      <div className="flex items-baseline gap-1 mb-3">
                        <span className="text-3xl sm:text-4xl font-semibold">{plan.price}</span>
                        <span className="text-[13px] text-muted-foreground">/mo</span>
                      </div>
                      <p className="text-[13px] text-muted-foreground leading-relaxed">{plan.description}</p>
                    </div>

                    <ul className="space-y-2 sm:space-y-2.5">
                      {plan.features.map((f: { active: boolean; text: string }, i: number) => (
                        <li key={i} className={cn("flex items-center gap-2 sm:gap-2.5 text-[12px]", !f.active && "opacity-30")}>
                          <Check className="h-3 w-3 shrink-0" style={{ color: f.active ? "var(--np-teal)" : "var(--np-slate)" }} />
                          {f.text}
                        </li>
                      ))}
                    </ul>

                    <Button
                      disabled={isCurrent || saving}
                      onClick={async () => {
                        setSaving(true);
                        setMessage({ type: "", text: "" });
                        const controller = new AbortController();
                        const timeoutId = setTimeout(() => controller.abort(), 10000);
                        try {
                          const res = await fetch("/api/billing/portal", { signal: controller.signal });
                          const data = await res.json();
                          clearTimeout(timeoutId);
                          if (data.url) {
                            setTimeout(() => window.location.assign(data.url), 150);
                          } else {
                            setMessage({ type: "error", text: "Infrastructure store activation pending." });
                            setSaving(false);
                          }
                        } catch {
                          clearTimeout(timeoutId);
                          setMessage({ type: "error", text: "System synchronization timeout." });
                          setSaving(false);
                        }
                      }}
                      className={cn(
                        "mt-auto uppercase tracking-widest text-[10px] h-10 sm:h-11",
                        isPro ? "np-btn-primary w-full" : "np-btn-outline w-full",
                        isCurrent && "bg-np-gold/20 border-np-gold/40 text-np-gold hover:bg-np-gold/20 cursor-default"
                      )}
                    >
                      {isCurrent ? "Current Protocol" : `Select ${plan.name}`}
                    </Button>
                  </Card>
                );
              })}
            </div>

            <div className="mt-8 sm:mt-12 text-center">
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                All transactions secured by NexPulse Guard.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

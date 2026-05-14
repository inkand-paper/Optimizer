"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Input, Badge } from "@/components/ui-elements";
import { User, Shield, Mail, Calendar, Key, ShieldCheck, Loader2, Camera, AlertTriangle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getGravatarUrl } from "@/lib/gravatar";
import Image from "next/image";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = React.useState<{ name?: string; email?: string; role?: string; plan?: string; emailVerified?: boolean; twoFactorEnabled?: boolean; createdAt?: string; image?: string | null } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState({ type: "", text: "" });

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [image, setImage] = React.useState<string | null>(null);
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);
  const [mfaSetup, setMfaSetup] = React.useState({ isOpen: false, qrCode: "", secret: "" });
  const [mfaCode, setMfaCode] = React.useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setUser(d.user);
          setName(d.user.name || "");
          setEmail(d.user.email || "");
          setImage(d.user.image || null);
          // Set initial MFA status if available
        } else {
          router.push("/login");
        }
      })
      .finally(() => setLoading(false));
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
        // Update local user state
        const updatedUser = { ...user, name, image };
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
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
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-np-gold" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight uppercase">Operator <span className="text-np-gold">Profile</span></h1>
            <p className="label-category text-muted-foreground mt-1">Manage your system credentials and authorization level.</p>
          </div>
          <Link href="/dashboard" className="np-btn-outline h-10 px-4 text-[12px]">
            Return to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Col: Identity Card */}
          <div className="md:col-span-1 space-y-6">
            <Card className="p-6 text-center space-y-4">
              <div className="relative group mx-auto w-24">
                <div className="h-24 w-24 rounded-full overflow-hidden border-2 border-np-gold/20 flex items-center justify-center bg-np-gold/10 text-np-gold text-3xl font-bold">
                  {image ? (
                    <Image src={image} alt="Avatar" width={96} height={96} className="w-full h-full object-cover" />
                  ) : user?.email ? (
                    <Image src={getGravatarUrl(user.email!)} alt="Avatar" width={96} height={96} className="w-full h-full object-cover" />
                  ) : (
                    name?.[0] || "?"
                  )}
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-1.5 bg-np-ink border border-border rounded-full text-muted-foreground hover:text-np-gold transition-colors shadow-xl"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageChange}
                />
              </div>
              <div>
                <h2 className="text-lg font-bold uppercase truncate">{name || "Unnamed Unit"}</h2>
                <div className="flex items-center justify-center gap-2 mt-1">
                  <p className="label-category text-[10px] text-np-gold">{user?.role} · {user?.plan} TIER</p>
                  {user?.emailVerified ? (
                    <Badge variant="success" className="h-4 px-1.5 text-[8px] uppercase tracking-tighter">Verified</Badge>
                  ) : (
                    <Badge variant="danger" className="h-4 px-1.5 text-[8px] uppercase tracking-tighter">Unverified</Badge>
                  )}
                </div>
              </div>
              <div className="pt-4 border-t border-border space-y-3 text-left">
                <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate">{email}</span>
                </div>
                <div className="flex items-center gap-3 text-[12px] text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-np-gold/5 border-np-gold/20 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-2 opacity-10 pointer-events-none">
                <ShieldCheck className="h-20 w-20" />
              </div>
              <div className="flex items-center gap-3 mb-4 text-np-gold relative z-10">
                <ShieldCheck className="h-5 w-5" />
                <h3 className="text-[13px] font-bold uppercase">System Tier</h3>
              </div>
              
              {user?.plan === 'BUSINESS' ? (
                <div className="space-y-4 relative z-10">
                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                    You have achieved the <span className="text-np-gold font-bold">OPERATIONAL PEAK</span>. Your account is authorized for maximum infrastructure throughput and unlimited optimization signals.
                  </p>
                  <div className="p-3 bg-np-gold/10 rounded-ui border border-np-gold/20 flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-np-gold animate-pulse" />
                    <span className="text-[10px] uppercase font-bold text-np-gold">All Limits Unlocked</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 relative z-10">
                  <p className="text-[13px] text-muted-foreground leading-relaxed">
                    You are currently operating on the <span className="text-np-gold font-bold">{user?.plan}</span> protocol. Upgrade to expand your monitoring perimeter.
                  </p>
                  <Button 
                    onClick={() => {
                      const pricingSection = document.getElementById('pricing-deck');
                      pricingSection?.scrollIntoView({ behavior: 'smooth' });
                    }} 
                    variant="outline" 
                    className="w-full text-[11px] uppercase tracking-widest h-9"
                  >
                    View Upgrade Tiers
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Right Col: Settings */}
          <div className="md:col-span-2 space-y-6">
            <Card className="p-8">
              <h3 className="text-[14px] font-bold uppercase mb-6 flex items-center gap-2">
                <User className="h-4 w-4 text-np-gold" />
                Personal Identity
              </h3>
              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                    message.type === "success" ? "bg-np-teal/10 text-np-teal border border-np-teal/20" : "bg-np-crimson/10 text-np-crimson border border-np-crimson/20"
                  )}>
                    {message.text}
                  </div>
                )}

                <Button type="submit" disabled={saving} className="w-full sm:w-auto px-10 h-11 uppercase tracking-widest text-[11px]">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
                </Button>
              </form>
            </Card>

            <Card className="p-8">
              <h3 className="text-[14px] font-bold uppercase mb-6 flex items-center gap-2">
                <Key className="h-4 w-4 text-np-gold" />
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
              }} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2 relative">
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
                  <div className="space-y-2">
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
                <Button type="submit" disabled={saving} variant="outline" className="w-full sm:w-auto px-10 h-11 uppercase tracking-widest text-[11px]">
                  Update Password
                </Button>
              </form>
            </Card>

            <Card className="p-8">
              <h3 className="text-[14px] font-bold uppercase mb-6 flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-np-gold" />
                Advanced Protection
              </h3>
              <div className="space-y-4">
                {!user?.emailVerified && (
                  <div className="p-4 bg-np-crimson/5 border border-np-crimson/20 rounded-ui flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-5 w-5 text-np-crimson" />
                      <div>
                        <p className="text-[12px] font-bold uppercase text-np-crimson">Email Unverified</p>
                        <p className="text-[11px] text-muted-foreground">Verify your email to secure your account and enable all features.</p>
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
                      className="h-8 text-[10px] uppercase border-np-crimson/30 hover:bg-np-crimson/10 text-np-crimson"
                    >
                      Resend Link
                    </Button>
                  </div>
                )}
                <div className="p-4 bg-muted/40 rounded-ui border border-dashed border-border flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-np-slate" />
                      <div>
                        <p className="text-[12px] font-bold uppercase">Multi-Factor Auth (MFA)</p>
                        <p className="text-[10px] text-muted-foreground">High-security layer for your account access.</p>
                      </div>
                    </div>
                    {user?.twoFactorEnabled ? (
                      <Badge variant="success" className="text-[8px] uppercase">Enabled</Badge>
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
                        className="h-8 text-[10px] uppercase"
                      >
                        Setup MFA
                      </Button>
                    )}
                  </div>

                  {mfaSetup.isOpen && (
                    <div className="p-4 bg-background border border-border rounded-ui space-y-4 animate-in fade-in slide-in-from-top-2">
                      <p className="text-[11px] text-muted-foreground text-center">Scan this QR code with your Authenticator app.</p>
                      <div className="bg-white p-2 w-32 h-32 mx-auto rounded-md">
                        <img src={mfaSetup.qrCode} alt="MFA QR Code" className="w-full h-full" />
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
                                  setUser({ ...user!, twoFactorEnabled: true });
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
                            className="px-6 h-10 text-[10px] uppercase"
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
            </Card>
          </div>
        </div>
        </div>

        {/* Pricing Deck Section */}
        <div id="pricing-deck" className="pt-12 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold uppercase tracking-tight">Infrastructure <span className="text-np-gold">Tiers</span></h2>
            <p className="text-muted-foreground text-[12px] uppercase tracking-widest">Select your operational authorization level</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* FREE TIER */}
            <Card className={cn(
              "p-8 flex flex-col justify-between border-t-4 transition-all hover:scale-[1.02]",
              user?.plan === 'FREE' ? "border-t-np-gold bg-np-gold/5" : "border-t-border hover:border-t-np-gold/40"
            )}>
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold uppercase">Basic Protocol</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold">$0</span>
                    <span className="text-muted-foreground text-[12px]">/month</span>
                  </div>
                </div>
                <ul className="space-y-3">
                  {['3 Active Monitors', '15m Check Frequency', 'Basic Email Alerts', 'Global SOC Access'].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-[12px] text-muted-foreground">
                      <div className="h-1 w-1 rounded-full bg-np-gold" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <Button 
                disabled={user?.plan === 'FREE'} 
                variant={user?.plan === 'FREE' ? "outline" : "default"}
                className="mt-8 w-full uppercase tracking-widest text-[10px] h-10"
              >
                {user?.plan === 'FREE' ? "Current Protocol" : "Downgrade"}
              </Button>
            </Card>

            {/* PRO TIER */}
            <Card className={cn(
              "p-8 flex flex-col justify-between border-t-4 transition-all hover:scale-[1.02] relative",
              user?.plan === 'PRO' ? "border-t-np-gold bg-np-gold/5" : "border-t-np-gold bg-np-gold/5"
            )}>
              <div className="absolute top-4 right-4">
                <Badge variant="outline" className="text-[8px] bg-np-gold/10 text-np-gold border-np-gold/20">Recommended</Badge>
              </div>
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold uppercase">Advanced Ops</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold">$29</span>
                    <span className="text-muted-foreground text-[12px]">/month</span>
                  </div>
                </div>
                <ul className="space-y-3">
                  {['25 Active Monitors', '1m Check Frequency', 'Priority Push Alerts', 'Advanced MFA Security', 'Team Collaboration'].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-[12px] text-white/80">
                      <div className="h-1 w-1 rounded-full bg-np-gold" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <Button 
                disabled={user?.plan === 'PRO'}
                onClick={async () => {
                  setSaving(true);
                  try {
                    const res = await fetch("/api/billing/portal");
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                    else setMessage({ type: "error", text: "Store activation pending." });
                  } catch {
                    setMessage({ type: "error", text: "Sync failed." });
                  } finally {
                    setSaving(false);
                  }
                }}
                className="mt-8 w-full uppercase tracking-widest text-[10px] h-11 bg-np-gold text-black hover:bg-np-gold/90"
              >
                {user?.plan === 'PRO' ? "Current Protocol" : "Upgrade to Pro"}
              </Button>
            </Card>

            {/* BUSINESS TIER */}
            <Card className={cn(
              "p-8 flex flex-col justify-between border-t-4 transition-all hover:scale-[1.02]",
              user?.plan === 'BUSINESS' ? "border-t-np-gold bg-np-gold/5 border-np-gold/40" : "border-t-border"
            )}>
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold uppercase">Business Peak</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold">$99</span>
                    <span className="text-muted-foreground text-[12px]">/month</span>
                  </div>
                </div>
                <ul className="space-y-3">
                  {['Unlimited Monitors', '30s Check Frequency', 'White-label Reports', 'Direct SMS Routing', 'Dedicated Infrastructure'].map((f) => (
                    <li key={f} className="flex items-center gap-2 text-[12px] text-muted-foreground">
                      <div className="h-1 w-1 rounded-full bg-np-gold" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <Button 
                disabled={user?.plan === 'BUSINESS'}
                variant={user?.plan === 'BUSINESS' ? "outline" : "default"}
                className="mt-8 w-full uppercase tracking-widest text-[10px] h-10"
              >
                {user?.plan === 'BUSINESS' ? "Current Protocol" : "Deploy Enterprise"}
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

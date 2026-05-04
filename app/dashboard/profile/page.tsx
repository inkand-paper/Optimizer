"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Input, Badge } from "@/components/ui-elements";
import { User, Shield, Mail, Calendar, Key, ShieldCheck, Loader2, Camera, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getGravatarUrl } from "@/lib/gravatar";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = React.useState<{ name?: string; email?: string; role?: string; plan?: string; emailVerified?: boolean; createdAt?: string; image?: string } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState({ type: "", text: "" });

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [image, setImage] = React.useState<string | null>(null);
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
                    <img src={image} alt="Avatar" className="w-full h-full object-cover" />
                  ) : user?.email ? (
                    <img src={getGravatarUrl(user.email!)} alt="Avatar" className="w-full h-full object-cover" />
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
                  <span>Joined {new Date(user?.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-np-gold/5 border-np-gold/20">
              <div className="flex items-center gap-3 mb-4 text-np-gold">
                <ShieldCheck className="h-5 w-5" />
                <h3 className="text-[13px] font-bold uppercase">System Tier</h3>
              </div>
              <p className="text-[13px] text-muted-foreground leading-relaxed mb-4">
                You are currently on the <span className="text-np-gold font-bold">{user?.plan}</span> plan. Upgrade for higher infrastructure limits.
              </p>
              <Button onClick={() => window.dispatchEvent(new CustomEvent('open-pricing'))} variant="outline" className="w-full text-[11px] uppercase tracking-widest h-9">
                Manage Subscription
              </Button>
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
                Authentication Settings
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
                    <Button variant="outline" size="sm" className="h-8 text-[10px] uppercase border-np-crimson/30 hover:bg-np-crimson/10 text-np-crimson">Resend Link</Button>
                  </div>
                )}
                <div className="p-4 bg-muted/40 rounded-ui border border-dashed border-border flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-np-slate" />
                    <div>
                      <p className="text-[12px] font-bold uppercase">Multi-Factor Auth</p>
                      <p className="text-[10px] text-muted-foreground">Disabled for this account</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="opacity-50" disabled>Enable</Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

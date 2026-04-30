"use client";

import * as React from "react";
import { Navbar } from "@/components/navbar";
import { Users, Shield, Zap, Search, ArrowLeft, Trash2, UserCheck, ShieldAlert } from "lucide-react";
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

export default function AdminPortal() {
  const [users, setUsers] = React.useState<AdminUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users", { credentials: 'include' });
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch (err) {
      console.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const updateUser = async (userId: string, data: any) => {
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
    } catch (err) {
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
    } catch (err) {
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

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="px-6 py-4 label-category text-muted-foreground">Unit Identity</th>
                  <th className="px-6 py-4 label-category text-muted-foreground">Tier / Authorization</th>
                  <th className="px-6 py-4 label-category text-muted-foreground text-center">Infrastructure Status</th>
                  <th className="px-6 py-4 label-category text-muted-foreground">Activation Date</th>
                  <th className="px-6 py-4 label-category text-muted-foreground text-right">Overrides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/20 transition-all group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-ui bg-np-gold/10 border border-np-gold/20 flex items-center justify-center text-np-gold font-bold text-lg uppercase">
                          {user.name?.[0] || user.email[0]}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold uppercase tracking-tight mb-0.5">{user.name || "UNIDENTIFIED UNIT"}</p>
                          <p className="text-[11px] text-muted-foreground font-mono">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <select 
                          value={user.plan}
                          onChange={(e) => updateUser(user.id, { plan: e.target.value })}
                          disabled={updatingId === user.id}
                          className="text-[10px] font-semibold uppercase tracking-widest px-2 py-1.5 rounded bg-muted border border-border focus:border-np-gold transition-all outline-none"
                        >
                          <option value="FREE">Standard</option>
                          <option value="PRO">Optimizer Pro</option>
                          <option value="BUSINESS">Agency Elite</option>
                        </select>
                        <select 
                          value={user.role}
                          onChange={(e) => updateUser(user.id, { role: e.target.value })}
                          disabled={updatingId === user.id}
                          className="text-[10px] font-semibold uppercase tracking-widest px-2 py-1.5 rounded bg-np-gold/10 text-np-gold border border-np-gold/20 transition-all outline-none"
                        >
                          <option value="DEVELOPER">Operator</option>
                          <option value="ADMIN">Command</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center justify-center gap-6">
                          <div className="flex flex-col items-center">
                            <span className="text-[12px] font-mono font-semibold text-foreground mb-0.5">{user._count.monitors}</span>
                            <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Assets</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[12px] font-mono font-semibold text-foreground mb-0.5">{user._count.apiKeys}</span>
                            <span className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground">Keys</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-[11px] font-mono font-semibold text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button 
                         onClick={() => deleteUser(user.id)}
                         disabled={updatingId === user.id}
                         className="p-2 text-muted-foreground hover:text-np-crimson transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                         title="Decommission Unit"
                       >
                          <Trash2 className="h-4 w-4" />
                       </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  );
}

"use client";

import * as React from "react";
import { Navbar } from "@/components/navbar";
import { Users, Shield, Zap, Search, ArrowLeft, Trash2, UserCheck, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
    <div className="min-h-screen flex flex-col bg-white dark:bg-black">
      <Navbar />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-12 md:py-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-8">
          <div>
            <Link href="/dashboard" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 hover:text-blue-600 mb-4 transition-all group">
              <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
              <span>Return to Mission Control</span>
            </Link>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-zinc-900 dark:text-white uppercase leading-none">
              Executive <br />
              <span className="text-blue-600">Administration</span>
            </h1>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-4">Manage global user access, infrastructure tiers, and system scaling.</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="bg-white dark:bg-zinc-950 p-6 rounded-md border border-zinc-200 dark:border-zinc-800 shadow-xl min-w-[200px]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-2 border-b border-zinc-100 dark:border-zinc-900 pb-2">Total Authorized Units</p>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-blue-600" />
                  <p className="text-4xl font-black text-zinc-900 dark:text-white leading-none tracking-tighter">{users.length}</p>
                </div>
             </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 rounded-md border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
          
          <div className="p-8 border-b border-zinc-100 dark:border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-6 bg-zinc-50/50 dark:bg-zinc-900/20 relative z-10">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="SEARCH OPERATOR (EMAIL/IDENTITY)..."
                className="w-full pl-12 pr-4 h-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button 
              onClick={fetchUsers} 
              className="h-12 w-12 flex items-center justify-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md hover:text-blue-600 transition-all shadow-sm"
            >
               <Zap className={cn("h-5 w-5 text-zinc-400 transition-all", loading && "animate-spin text-blue-600")} />
            </button>
          </div>

          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-100 dark:border-zinc-900">
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Unit Identity</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Tier / Authorization</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-center">Infrastructure Status</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Activation Date</th>
                  <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 text-right">Overrides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-all group">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-md bg-blue-600 flex items-center justify-center text-white font-black text-xs uppercase shadow-lg shadow-blue-500/20">
                          {user.name?.[0] || user.email[0]}
                        </div>
                        <div>
                          <p className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-0.5">{user.name || "UNIDENTIFIED UNIT"}</p>
                          <p className="text-[10px] text-zinc-400 font-bold tracking-widest">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <select 
                          value={user.plan}
                          onChange={(e) => updateUser(user.id, { plan: e.target.value })}
                          disabled={updatingId === user.id}
                          className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-sm bg-zinc-100 dark:bg-zinc-900 border border-transparent focus:border-blue-600 transition-all"
                        >
                          <option value="FREE">Standard</option>
                          <option value="PRO">Optimizer Pro</option>
                          <option value="BUSINESS">Agency Elite</option>
                        </select>
                        <select 
                          value={user.role}
                          onChange={(e) => updateUser(user.id, { role: e.target.value })}
                          disabled={updatingId === user.id}
                          className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-sm bg-blue-600 text-white border-none shadow-lg shadow-blue-500/10"
                        >
                          <option value="DEVELOPER">Operator</option>
                          <option value="ADMIN">Command</option>
                        </select>
                      </div>
                    </td>
                    <td className="p-6">
                       <div className="flex items-center justify-center gap-6 text-zinc-500">
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black text-zinc-900 dark:text-white mb-0.5">{user._count.monitors}</span>
                            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Assets</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-black text-zinc-900 dark:text-white mb-0.5">{user._count.apiKeys}</span>
                            <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Keys</span>
                          </div>
                       </div>
                    </td>
                    <td className="p-6">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                        {new Date(user.createdAt).toLocaleDateString([], { month: 'short', day: '2-digit', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="p-6 text-right">
                       <button 
                         onClick={() => deleteUser(user.id)}
                         disabled={updatingId === user.id}
                         className="h-10 w-10 flex items-center justify-center text-zinc-200 hover:text-white hover:bg-red-600 rounded-md transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50 border border-transparent hover:border-red-700"
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
        </div>
      </main>
    </div>
  );
}

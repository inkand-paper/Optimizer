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
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`
        },
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
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
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
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      
      <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/dashboard" className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-white mb-2 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </Link>
            <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">Admin Control Panel</h1>
            <p className="text-zinc-500">Manage user access, tiers, and system growth.</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Total Users</p>
                <p className="text-2xl font-black text-blue-600 leading-none">{users.length}</p>
             </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Search users by email or name..."
                className="w-full pl-10 pr-4 py-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 border border-transparent focus:border-blue-600/50 transition-all"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button onClick={fetchUsers} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
               <Zap className={cn("h-4 w-4 text-zinc-400", loading && "animate-spin")} />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-100 dark:border-zinc-800">
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">User</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Status</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Activity</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400">Joined</th>
                  <th className="p-4 text-[10px] font-black uppercase tracking-widest text-zinc-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors group">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-blue-600/10 flex items-center justify-center text-blue-600 font-black text-sm uppercase">
                          {user.name?.[0] || user.email[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-zinc-900 dark:text-white leading-none mb-1">{user.name || "Anonymous User"}</p>
                          <p className="text-xs text-zinc-500 font-mono">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1.5">
                        <select 
                          value={user.plan}
                          onChange={(e) => updateUser(user.id, { plan: e.target.value })}
                          disabled={updatingId === user.id}
                          className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border-none focus:ring-2 focus:ring-blue-600"
                        >
                          <option value="FREE">Free</option>
                          <option value="PRO">Pro</option>
                          <option value="BUSINESS">Business</option>
                        </select>
                        <select 
                          value={user.role}
                          onChange={(e) => updateUser(user.id, { role: e.target.value })}
                          disabled={updatingId === user.id}
                          className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 border-none focus:ring-2 focus:ring-blue-600"
                        >
                          <option value="DEVELOPER">Developer</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      </div>
                    </td>
                    <td className="p-4 text-xs">
                       <div className="flex items-center gap-4 text-zinc-500">
                          <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> {user._count.monitors}</span>
                          <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> {user._count.apiKeys}</span>
                       </div>
                    </td>
                    <td className="p-4 text-xs text-zinc-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                       <button 
                         onClick={() => deleteUser(user.id)}
                         disabled={updatingId === user.id}
                         className="p-2 text-zinc-300 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50"
                         title="Delete User"
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

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ShieldCheck, 
  History, 
  Plus, 
  Loader2, 
  GitBranch, 
  FolderArchive, 
  Terminal,
  Clock,
  Search,
  Trash2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, Badge, Button, Input, StatusDot } from "@/components/ui-elements";

type TabType = "github" | "zip" | "paste";

interface ReviewSummary {
  id: string;
  source: "GITHUB" | "ZIP" | "PASTE";
  repoName?: string;
  fileName?: string;
  score?: number;
  status: "PROCESSING" | "COMPLETED" | "FAILED";
  createdAt: string;
}

function scoreColor(score: number) {
  if (score >= 90) return "text-np-teal";
  if (score >= 75) return "text-blue-400";
  if (score >= 60) return "text-np-gold";
  if (score >= 45) return "text-orange-400";
  return "text-np-crimson";
}

export function CodeAuditConsole() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [reviews, setReviews] = React.useState<ReviewSummary[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState("");
  const [success, setSuccess] = React.useState("");
  const [usage, setUsage] = React.useState(0);
  const [limit, setLimit] = React.useState(3);
  const [tab, setTab] = React.useState<TabType>("github");
  const [githubConnected, setGithubConnected] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [repoName, setRepoName] = React.useState("");
  const [branch, setBranch] = React.useState("main");
  const [pasteCode, setPasteCode] = React.useState("");
  const [pasteFileName, setPasteFileName] = React.useState("main.ts");
  const [zipFile, setZipFile] = React.useState<File | null>(null);
  const [logs, setLogs] = React.useState<{ msg: string; type: string }[]>([]);

  React.useEffect(() => {
    loadReviews();
    const github = searchParams.get("github");
    if (github === "connected") setGithubConnected(true);
  }, [searchParams]);

  async function loadReviews() {
    setLoading(true);
    try {
      const [reviewRes, userRes] = await Promise.all([
        fetch("/api/code-review", { credentials: "include" }),
        fetch("/api/auth/me", { credentials: "include" })
      ]);

      const reviewData = await reviewRes.json();
      const userData = await userRes.json();

      setReviews(reviewData.reviews ?? []);
      setUsage(reviewData.usage ?? 0);
      setLimit(reviewData.limit ?? 3);

      if (userData.success && userData.user.githubUserName) {
        setGithubConnected(true);
      } else if (reviewData.reviews?.some((r: ReviewSummary) => r.source === "GITHUB")) {
        setGithubConnected(true);
      }
    } catch {
      setError("Sync failed");
    } finally {
      setLoading(false);
    }
  }

  async function deleteReview(id: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Remove this audit record?")) return;

    try {
      const res = await fetch(`/api/code-review/${id}`, { method: "DELETE" });
      if (res.ok) {
        // Optimistic UI update
        setReviews(prev => prev.filter(r => r.id !== id));
        // Force background sync to update usage counters etc
        loadReviews();
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  }

  async function submitReview() {
    setError(""); setSuccess(""); setSubmitting(true); setLogs([]);
    const startTime = Date.now();
    try {
      let res: Response;
      const body = tab === "github" 
        ? { source: "GITHUB", repoName: repoName.trim(), branch: branch.trim() } 
        : { source: "PASTE", code: pasteCode, fileName: pasteFileName.trim() };

      if (tab === "zip" && zipFile) {
        const formData = new FormData();
        formData.append("file", zipFile);
        res = await fetch("/api/code-review", { method: "POST", body: formData, credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Audit failed");
        router.push(`/dashboard/code-review/${data.review.id}`);
        return;
      }

      const response = await fetch("/api/code-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        credentials: "include"
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("Connection failed");

      // ─── Buffered SSE Parser (Handles split chunks) ───────────────────────
      let buffer = "";
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        // Keep the last incomplete line in the buffer
        buffer = lines.pop() ?? "";
        
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.log) {
                setLogs(prev => [...prev, { msg: data.log, type: data.type || "info" }]);
              }
              if (data.done && data.review) {
                const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
                setSuccess(`Neural Audit Complete · ${elapsed}s`);
                setTimeout(() => router.push(`/dashboard/code-review/${data.review.id}`), 1500);
              }
            } catch {
              // Ignore malformed partial chunks
            }
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Connection refused");
    } finally {
      setSubmitting(false);
    }
  }

  const isUnlimited = limit > 1000 || limit === -1;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h2 className="text-[20px] font-bold tracking-tight">Neural Command</h2>
            <p className="label-category text-[10px] uppercase tracking-widest">Universal Source Analysis Engine</p>
         </div>
         <div className="flex items-center gap-4 bg-muted/20 px-4 py-2 rounded-ui border border-border">
            <span className="label-category text-[10px]">Cycles Used</span>
            <span className="text-[14px] font-bold tabular-nums">{isUnlimited ? `${usage} / ∞` : `${usage} / ${limit}`}</span>
         </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
         <div className="xl:col-span-4 space-y-4">
            <Card className="overflow-hidden shadow-sm">
               <div className="flex bg-muted/30" style={{ borderBottom: "0.5px solid var(--border)" }}>
                  {(["github", "zip", "paste"] as TabType[]).map((t) => (
                    <button key={t} onClick={() => setTab(t)} className={cn("flex-1 py-3 text-[10px] font-black uppercase tracking-widest transition-all", tab === t ? "text-np-gold bg-background" : "text-muted-foreground/40 hover:bg-muted")}>
                      {t}
                    </button>
                  ))}
               </div>
               <div className="p-6 space-y-6">
                  <div className="min-h-[140px]">
                    {tab === "github" && (
                      <div className="space-y-4 animate-in fade-in duration-300">
                         {!githubConnected ? (
                           <Button onClick={() => window.location.href = "/api/auth/github-connect"} variant="outline" className="w-full h-11 text-[11px] font-semibold">Sync GitHub</Button>
                         ) : (
                           <>
                             <div>
                               <label className="label-category text-[10px] block mb-1.5">Repository</label>
                               <Input placeholder="owner/repo" value={repoName} onChange={(e) => setRepoName(e.target.value)} />
                             </div>
                             <div>
                               <label className="label-category text-[10px] block mb-1.5">Branch</label>
                               <Input placeholder="main" value={branch} onChange={(e) => setBranch(e.target.value)} className="font-mono" />
                             </div>
                           </>
                         )}
                      </div>
                    )}
                    {tab === "zip" && (
                      <div onClick={() => fileInputRef.current?.click()} className="h-32 border-2 border-dashed border-border rounded-ui flex flex-col items-center justify-center cursor-pointer hover:bg-muted/30 transition-all">
                         <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => setZipFile(e.target.files?.[0] ?? null)} />
                         <Plus className="h-6 w-6 mb-2 opacity-20" />
                         <p className="text-[12px] font-medium text-muted-foreground">{zipFile ? zipFile.name : "Inject Archive"}</p>
                      </div>
                    )}
                    {tab === "paste" && (
                      <div className="space-y-4 animate-in fade-in duration-300">
                         <Input placeholder="filename.ts" value={pasteFileName} onChange={(e) => setPasteFileName(e.target.value)} className="font-mono" />
                         <textarea value={pasteCode} onChange={(e) => setPasteCode(e.target.value)} placeholder="// Source stream..." className="w-full bg-muted/10 border border-border rounded-ui p-4 font-mono text-[11px] min-h-[120px] outline-none focus:border-np-gold/30 transition-all" />
                      </div>
                    )}
                  </div>

                  {error && <p className="text-[11px] text-np-crimson font-medium bg-np-crimson/5 p-3 rounded-ui border border-np-crimson/10">{error}</p>}
                  
                  <Button onClick={submitReview} disabled={submitting || (!isUnlimited && usage >= limit)} className={cn("w-full h-11 text-[11px] font-bold", submitting ? "animate-pulse" : "")}>
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Start Audit"}
                  </Button>

                  {(submitting || logs.length > 0) && (
                    <div className="bg-black/90 rounded-ui border border-border p-4 font-mono text-[10px] space-y-1.5 h-[180px] overflow-y-auto np-scroll shadow-inner">
                       {logs.length === 0 && <p className="text-muted-foreground animate-pulse">Establishing neural link...</p>}
                       {logs.map((log, i) => (
                         <div key={i} className={cn("flex gap-3", log.type === "error" ? "text-np-crimson" : log.type === "success" ? "text-emerald-400" : "text-muted-foreground")}>
                           <span className="opacity-30">[{new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
                           <span className="flex-1 leading-relaxed">{log.msg}</span>
                         </div>
                       ))}
                    </div>
                  )}
               </div>
            </Card>
         </div>

         <div className="xl:col-span-8 space-y-4">
            <div className="flex items-center justify-between mb-2">
               <h3 className="text-[12px] font-semibold flex items-center gap-2">
                 <History className="h-3.5 w-3.5 text-np-gold/60" /> Registry Archives
               </h3>
               <button onClick={loadReviews} className="text-[10px] font-semibold text-muted-foreground/40 hover:text-foreground transition-all">Refresh</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {loading ? [1,2,3,4].map(i => <div key={i} className="h-32 bg-muted/10 rounded-ui animate-pulse border border-border" />) : reviews.length === 0 ? (
                 <Card className="col-span-full p-20 text-center border-dashed border-border bg-transparent"><p className="text-[12px] text-muted-foreground/40">No audits found</p></Card>
               ) : reviews.map((r) => (
                 <div key={r.id} className="relative group">
                   {/* Delete Button - Outside the Link to avoid swallowing events */}
                   <button 
                     onClick={(e) => deleteReview(r.id, e)}
                     className="absolute top-3 right-3 p-2 rounded-md bg-np-obsidian/80 border border-border/50 text-np-crimson hover:bg-np-crimson hover:text-white transition-all z-30 shadow-lg"
                     title="Remove Archive"
                   >
                     <Trash2 className="h-3.5 w-3.5" />
                   </button>

                   <Link href={`/dashboard/code-review/${r.id}`}>
                     <Card className="p-5 hover:bg-muted/30 transition-all border-border h-full flex flex-col justify-between overflow-hidden relative">
                        <div className="flex justify-between items-start mb-6 pr-10">
                           <div className="h-10 w-10 rounded-ui bg-muted flex items-center justify-center text-muted-foreground/60 group-hover:text-np-gold transition-colors">
                              {r.source === "GITHUB" ? <GitBranch className="h-5 w-5" /> : r.source === "ZIP" ? <FolderArchive className="h-5 w-5" /> : <Terminal className="h-5 w-5" />}
                           </div>
                           <Badge variant={r.status === "COMPLETED" ? "outline" : "warning"} className="text-[9px] px-2 py-0.5 tracking-widest">{r.status}</Badge>
                        </div>
                        <div>
                          <h4 className="text-[15px] font-semibold truncate text-foreground/80 group-hover:text-foreground mb-1 pr-12">{r.repoName ?? r.fileName ?? "Source Node"}</h4>
                          <p className="label-category text-[9px] uppercase tracking-widest opacity-60">{r.source} Interface</p>
                        </div>
                        <div className="pt-5 mt-5 border-t border-border flex items-center justify-between">
                           <div className="flex items-center gap-2 opacity-40">
                              <Clock className="h-3 w-3" />
                              <span className="text-[10px] font-mono">{new Date(r.createdAt).toLocaleDateString()}</span>
                           </div>
                           {r.score && <span className={cn("text-2xl font-black tracking-tighter", scoreColor(r.score))}>{r.score}</span>}
                        </div>
                     </Card>
                   </Link>
                 </div>
               ))}
            </div>
         </div>
      </div>
    </div>
  );
}

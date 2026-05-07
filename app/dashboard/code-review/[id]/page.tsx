"use client";

import * as React from "react";
import Link from "next/link";
import { 
  ChevronLeft, 
  ShieldCheck, 
  Zap, 
  FileCode, 
  Lock, 
  Sparkles, 
  Wrench, 
  Info,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  ArrowRight,
  Loader2,
  Shield
} from "lucide-react";
import type { CodeReviewResult, LineIssue, FileReview } from "@/core/analyzer/code-review";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui-elements";
import { ThemeToggle } from "@/components/theme-toggle";

// ─── Constants ────────────────────────────────────────────────────────────────


// ─── Helpers ──────────────────────────────────────────────────────────────────

function scoreColor(score: number) {
  if (score >= 90) return "text-np-teal";
  if (score >= 75) return "text-blue-400";
  if (score >= 60) return "text-np-gold";
  if (score >= 45) return "text-orange-400";
  return "text-np-crimson";
}

function scoreBg(score: number) {
  if (score >= 90) return "bg-np-teal/5 border-np-teal/10";
  if (score >= 75) return "bg-blue-500/5 border-blue-500/10";
  if (score >= 60) return "bg-np-gold/5 border-np-gold/10";
  if (score >= 45) return "bg-orange-500/5 border-orange-500/10";
  return "bg-np-crimson/5 border-np-crimson/10";
}

function severityBadge(severity: LineIssue["severity"]) {
  const map = {
    critical: "bg-np-crimson/20 text-np-crimson border-np-crimson/30",
    warning: "bg-np-gold/20 text-np-gold border-np-gold/30",
    info: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  };
  return map[severity];
}

function categoryIcon(cat: LineIssue["category"]) {
  switch (cat) {
    case "security": return <Lock className="h-4 w-4" />;
    case "performance": return <Zap className="h-4 w-4" />;
    case "best-practice": return <Sparkles className="h-4 w-4" />;
    case "refactor": return <Wrench className="h-4 w-4" />;
    default: return <Info className="h-4 w-4" />;
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ScoreRing({ score }: { score: number }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle className="text-muted/10" strokeWidth="8" stroke="currentColor" fill="transparent" r={radius} cx="50" cy="50" />
        <circle className={cn("transition-all duration-1000 ease-out", scoreColor(score).replace('text-', 'stroke-'))} strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" stroke="currentColor" fill="transparent" r={radius} cx="50" cy="50" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn("text-[20px] font-black tabular-nums tracking-tighter", scoreColor(score))}>{score}</span>
      </div>
    </div>
  );
}

function CategoryCard({ label, cat, data }: {
  label: string;
  cat: LineIssue["category"];
  data?: { score: number; issueCount: number; critical: number };
}) {
  const score = data?.score ?? 0;
  const issueCount = data?.issueCount ?? 0;
  const critical = data?.critical ?? 0;

  return (
    <Card className={cn("p-4 border border-border bg-card/20 group h-full", scoreBg(score))}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-muted/40 border border-border">
            {categoryIcon(cat)}
          </div>
          <span className="text-[12px] font-semibold text-foreground/80">{label}</span>
        </div>
        <span className={cn("text-[18px] font-bold tracking-tight", scoreColor(score))}>{score}</span>
      </div>
      <div className="h-1 bg-muted/40 rounded-full overflow-hidden mb-4">
        <div className={cn("h-full transition-all duration-1000", scoreColor(score).replace('text-', 'bg-'))} style={{ width: `${score}%` }} />
      </div>
      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
        <span>{issueCount} Items</span>
        {critical > 0 && <span className="text-np-crimson">{critical} Critical</span>}
      </div>
    </Card>
  );
}

function IssueCard({ issue }: { issue: LineIssue & { filePath?: string } }) {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <Card className="overflow-hidden border border-border bg-card/10 hover:bg-card/20 transition-all">
      <button onClick={() => setExpanded((v) => !v)} className="w-full text-left p-4 flex items-start gap-4 hover:bg-muted/10 transition-all">
        <div className={cn("h-9 w-9 rounded-lg border border-border flex items-center justify-center shrink-0 bg-muted/30", scoreColor(issue.severity === 'critical' ? 40 : issue.severity === 'warning' ? 60 : 80))}>
          {categoryIcon(issue.category)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={cn("text-[8px] px-1.5 py-0.5 rounded border border-border font-bold uppercase tracking-widest", severityBadge(issue.severity))}>{issue.severity}</span>
            <span className="label-category text-[9px]">{issue.category}</span>
            {issue.line && <span className="text-[10px] font-mono text-muted-foreground/40 bg-muted/30 px-1.5 py-0.5 rounded">L{issue.line}</span>}
          </div>
          <p className="text-[14px] font-medium leading-relaxed text-foreground/80">{issue.message}</p>
        </div>
        <div className="shrink-0 mt-1 opacity-20">
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {expanded && (
        <div className="border-t border-border p-6 space-y-6 bg-muted/5 animate-in slide-in-from-top-1 duration-200">
          <div>
            <p className="label-category text-[10px] mb-2 uppercase tracking-widest">Remediation</p>
            <p className="text-[14px] text-foreground/60 leading-relaxed bg-muted/30 p-4 rounded-ui">{issue.suggestion}</p>
          </div>
          {issue.codeSnippet && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p className="label-category text-[9px] uppercase tracking-widest text-np-crimson/50">Vulnerable Source</p>
                <pre className="np-codeblock text-[11px] bg-np-crimson/5 border-border max-h-[300px]">{issue.codeSnippet}</pre>
              </div>
              {issue.fixedSnippet && (
                <div className="space-y-2">
                  <p className="label-category text-[9px] uppercase tracking-widest text-np-teal/50">Optimized Source</p>
                  <pre className="np-codeblock text-[11px] bg-np-teal/5 border-border max-h-[300px]">{issue.fixedSnippet}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function FileAccordion({ file }: { file: FileReview }) {
  const [open, setOpen] = React.useState(false);

  return (
    <Card className="overflow-hidden border border-border bg-card/10 hover:bg-card/20 transition-all">
      <button onClick={() => setOpen((v) => !v)} className="w-full text-left p-5 flex items-center gap-6 hover:bg-muted/10 transition-all">
        <div className={cn("h-11 w-11 rounded-xl border border-border flex items-center justify-center shrink-0 bg-muted/30", scoreColor(file.score))}>
          <FileCode className="h-6 w-6" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[16px] font-semibold font-mono text-foreground/80 truncate tracking-tight">{file.path}</p>
          <div className="flex items-center gap-4 mt-1">
             <span className="label-category text-[10px]">{file.language}</span>
             <span className="text-[10px] font-bold text-np-gold/60 uppercase tracking-widest flex items-center gap-1.5"><ShieldCheck className="h-3 w-3" /> {file.issues.length} Issues</span>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <div className="text-right">
            <span className={cn("text-2xl font-bold tabular-nums tracking-tighter opacity-80", scoreColor(file.score))}>{file.score}</span>
            <p className="label-category text-[9px] mt-0.5">Purity</p>
          </div>
          <div className="opacity-20">{open ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}</div>
        </div>
      </button>

      {open && (
        <div className="border-t border-border p-8 space-y-8 bg-muted/5 animate-in slide-in-from-top-2 duration-300">
          <div className="max-w-4xl">
             <p className="label-category text-[10px] mb-3 uppercase tracking-widest">Logic Summary</p>
             <p className="text-[15px] text-foreground/50 leading-relaxed font-medium">{file.summary}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             <div className="lg:col-span-4 space-y-4">
                <div className="bg-np-teal/5 border border-border rounded-ui p-6">
                   <p className="label-category text-[10px] mb-4 text-np-teal/60 uppercase tracking-widest flex items-center gap-2"><CheckCircle2 className="h-3 w-3" /> Strengths</p>
                   <ul className="space-y-3">
                     {file.positives.map((p, i) => (
                       <li key={i} className="text-[13px] text-foreground/50 flex gap-3 leading-relaxed">
                         <ArrowRight className="h-3.5 w-3.5 text-np-teal/30 shrink-0 mt-0.5" /> {p}
                       </li>
                     ))}
                   </ul>
                </div>
             </div>
             <div className="lg:col-span-8 space-y-4">
                <p className="label-category text-[10px] mb-2 uppercase tracking-widest text-np-gold/40">Audit Logs</p>
                {file.issues.map((issue, i) => <IssueCard key={i} issue={issue} />)}
             </div>
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReviewResultPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const { id } = unwrappedParams;

  const [result, setResult] = React.useState<CodeReviewResult | null>(null);
  const [reviewMeta, setReviewMeta] = React.useState<{ repoName?: string; fileName?: string; source?: string; createdAt?: string } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"overview" | "files" | "issues">("overview");

  React.useEffect(() => {
    fetch(`/api/code-review/${id}`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        // GET /api/code-review/[id] returns the record directly, not wrapped
        setReviewMeta(data);
        setResult(data.result as CodeReviewResult);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-background"><Loader2 className="h-6 w-6 animate-spin text-np-gold" /></div>;

  const allIssues = (result?.files || []).flatMap((f) => (f.issues || []).map((i) => ({ ...i, filePath: f.path })));
  const criticalCount = allIssues.filter((i) => i.severity === "critical").length;
  const recommendations = result?.recommendations || [];
  const topIssues = result?.topIssues || [];
  const filesReviewed = result?.filesReviewed || 0;
  const overallScore = result?.overallScore || 0;
  const grade = result?.grade || "N/A";

  return (
    <div className="min-h-screen bg-background">
      {/* ── Slim Top Bar ─────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 h-14 flex items-center justify-between px-6 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="flex items-center gap-4">
          <Link href="/dashboard?tab=audits" className="p-2 hover:bg-muted rounded-ui transition-all flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4" />
            <span className="text-[12px] font-medium hidden sm:block">Back to Audits</span>
          </Link>
          <div className="h-4 w-px bg-border hidden sm:block" />
          <div>
            <h1 className="text-[14px] font-semibold leading-tight">{reviewMeta?.repoName || reviewMeta?.fileName || "Neural Audit Result"}</h1>
            <p className="label-category text-[9px] uppercase tracking-widest opacity-60">{reviewMeta?.source} Source Pipeline</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-full bg-muted/30 border border-border flex items-center gap-2">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span className="text-[10px] font-mono text-muted-foreground">
              {reviewMeta?.createdAt ? new Date(reviewMeta.createdAt).toLocaleDateString() : "—"}
            </span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* ── Main Content ─────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto p-6 md:p-10 space-y-10 pb-24">
         {/* Top Summary Card */}
         <div className="flex flex-col lg:flex-row gap-8 items-stretch">
            <div className="flex-1 space-y-6">
                <div className="flex items-center gap-3">
                   <div className="h-10 w-10 rounded-xl bg-np-gold/10 border border-np-gold/20 flex items-center justify-center"><Sparkles className="h-5 w-5 text-np-gold" /></div>
                   <h2 className="text-[20px] font-bold tracking-tight leading-none">Architectural Intelligence</h2>
                </div>
                <p className="text-[16px] text-foreground/50 leading-relaxed font-medium max-w-2xl">{result?.summary}</p>
                <div className="flex flex-wrap gap-8 pt-2">
                   <div className="space-y-1"><p className="label-category text-[10px]">Registry Logs</p><p className="text-xl font-bold tabular-nums">{result?.linesOfCode?.toLocaleString()}</p></div>
                   <div className="space-y-1"><p className="label-category text-[10px]">Stack</p><p className="text-xl font-bold uppercase">{result?.language}</p></div>
                   {criticalCount > 0 && <div className="space-y-1"><p className="label-category text-[10px] text-np-crimson/60">Hazards</p><p className="text-xl font-bold text-np-crimson flex items-center gap-2"><Shield className="h-5 w-5" /> {criticalCount}</p></div>}
                </div>
            </div>
            <Card className="p-8 bg-card/20 border-border flex items-center gap-8 min-w-[280px]">
                <ScoreRing score={overallScore} />
                <div className="text-left">
                   <div className={cn("text-6xl font-bold tracking-tighter leading-none", scoreColor(overallScore))}>{grade}</div>
                   <p className="label-category text-[10px] mt-4 uppercase tracking-[0.2em]">Logical Maturity</p>
                </div>
            </Card>
         </div>

         {/* Metrics Grid */}
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <CategoryCard label="Security"    cat="security"      data={result?.categories?.security} />
            <CategoryCard label="Performance" cat="performance"   data={result?.categories?.performance} />
            <CategoryCard label="Standards"   cat="best-practice" data={result?.categories?.bestPractices} />
            <CategoryCard label="Refactor"    cat="refactor"      data={result?.categories?.refactoring} />
         </div>

         {/* Content Tabs */}
         <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 pt-4">
            <div className="xl:col-span-4 space-y-6">
               <p className="label-category text-[10px] uppercase tracking-widest px-1">Recommendations</p>
               <div className="space-y-4">
                 {recommendations.map((rec, i) => (
                   <Card key={i} className="p-5 bg-card/10 border-border group hover:bg-card/20 transition-all flex gap-4">
                      <span className="text-xl font-bold text-muted-foreground/10 tabular-nums">{(i+1).toString().padStart(2, '0')}</span>
                      <p className="text-[14px] font-medium text-foreground/50 leading-relaxed">{rec}</p>
                   </Card>
                 ))}
               </div>
            </div>
            <div className="xl:col-span-8 space-y-6">
               <div className="flex border-b border-border bg-muted/10 rounded-xl overflow-hidden p-0.5">
                  {(["overview", "files", "issues"] as const).map((t) => (
                    <button key={t} onClick={() => setActiveTab(t)} className={cn("flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all rounded-lg", activeTab === t ? "text-np-gold bg-background shadow-sm" : "text-muted-foreground/40 hover:bg-muted/20")}>
                      {t === "overview" ? `Top (${topIssues.length})` : t === "files" ? `Nodes (${filesReviewed})` : `Registry (${allIssues.length})`}
                    </button>
                  ))}
               </div>
               <div className="space-y-6">
                  {activeTab === "overview" && topIssues.map((issue, i) => <IssueCard key={i} issue={issue} />)}
                  {activeTab === "files" && (result?.files || []).map((file, i) => <FileAccordion key={i} file={file} />)}
                  {activeTab === "issues" && allIssues.map((issue, i) => <IssueCard key={i} issue={issue as (LineIssue & { filePath?: string })} />)}
               </div>
            </div>
         </div>
      </main>
    </div>
  );
}
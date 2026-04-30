import * as React from "react";
import { Card, Button } from "./ui-elements";
import { 
  CheckCircle2, 
  XCircle, 
  Search, 
  ShieldCheck, 
  Zap, 
  Download,
  AlertCircle,
  Globe,
  Lock,
  ArrowRight,
  Sparkles,
  Crown
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalyzeResponse } from "@/lib/types";
import ReactMarkdown from "react-markdown";

interface Props {
  data: AnalyzeResponse;
}

/**
 * [PRODUCTION-GRADE] - Advanced Analysis Report
 * Sovereign Obsidian Aesthetic
 */
export function AnalysisReport({ data }: Props) {
  const { results, success } = data;

  if (!success || !results) {
    return (
      <Card className="p-6 border-red-200 bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <h3 className="font-bold">Scan Failed</h3>
        </div>
        <p className="text-sm mt-2 opacity-80">{(data as any).message || "Could not analyze the website. Please check the URL and your API Key."}</p>
      </Card>
    );
  }

  const { overallScore, sections } = results;

  const downloadReport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-${results.url.replace(/https?:\/\//, '').replace(/\//g, '-')}.json`;
    a.click();
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Summary */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 bg-zinc-900 dark:bg-black rounded-lg text-white overflow-hidden relative border border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="z-10 w-full sm:w-auto">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="h-4 w-4 text-blue-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Universal Domain Audit</span>
          </div>
          <h3 className="text-2xl font-black tracking-tight truncate max-w-full sm:max-w-md">{results.url}</h3>
          <p className="text-xs text-zinc-500 mt-2 font-bold uppercase tracking-widest">Completed: {new Date(data.timestamp).toLocaleString()}</p>
        </div>
        
        <div className="flex items-center justify-between sm:justify-end gap-10 z-10 w-full sm:w-auto">
          <div className="text-center">
            <div className={cn(
              "text-6xl font-black tracking-tighter leading-none",
              overallScore >= 80 ? "text-green-400" : 
              overallScore >= 50 ? "text-yellow-400" : "text-red-400"
            )}>
              {overallScore}
            </div>
            <p className="text-[10px] uppercase font-black tracking-[0.2em] text-zinc-500 mt-2">Health Score</p>
          </div>
          <Button variant="outline" size="sm" onClick={downloadReport} className="bg-white/5 border-white/10 hover:bg-white/10 text-white border-0 h-12 px-6 font-black uppercase tracking-widest text-[10px]">
            <Download className="h-4 w-4 mr-2" /> Export JSON
          </Button>
        </div>
      </div>

      {/* AI Genius Diagnosis Section */}
      {data.aiInsight && (
        <Card className="p-0 overflow-hidden border-blue-200/50 dark:border-blue-500/20 bg-white dark:bg-black relative group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Crown className="h-32 w-32 text-blue-600" />
          </div>
          
          <div className="p-8 relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-md bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/20">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-black text-xl text-zinc-900 dark:text-white uppercase tracking-tight">AI Genius Diagnosis</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">Infrastructure Brief • Gemini 1.5 Flash</p>
              </div>
            </div>

            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div 
                className={cn(
                  "text-zinc-700 dark:text-zinc-300 leading-relaxed text-sm font-medium",
                  "prose-headings:text-zinc-900 dark:prose-headings:text-white prose-headings:font-black prose-headings:mb-3 prose-headings:mt-6",
                  "prose-strong:text-blue-600 dark:prose-strong:text-blue-400 prose-strong:font-black",
                  "prose-ul:list-disc prose-ul:pl-5 prose-ul:space-y-2 prose-li:marker:text-blue-500"
                )}
              >
                <ReactMarkdown>
                  {data.aiInsight}
                </ReactMarkdown>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3 p-4 rounded-md bg-blue-600/5 border border-blue-100 dark:border-blue-500/10">
              <ShieldCheck className="h-4 w-4 text-blue-500" />
              <p className="text-[11px] text-blue-600 dark:text-blue-400 font-black uppercase tracking-wider">
                Universal Infrastructure Briefing Complete.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Upgrade Prompt for Free Users */}
      {!data.aiInsight && (
        <Card className="p-10 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black text-center relative overflow-hidden group">
          <div className="relative z-10 max-w-lg mx-auto">
            <div className="h-14 w-14 rounded-md bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mx-auto mb-6 text-zinc-400 group-hover:text-blue-600 transition-all duration-300">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="font-black text-2xl mb-3 tracking-tight">Unlock AI Infrastructure Intelligence</h3>
            <p className="text-zinc-500 mb-8 leading-relaxed font-bold">
              Join enterprise teams using NexPulse Pro to unlock AI-powered profit recovery audits and professional performance action plans.
            </p>
            <Button 
              onClick={() => window.dispatchEvent(new CustomEvent('open-pricing'))}
              className="bg-zinc-900 dark:bg-white dark:text-black hover:opacity-90 px-10 h-14 font-black text-xs uppercase tracking-widest"
            >
              <Crown className="h-4 w-4 mr-2" /> Upgrade to Professional
            </Button>
          </div>
        </Card>
      )}

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AuditSection 
          title="SEO Performance" 
          icon={<Search className="h-4 w-4" />} 
          score={sections.seo.score}
          metrics={[
            { label: "Title Tag", value: sections.seo.metrics.hasTitle ? "Detected" : "Missing", success: sections.seo.metrics.hasTitle },
            { label: "Description", value: sections.seo.metrics.hasDescription ? "Detected" : "Missing", success: sections.seo.metrics.hasDescription },
            { label: "H1 Hierarchy", value: sections.seo.metrics.h1Count === 1 ? "Optimal" : `${sections.seo.metrics.h1Count} Tags`, success: sections.seo.metrics.h1Count === 1 },
          ]}
          suggestions={sections.seo.suggestions}
        />

        <AuditSection 
          title="Security Matrix" 
          icon={<ShieldCheck className="h-4 w-4" />} 
          score={sections.security.score}
          metrics={[
            { label: "SSL/HTTPS", value: sections.security.metrics.isHttps ? "Active" : "Insecure", success: sections.security.metrics.isHttps },
            { label: "CSP Protection", value: sections.security.metrics.hasCsp ? "Secure" : "Missing", success: sections.security.metrics.hasCsp },
            { label: "HSTS Status", value: sections.security.metrics.hasHsts ? "Active" : "Inactive", success: sections.security.metrics.hasHsts },
          ]}
          suggestions={sections.security.suggestions}
        />

        <AuditSection 
          title="Core Web Vitals" 
          icon={<Zap className="h-4 w-4" />} 
          score={sections.performance.score}
          metrics={[
            { label: "TTFB / Load", value: `${sections.performance.metrics.loadTimeMs}ms`, success: sections.performance.metrics.loadTimeMs < 1000 },
            { label: "Asset Compression", value: sections.performance.metrics.isCompressed ? "Brotli/Gzip" : "Missing", success: sections.performance.metrics.isCompressed },
            { label: "Script Payload", value: `${sections.performance.metrics.scriptCount} Files`, success: sections.performance.metrics.scriptCount < 15 },
          ]}
          suggestions={sections.performance.suggestions}
        />
      </div>
    </div>
  );
}

function AuditSection({ title, icon, score, metrics, suggestions }: any) {
  return (
    <Card className="p-0 overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col h-full bg-white dark:bg-black">
      <div className="p-5 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-md flex items-center justify-center text-blue-600 bg-blue-50 dark:bg-blue-900/20">
            {icon}
          </div>
          <span className="font-black text-[10px] uppercase tracking-[0.2em] text-zinc-900 dark:text-white">{title}</span>
        </div>
        <div className="text-xl font-black tabular-nums">{score}</div>
      </div>

      <div className="p-5 space-y-4 flex-1">
        {metrics.map((m: any, i: number) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{m.label}</span>
            <div className="flex items-center gap-2">
              <span className={cn("text-[11px] font-black", m.success ? "text-zinc-900 dark:text-zinc-100" : "text-red-500")}>
                {m.value}
              </span>
              {m.success ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
            </div>
          </div>
        ))}

        {suggestions.length > 0 && (
          <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3">Optimization Action Plan</p>
            <div className="space-y-3">
              {suggestions.slice(0, 3).map((s: string, i: number) => (
                <div key={i} className="flex items-start gap-3 group">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-normal font-bold">{s}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

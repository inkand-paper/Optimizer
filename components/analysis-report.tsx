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
  Gauge,
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
 * Visualizes the multi-dimensional audit data into a professional dashboard.
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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 bg-zinc-900 dark:bg-zinc-900/80 rounded-[var(--radius)] text-white overflow-hidden relative border border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="z-10 w-full sm:w-auto">
          <div className="flex items-center gap-2 mb-3">
            <Globe className="h-4 w-4 text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Universal Domain Audit</span>
          </div>
          <h3 className="text-2xl font-black tracking-tight truncate max-w-full sm:max-w-md">{results.url}</h3>
          <p className="text-xs text-zinc-500 mt-2 font-medium">Scan completed on {new Date(data.timestamp).toLocaleString()}</p>
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
          <Button variant="outline" size="sm" onClick={downloadReport} className="bg-white/5 border-white/10 hover:bg-white/10 text-white border-0 h-12 px-6 rounded-xl font-bold">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      {/* AI Genius Diagnosis Section */}
      {data.aiInsight && (
        <Card className="p-0 overflow-hidden border-indigo-200 dark:border-indigo-500/20 bg-gradient-to-br from-indigo-50/30 to-white dark:from-indigo-950/10 dark:to-zinc-900/50 relative group">
          <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
            <Crown className="h-32 w-32 text-indigo-600" />
          </div>
          
          <div className="p-8 relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-black text-xl text-zinc-900 dark:text-white">AI Genius Diagnosis</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 opacity-80">Infrastructure Brief • Gemini 1.5 Flash</p>
              </div>
            </div>

            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div 
                className={cn(
                  "text-zinc-700 dark:text-zinc-300 leading-relaxed text-sm",
                  "prose-headings:text-zinc-900 dark:prose-headings:text-white prose-headings:font-black prose-headings:mb-3 prose-headings:mt-6",
                  "prose-strong:text-indigo-600 dark:prose-strong:text-indigo-400 prose-strong:font-black",
                  "prose-ul:list-disc prose-ul:pl-5 prose-ul:space-y-2 prose-li:marker:text-indigo-500"
                )}
              >
                <ReactMarkdown>
                  {data.aiInsight}
                </ReactMarkdown>
              </div>
            </div>

            <div className="mt-8 flex items-center gap-3 p-4 rounded-xl bg-indigo-600/5 border border-indigo-100 dark:border-indigo-500/10">
              <ShieldCheck className="h-4 w-4 text-indigo-500" />
              <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                This diagnostic report is calibrated against universal performance benchmarks.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Upgrade Prompt for Free Users */}
      {!data.aiInsight && (
        <Card className="p-10 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/10 text-center relative overflow-hidden group">
          <div className="relative z-10 max-w-lg mx-auto">
            <div className="h-14 w-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-6 text-zinc-400 group-hover:text-indigo-500 transition-all duration-300">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="font-black text-2xl mb-3 tracking-tight">Unlock AI Infrastructure Intelligence</h3>
            <p className="text-zinc-500 mb-8 leading-relaxed font-medium">
              Join enterprise teams using NexPulse Pro to unlock AI-powered profit recovery audits and professional performance action plans.
            </p>
            <Button 
              onClick={() => window.dispatchEvent(new CustomEvent('open-pricing'))}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-600/20 px-10 h-14 rounded-xl font-black text-base"
            >
              <Crown className="h-5 w-5 mr-2" /> Upgrade to Professional
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
    <Card className="p-0 overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col h-full bg-white dark:bg-zinc-950">
      <div className="p-5 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center text-indigo-600 bg-indigo-50 dark:bg-indigo-900/20">
            {icon}
          </div>
          <span className="font-black text-xs uppercase tracking-widest text-zinc-900 dark:text-white">{title}</span>
        </div>
        <div className="text-xl font-black tabular-nums">{score}</div>
      </div>

      <div className="p-5 space-y-4 flex-1">
        {metrics.map((m: any, i: number) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider">{m.label}</span>
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
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-3">Optimization Action Plan</p>
            <div className="space-y-3">
              {suggestions.slice(0, 3).map((s: string, i: number) => (
                <div key={i} className="flex items-start gap-3 group">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-normal font-medium">{s}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}


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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-zinc-900 dark:bg-zinc-900/50 rounded-2xl text-white overflow-hidden relative border border-white/5 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="z-10 w-full sm:w-auto">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="h-4 w-4 text-blue-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Domain Audit</span>
          </div>
          <h3 className="text-xl font-bold truncate max-w-full sm:max-w-md">{results.url}</h3>
          <p className="text-xs text-zinc-500 mt-1">Scan completed on {new Date(data.timestamp).toLocaleString()}</p>
        </div>
        
        <div className="flex items-center justify-between sm:justify-end gap-8 z-10 w-full sm:w-auto">
          <div className="text-center">
            <div className={cn(
              "text-5xl font-black tracking-tighter",
              overallScore >= 80 ? "text-green-400" : 
              overallScore >= 50 ? "text-yellow-400" : "text-red-400"
            )}>
              {overallScore}
            </div>
            <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mt-1">Score</p>
          </div>
          <Button variant="outline" size="sm" onClick={downloadReport} className="bg-white/5 border-white/10 hover:bg-white/10 text-white border-0 h-10 px-4">
            <Download className="h-4 w-4 mr-2" /> Export
          </Button>
        </div>
      </div>

      {/* AI Genius Diagnosis Section */}
      {data.aiInsight && (
        <Card className="p-0 overflow-hidden border-indigo-200/50 dark:border-indigo-500/20 bg-gradient-to-br from-indigo-50/50 to-white dark:from-indigo-950/20 dark:to-zinc-900/50 relative group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Sparkles className="h-24 w-24 text-indigo-600 dark:text-indigo-400" />
          </div>
          
          <div className="p-6 relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-indigo-950 dark:text-indigo-100">AI Genius Diagnosis</h3>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500 opacity-80">Powered by Gemini 1.5 Flash</p>
              </div>
            </div>

            <div className="prose prose-sm dark:prose-invert max-w-none">
              <div 
                className={cn(
                  "text-zinc-700 dark:text-zinc-300 leading-relaxed text-sm",
                  "prose-headings:text-indigo-900 dark:prose-headings:text-indigo-100 prose-headings:font-black prose-headings:mb-2 prose-headings:mt-4",
                  "prose-strong:text-indigo-600 dark:prose-strong:text-indigo-400 prose-strong:font-black",
                  "prose-ul:list-disc prose-ul:pl-4 prose-ul:space-y-1 prose-li:marker:text-indigo-500"
                )}
              >
                <ReactMarkdown>
                  {data.aiInsight}
                </ReactMarkdown>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 p-3 rounded-xl bg-indigo-600/5 dark:bg-indigo-400/5 border border-indigo-100 dark:border-indigo-400/10">
              <AlertCircle className="h-4 w-4 text-indigo-500" />
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">
                This insight is generated by AI based on real-time performance and SEO metrics.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Upgrade Prompt for Free Users (if AI is null) */}
      {!data.aiInsight && (
        <Card className="p-8 border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/20 text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Sparkles className="h-24 w-24" />
          </div>
          
          <div className="relative z-10 max-w-md mx-auto">
            <div className="h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4 text-zinc-400 group-hover:text-indigo-500 transition-colors">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-lg mb-2">Unlock AI Genius Diagnosis</h3>
            <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
              Upgrade to <span className="text-indigo-600 font-bold">NexPulse Pro</span> to unlock AI-powered profit recovery audits and professional performance action plans for your assets.
            </p>
            <Button 
              onClick={() => {
                // This triggers the pricing modal if we can reach it, or just a link
                window.dispatchEvent(new CustomEvent('open-pricing'));
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 px-8"
            >
              <Crown className="h-4 w-4 mr-2" /> Upgrade to Pro
            </Button>
          </div>
        </Card>
      )}

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* SEO Section */}
        <AuditSection 
          title="SEO" 
          icon={<Search className="h-4 w-4" />} 
          score={sections.seo.score}
          color="blue"
          metrics={[
            { label: "Title Tag", value: sections.seo.metrics.hasTitle ? "Present" : "Missing", success: sections.seo.metrics.hasTitle },
            { label: "Description", value: sections.seo.metrics.hasDescription ? "Present" : "Missing", success: sections.seo.metrics.hasDescription },
            { label: "H1 Tag", value: sections.seo.metrics.h1Count === 1 ? "Optimal" : `${sections.seo.metrics.h1Count} Found`, success: sections.seo.metrics.h1Count === 1 },
          ]}
          suggestions={sections.seo.suggestions}
        />

        {/* Security Section */}
        <AuditSection 
          title="Security" 
          icon={<ShieldCheck className="h-4 w-4" />} 
          score={sections.security.score}
          color="green"
          metrics={[
            { label: "HTTPS", value: sections.security.metrics.isHttps ? "Active" : "Insecure", success: sections.security.metrics.isHttps },
            { label: "CSP Header", value: sections.security.metrics.hasCsp ? "Secure" : "Missing", success: sections.security.metrics.hasCsp },
            { label: "HSTS", value: sections.security.metrics.hasHsts ? "Active" : "Inactive", success: sections.security.metrics.hasHsts },
          ]}
          suggestions={sections.security.suggestions}
        />

        {/* Performance Section */}
        <AuditSection 
          title="Performance" 
          icon={<Zap className="h-4 w-4" />} 
          score={sections.performance.score}
          color="orange"
          metrics={[
            { label: "Load Time", value: `${sections.performance.metrics.loadTimeMs}ms`, success: sections.performance.metrics.loadTimeMs < 1000 },
            { label: "Compression", value: sections.performance.metrics.isCompressed ? "Gzip/Br" : "None", success: sections.performance.metrics.isCompressed },
            { label: "Scripts", value: sections.performance.metrics.scriptCount.toString(), success: sections.performance.metrics.scriptCount < 15 },
          ]}
          suggestions={sections.performance.suggestions}
        />
      </div>
    </div>
  );
}

function AuditSection({ title, icon, score, color, metrics, suggestions }: any) {
  const colors: any = {
    blue: "bg-blue-600",
    green: "bg-green-600",
    orange: "bg-orange-600",
    red: "bg-red-600"
  };

  const bgColors: any = {
    blue: "bg-blue-50/50 dark:bg-blue-900/5",
    green: "bg-green-50/50 dark:bg-green-900/5",
    orange: "bg-orange-50/50 dark:bg-orange-900/5",
    red: "bg-red-50/50 dark:bg-red-900/5"
  };

  const borderColors: any = {
    blue: "border-blue-100 dark:border-blue-900/20",
    green: "border-green-100 dark:border-green-900/20",
    orange: "border-orange-100 dark:border-orange-900/20",
    red: "border-red-100 dark:border-red-900/20"
  };

  return (
    <Card className={cn("p-0 overflow-hidden border-0 shadow-sm flex flex-col h-full", bgColors[color])}>
      <div className={cn("p-4 flex items-center justify-between border-b", borderColors[color])}>
        <div className="flex items-center gap-2">
          <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center text-white shadow-sm", colors[color])}>
            {icon}
          </div>
          <span className="font-bold text-sm">{title}</span>
        </div>
        <div className="text-lg font-black">{score}<span className="text-[10px] text-zinc-400 font-normal">/100</span></div>
      </div>

      <div className="p-4 space-y-3 flex-1">
        {metrics.map((m: any, i: number) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-xs text-zinc-500">{m.label}</span>
            <div className="flex items-center gap-1.5">
              <span className={cn("text-[11px] font-bold", m.success ? "text-zinc-900 dark:text-zinc-100" : "text-red-500")}>
                {m.value}
              </span>
              {m.success ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <XCircle className="h-3 w-3 text-red-500" />}
            </div>
          </div>
        ))}

        {suggestions.length > 0 && (
          <div className="mt-4 pt-4 border-t border-black/5 dark:border-white/5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">Improvements</p>
            <div className="space-y-2">
              {suggestions.slice(0, 3).map((s: string, i: number) => (
                <div key={i} className="flex items-start gap-2 group">
                  <ArrowRight className="h-2.5 w-2.5 text-zinc-300 mt-1 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                  <p className="text-[10px] text-zinc-600 dark:text-zinc-400 leading-tight">{s}</p>
                </div>
              ))}
              {suggestions.length > 3 && (
                <p className="text-[9px] text-zinc-500 italic pl-4">+{suggestions.length - 3} more insights</p>
              )}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}


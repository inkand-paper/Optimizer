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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Summary */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-8 p-10 bg-white dark:bg-zinc-950 rounded-md border border-zinc-200 dark:border-zinc-800 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:bg-blue-600/10 transition-all duration-700 pointer-events-none" />
        
        <div className="z-10 w-full md:w-auto">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-4 w-4 text-blue-600" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400">Universal Infrastructure Audit</span>
          </div>
          <h3 className="text-3xl md:text-4xl font-black tracking-tighter truncate max-w-full sm:max-w-md uppercase text-zinc-900 dark:text-white leading-none">{results.url}</h3>
          <p className="text-[10px] text-zinc-500 mt-4 font-black uppercase tracking-[0.2em] border-l-2 border-blue-600 pl-4 leading-none">Transmission: {new Date(data.timestamp).toLocaleString()}</p>
        </div>
        
        <div className="flex items-center justify-between md:justify-end gap-12 z-10 w-full md:w-auto border-t md:border-t-0 md:border-l border-zinc-100 dark:border-zinc-900 pt-8 md:pt-0 md:pl-12">
          <div className="text-center">
            <div className={cn(
              "text-7xl font-black tracking-tighter leading-none mb-2",
              overallScore >= 80 ? "text-blue-600" : 
              overallScore >= 50 ? "text-zinc-900 dark:text-white" : "text-red-600"
            )}>
              {overallScore}
            </div>
            <p className="text-[9px] uppercase font-black tracking-[0.3em] text-zinc-400">Health Protocol</p>
          </div>
          <Button variant="outline" size="lg" onClick={downloadReport} className="h-14 px-8 font-black uppercase tracking-[0.2em] text-[10px] border-zinc-200 dark:border-zinc-800 hover:border-blue-600 hover:text-blue-600 transition-all shadow-sm">
            <Download className="h-4 w-4 mr-2" /> Export Audit
          </Button>
        </div>
      </div>

      {/* AI Genius Diagnosis Section */}
      {data.aiInsight && (
        <Card className="p-0 overflow-hidden border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 relative group shadow-sm hover:shadow-xl transition-all duration-500">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity pointer-events-none">
            <Crown className="h-48 w-48 text-blue-600" />
          </div>
          
          <div className="p-10 md:p-16 relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-12 border-b border-zinc-100 dark:border-zinc-900 pb-8">
              <div className="h-16 w-16 rounded-md bg-blue-600 flex items-center justify-center text-white shadow-xl shadow-blue-600/30">
                <Sparkles className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-black text-3xl text-zinc-900 dark:text-white uppercase tracking-tighter leading-none mb-2">Genius Diagnosis</h3>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600">Infrastructure Brief • Protocol Engine v4.0</p>
              </div>
            </div>

            <div className="prose prose-zinc dark:prose-invert max-w-none">
              <div 
                className={cn(
                  "text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm font-bold uppercase tracking-tight",
                  "prose-headings:text-zinc-900 dark:prose-headings:text-white prose-headings:font-black prose-headings:uppercase prose-headings:tracking-tighter prose-headings:mb-6 prose-headings:mt-12 prose-headings:border-l-4 prose-headings:border-blue-600 prose-headings:pl-6",
                  "prose-strong:text-blue-600 dark:prose-strong:text-blue-600 prose-strong:font-black",
                  "prose-ul:list-none prose-ul:pl-0 prose-ul:space-y-4 prose-li:flex prose-li:items-start prose-li:gap-4 prose-li:before:content-[''] prose-li:before:h-2 prose-li:before:w-2 prose-li:before:bg-blue-600 prose-li:before:mt-1.5 prose-li:before:shrink-0"
                )}
              >
                <ReactMarkdown>
                  {data.aiInsight}
                </ReactMarkdown>
              </div>
            </div>

            <div className="mt-12 flex items-center gap-4 p-6 rounded-md bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-black uppercase tracking-[0.2em]">
                Universal Infrastructure Briefing Protocol Executed Successfully.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Upgrade Prompt for Free Users */}
      {!data.aiInsight && (
        <Card className="p-12 md:p-24 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-center relative overflow-hidden group shadow-xl">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-600/[0.03] via-transparent to-transparent" />
          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="h-20 w-20 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex items-center justify-center mx-auto mb-10 text-zinc-400 group-hover:text-blue-600 group-hover:border-blue-600/50 transition-all duration-500 shadow-sm">
              <Lock className="h-10 w-10" />
            </div>
            <h3 className="font-black text-4xl mb-6 tracking-tighter uppercase leading-none text-zinc-900 dark:text-white">Unlock <span className="text-blue-600">Genius</span> Intelligence</h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-12 text-lg font-bold tracking-tight uppercase max-w-lg mx-auto leading-relaxed">
              Activate the enterprise protocol to unlock AI-powered profit recovery audits and deep architectural action plans.
            </p>
            <Button 
              onClick={() => window.dispatchEvent(new CustomEvent('open-pricing'))}
              className="bg-zinc-900 text-white dark:bg-white dark:text-black hover:bg-blue-600 dark:hover:bg-blue-600 dark:hover:text-white px-12 h-16 font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all"
            >
              <Crown className="h-4 w-4 mr-3" /> Upgrade to Professional
            </Button>
          </div>
        </Card>
      )}

      {/* Main Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <AuditSection 
          title="SEO Protocols" 
          icon={<Search className="h-5 w-5" />} 
          score={sections.seo.score}
          metrics={[
            { label: "Identity Tag", value: sections.seo.metrics.hasTitle ? "DETECTED" : "MISSING", success: sections.seo.metrics.hasTitle },
            { label: "Description", value: sections.seo.metrics.hasDescription ? "DETECTED" : "MISSING", success: sections.seo.metrics.hasDescription },
            { label: "H1 Hierarchy", value: sections.seo.metrics.h1Count === 1 ? "OPTIMAL" : `${sections.seo.metrics.h1Count} UNITS`, success: sections.seo.metrics.h1Count === 1 },
          ]}
          suggestions={sections.seo.suggestions}
        />

        <AuditSection 
          title="Security Matrix" 
          icon={<ShieldCheck className="h-5 w-5" />} 
          score={sections.security.score}
          metrics={[
            { label: "SSL/HTTPS", value: sections.security.metrics.isHttps ? "ENCRYPTED" : "INSECURE", success: sections.security.metrics.isHttps },
            { label: "CSP Shield", value: sections.security.metrics.hasCsp ? "ACTIVE" : "MISSING", success: sections.security.metrics.hasCsp },
            { label: "HSTS Status", value: sections.security.metrics.hasHsts ? "ARMED" : "INACTIVE", success: sections.security.metrics.hasHsts },
          ]}
          suggestions={sections.security.suggestions}
        />

        <AuditSection 
          title="Web Vitals" 
          icon={<Zap className="h-5 w-5" />} 
          score={sections.performance.score}
          metrics={[
            { label: "TTFB / LOAD", value: `${sections.performance.metrics.loadTimeMs}MS`, success: sections.performance.metrics.loadTimeMs < 1000 },
            { label: "Compression", value: sections.performance.metrics.isCompressed ? "ENABLED" : "MISSING", success: sections.performance.metrics.isCompressed },
            { label: "Script Payload", value: `${sections.performance.metrics.scriptCount} UNITS`, success: sections.performance.metrics.scriptCount < 15 },
          ]}
          suggestions={sections.performance.suggestions}
        />
      </div>
    </div>
  );
}

function AuditSection({ title, icon, score, metrics, suggestions }: any) {
  return (
    <Card className="p-0 overflow-hidden border border-zinc-200 dark:border-zinc-800 flex flex-col h-full bg-white dark:bg-zinc-950 shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="p-6 flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/30 dark:bg-zinc-900/30">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-md flex items-center justify-center text-blue-600 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm">
            {icon}
          </div>
          <span className="font-black text-[10px] uppercase tracking-[0.3em] text-zinc-900 dark:text-white leading-none">{title}</span>
        </div>
        <div className={cn(
          "text-2xl font-black tabular-nums tracking-tighter leading-none",
          score >= 80 ? "text-blue-600" : "text-zinc-900 dark:text-white"
        )}>{score}</div>
      </div>

      <div className="p-8 space-y-6 flex-1">
        {metrics.map((m: any, i: number) => (
          <div key={i} className="flex items-center justify-between border-b border-zinc-50 dark:border-zinc-900 pb-4 last:border-0 last:pb-0">
            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em]">{m.label}</span>
            <div className="flex items-center gap-3">
              <span className={cn("text-[10px] font-black tracking-tight", m.success ? "text-zinc-900 dark:text-zinc-100" : "text-red-600")}>
                {m.value}
              </span>
              <div className={cn("h-4 w-4 rounded-full flex items-center justify-center", m.success ? "bg-blue-600/10 text-blue-600" : "bg-red-600/10 text-red-600")}>
                {m.success ? <CheckCircle2 className="h-2.5 w-2.5" /> : <XCircle className="h-2.5 w-2.5" />}
              </div>
            </div>
          </div>
        ))}

        {suggestions.length > 0 && (
          <div className="mt-8 pt-8 border-t-2 border-zinc-50 dark:border-zinc-900">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-4 flex items-center gap-2">
              <div className="h-1 w-4 bg-blue-600" />
              <span>Optimization Sequence</span>
            </p>
            <div className="space-y-4">
              {suggestions.slice(0, 3).map((s: string, i: number) => (
                <div key={i} className="flex items-start gap-4 group">
                  <div className="h-2 w-2 rounded-sm bg-blue-600/30 mt-1.5 shrink-0 group-hover:bg-blue-600 transition-colors" />
                  <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal font-black uppercase tracking-tight">{s}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

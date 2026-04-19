import * as React from "react";
import { Card, Button } from "./ui-elements";
import { 
  CheckCircle2, 
  XCircle, 
  Search, 
  ShieldCheck, 
  Zap, 
  Download,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalyzeResponse } from "@/lib/types";

interface Props {
  data: AnalyzeResponse;
}

/**
 * [ENTRY-LEVEL] - Analysis Report Component
 * Visualizes the data from our scanner into a readable "Report Card".
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

  const downloadReport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${results.url.replace(/https?:\/\//, '').replace(/\//g, '-')}.json`;
    a.click();
  };

  return (
    <Card className="p-6 border-zinc-200 dark:border-zinc-800 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-600" />
            Scan Results
          </h3>
          <p className="text-xs text-zinc-500 font-mono mt-1">{results.url}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className={cn(
              "text-3xl font-black",
              results.score >= 80 ? "text-green-500" : 
              results.score >= 50 ? "text-yellow-500" : "text-red-500"
            )}>
              {results.score}/100
            </span>
            <p className="text-[10px] uppercase font-bold tracking-tighter text-zinc-400">Health Score</p>
          </div>
          <Button variant="outline" size="sm" onClick={downloadReport}>
            <Download className="h-4 w-4 mr-2" /> JSON Report
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Metrics Grid */}
        <div className="space-y-3">
          <MetricItem 
            label="Title Tag Found" 
            success={results.metrics.hasTitle} 
            desc={results.details.title || "No title found"}
          />
          <MetricItem 
            label="Meta Description" 
            success={results.metrics.hasDescription} 
            desc={results.details.description || "Missing for SEO"}
          />
          <MetricItem 
            label="SSL Security" 
            success={results.metrics.isSsl} 
            desc={results.metrics.isSsl ? "Connection is encrypted" : "Insecure HTTP"}
          />
        </div>

        <div className="space-y-3">
          <div className={cn(
            "p-4 rounded-xl border flex items-center gap-4",
            results.metrics.loadTime < 1500 ? "bg-green-50/50 border-green-100" : "bg-orange-50/50 border-orange-100"
          )}>
            <div className="h-10 w-10 rounded-full bg-white dark:bg-zinc-900 border flex items-center justify-center">
              <Zap className={cn("h-5 w-5", results.metrics.loadTime < 1500 ? "text-orange-500" : "text-zinc-400")} />
            </div>
            <div>
              <p className="text-sm font-bold">{results.metrics.loadTime}ms</p>
              <p className="text-[10px] text-zinc-500">Response Speed</p>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-zinc-100 dark:border-zinc-800 flex items-center gap-4">
            <div className="h-10 w-10 rounded-full bg-zinc-50 dark:bg-zinc-900 border flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase text-[10px] tracking-widest">{results.details.server}</p>
              <p className="text-[10px] text-zinc-500">Detected Server</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function MetricItem({ label, success, desc }: { label: string; success: boolean; desc: string }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border border-zinc-50 dark:border-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
      {success ? (
        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
      ) : (
        <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
      )}
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-none">{label}</p>
        <p className="text-[11px] text-zinc-500 mt-1 truncate">{desc}</p>
      </div>
    </div>
  );
}

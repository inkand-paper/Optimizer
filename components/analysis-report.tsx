"use client";

import * as React from "react";
import { Card, Button } from "./ui-elements";
import {
  CheckCircle2, XCircle, AlertCircle,
  Zap, Search, ShieldCheck, Download, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AnalyzeResponse } from "@/lib/types";
import ReactMarkdown from "react-markdown";

interface Props { data: AnalyzeResponse; }

function ScoreRing({ score }: { score: number }) {
  const color =
    score >= 80 ? "var(--np-teal)" :
    score >= 50 ? "var(--np-gold)" :
    "var(--np-crimson)";
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="relative h-20 w-20 rounded-full flex items-center justify-center"
        style={{ background: `conic-gradient(${color} ${score * 3.6}deg, var(--muted) 0deg)` }}
      >
        <div className="h-14 w-14 rounded-full bg-card flex items-center justify-center">
          <span className="text-[18px] font-semibold" style={{ color }}>{score}</span>
        </div>
      </div>
    </div>
  );
}

function IssueRow({ label, value, pass }: { label: string; value?: string; pass: boolean }) {
  return (
    <div
      className="flex items-start justify-between gap-4 py-3"
      style={{ borderBottom: "0.5px solid var(--border)" }}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {pass
          ? <CheckCircle2 className="h-4 w-4 shrink-0 text-np-teal" />
          : <XCircle     className="h-4 w-4 shrink-0 text-np-crimson" />}
        <span className="text-[13px] font-medium truncate">{label}</span>
      </div>
      {value && <span className="text-[12px] text-muted-foreground shrink-0 font-mono">{value}</span>}
    </div>
  );
}

export function AnalysisReport({ data }: Props) {
  const { results, success } = data;
  const [activeTab, setActiveTab] = React.useState(0);

  if (!success || !results) {
    return (
      <Card className="p-5 flex items-center gap-3" style={{ borderLeft: "3px solid var(--np-crimson)" }}>
        <AlertCircle className="h-5 w-5 text-np-crimson shrink-0" />
        <div>
          <p className="text-[13px] font-semibold text-np-crimson">Scan failed</p>
          <p className="text-[12px] text-muted-foreground mt-0.5">
            {(data as unknown as Record<string, unknown>).message as string || "Could not analyse the URL. Check the URL and your API key."}
          </p>
        </div>
      </Card>
    );
  }

  const { overallScore, sections } = results;

  const downloadReport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `audit-${results.url.replace(/https?:\/\//, "").replace(/\//g, "-")}.json`;
    a.click();
  };

  const tabs = [
    { label: "SEO",       icon: Search    },
    { label: "Security",  icon: ShieldCheck },
    { label: "Perf",      icon: Zap       },
    { label: "AI",        icon: Sparkles  },
  ];

  const seoSection  = sections?.seo;
  const secSection  = sections?.security;
  const perfSection = sections?.performance;
  const aiSection   = data.aiInsight;


  const tabSections = [seoSection, secSection, perfSection, null];



  return (
    <div className="space-y-5 np-slide-up">
      {/* ── Summary header ── */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 mb-6">
          <div>
            <p className="label-category mb-1">Audit complete</p>
            <h2 className="text-[15px] font-semibold truncate max-w-xs">{results.url}</h2>
          </div>
          <Button variant="outline" size="sm" onClick={downloadReport}>
            <Download className="h-3.5 w-3.5 mr-1.5" /> Export JSON
          </Button>
        </div>

        {/* Score cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: "SEO",       score: seoSection?.score  ?? (overallScore as unknown as Record<string, number>)?.seo  ?? 0 },
            { label: "Security",  score: secSection?.score  ?? (overallScore as unknown as Record<string, number>)?.security ?? 0 },
            { label: "Performance", score: perfSection?.score ?? (overallScore as unknown as Record<string, number>)?.performance ?? 0 },
          ].map((s) => (
            <div
              key={s.label}
              className="flex flex-col items-center gap-3 p-4 rounded-card"
              style={{ background: "var(--muted)", border: "0.5px solid var(--border)" }}
            >
              <ScoreRing score={s.score} />
              <p className="label-category">{s.label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Tabbed report ── */}
      <Card>
        {/* Tab bar */}
        <div className="flex overflow-x-auto np-scroll-hide no-scrollbar" style={{ borderBottom: "0.5px solid var(--border)" }}>
          {tabs.map((t, i) => (
            <button
              key={t.label}
              onClick={() => setActiveTab(i)}
              className={cn(
                "flex items-center gap-2 px-5 py-3.5 text-[13px] font-medium transition-colors shrink-0",
                activeTab === i
                  ? "text-np-gold border-b-2 border-np-gold -mb-px"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <t.icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* SEO / Security / Perf tabs */}
          {activeTab < 3 && tabSections[activeTab] && (
            <div className="space-y-4">
              <div className="space-y-1">
                {Object.entries(tabSections[activeTab]?.metrics || {}).map(([key, val]: [string, unknown]) => (
                  <IssueRow
                    key={key}
                    label={key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    value={typeof val === "string" || typeof val === "number" ? String(val) : undefined}
                    pass={val === true || (typeof val === "number" && val > 0) || (typeof val === "string" && val.length > 0)}
                  />
                ))}
              </div>
              
              {tabSections[activeTab]?.suggestions?.length > 0 && (
                <div className="mt-6 p-4 rounded-card border border-np-gold/20 bg-np-gold/5">
                  <h4 className="text-[12px] font-semibold text-np-gold uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Sparkles className="h-3.5 w-3.5" /> Recommendations
                  </h4>
                  <ul className="space-y-2">
                    {tabSections[activeTab].suggestions.map((sugg: string, i: number) => (
                      <li key={i} className="text-[13px] text-muted-foreground flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-np-gold shrink-0 mt-1.5" />
                        <span>{sugg}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {!tabSections[activeTab]?.metrics && (
                <p className="text-[13px] text-muted-foreground py-4">No data available for this section.</p>
              )}
            </div>
          )}

          {/* AI / Genius tab */}
          {activeTab === 3 && (
            <div>
              {aiSection ? (
                <div className="np-diagnosis">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-4 w-4 text-np-gold" />
                    <span className="text-[12px] font-semibold text-np-gold uppercase tracking-wide">
                      Genius Diagnosis
                    </span>
                  </div>
                  <div className="text-[13px] leading-relaxed max-w-none">
                    <ReactMarkdown>{typeof aiSection === 'string' ? aiSection : (aiSection.diagnosis || aiSection.content || "No diagnosis available.")}</ReactMarkdown>
                  </div>
                </div>
              ) : (
                <p className="text-[13px] text-muted-foreground py-4">
                  AI diagnosis not available. Upgrade your plan to unlock Genius analysis.
                </p>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

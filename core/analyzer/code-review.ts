/**
 * core/analyzer/code-review.ts
 * AI-powered recursive code review engine.
 * Professional Queue Edition: P-Queue Throttling + 10x Parallelism.
 */

import crypto from "crypto";
import PQueue from 'p-queue';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CodeFile {
  path: string;
  content: string;
  language?: string;
}

export interface LineIssue {
  line: number;
  severity: "critical" | "warning" | "info";
  category: "security" | "performance" | "best-practice" | "refactor";
  message: string;
  suggestion: string;
  codeSnippet?: string;
  fixedSnippet?: string;
}

export interface FileReview {
  path: string;
  language: string;
  score: number;
  summary: string;
  issues: LineIssue[];
  positives: string[];
  hash: string;
}

export interface CodeReviewResult {
  overallScore: number;
  grade: "A" | "B" | "C" | "D" | "F";
  summary: string;
  linesOfCode: number;
  filesReviewed: number;
  language: string;
  categories: {
    security: { score: number; issueCount: number; critical: number };
    performance: { score: number; issueCount: number; critical: number };
    bestPractices: { score: number; issueCount: number; critical: number };
    refactoring: { score: number; issueCount: number; critical: number };
  };
  files: FileReview[];
  topIssues: LineIssue[];
  recommendations: string[];
}

// ─── Global Rate Limiter (25 RPM Cap) ─────────────────────────────────────────

const globalRequestQueue = new PQueue({
  interval: 60_000,    // 1 minute window
  intervalCap: 25,     // Max 25 requests per minute (safe under Groq's 30 RPM cap)
  // No timeout — Groq's 70B model can take 60s+ under load.
  // callGroq() handles its own retry logic internally.
});

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

const SKIP_PATTERN = /node_modules|\.next|dist|build|\.git|\.lock|package-lock|__tests__|\.test\.|\.spec\.|svg|png|jpg|jpeg|ico|pdf|zip|gz|env/i;
const CODE_EXT = /\.(ts|tsx|js|jsx|py|rb|go|rs|java|cs|cpp|c|php|swift|kt|vue|svelte|sql|sh|css|scss)$/i;

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function detectLanguage(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    ts: "TypeScript", tsx: "TypeScript (React)", js: "JavaScript", jsx: "JavaScript (React)",
    py: "Python", rb: "Ruby", go: "Go", rs: "Rust", java: "Java", cs: "C#",
    vue: "Vue", svelte: "Svelte", sql: "SQL", sh: "Shell", json: "JSON",
  };
  return map[ext ?? ""] ?? "Unknown";
}

export function getFileHash(content: string): string {
  return crypto.createHash("md5").update(content).digest("hex");
}

function getGrade(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 45) return "D";
  return "F";
}

// ─── Groq API Client ──────────────────────────────────────────────────────────

async function callGroq(sys: string, user: string, retries = 5): Promise<string> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 3000,
          temperature: 0.1,
          response_format: { type: "json_object" },
          messages: [{ role: "system", content: sys }, { role: "user", content: user }],
        }),
      });

      if (res.status === 429) {
        await sleep(5000 * Math.pow(1.5, i));
        continue;
      }

      if (!res.ok) {
        const err = await res.text();
        if (err.includes("context_length_exceeded")) throw new Error("TOO_LARGE");
        await sleep(2000);
        continue;
      }

      const data = await res.json();
      return data.choices?.[0]?.message?.content ?? "";
    } catch (e: any) {
      if (e.message === "TOO_LARGE") throw e;
      await sleep(2000);
    }
  }
  throw new Error("API Failure");
}

// ─── The Chef (Auditor) ───────────────────────────────────────────────────────

async function auditFile(file: CodeFile): Promise<FileReview> {
  const hash = getFileHash(file.content);
  
  if (SKIP_PATTERN.test(file.path) || file.content.length > 40000) {
    return { path: file.path, language: detectLanguage(file.path), score: 100, summary: "Ignored or too large.", issues: [], positives: [], hash };
  }

  const sys = `Audit this file. JSON SCHEMA: { "score": 0-100, "summary": "", "issues": [{ "line": 0, "severity": "critical", "category": "security", "message": "", "suggestion": "", "codeSnippet": "", "fixedSnippet": "" }], "positives": [] }`;
  const user = `FILE: ${file.path}\nSOURCE:\n${file.content}`;

  try {
    const raw = await callGroq(sys, user);
    const parsed = JSON.parse(raw.replace(/```json\n?|```\n?/g, ""));
    return {
      path: file.path,
      language: detectLanguage(file.path),
      score: parsed.score ?? 85,
      summary: parsed.summary ?? "",
      issues: (parsed.issues ?? []).map((iss: any) => ({ ...iss, codeSnippet: iss.codeSnippet?.trim() })),
      positives: parsed.positives ?? [],
      hash 
    };
  } catch (err: any) {
    return { path: file.path, language: detectLanguage(file.path), score: 100, summary: "Skipped.", issues: [], positives: [], hash };
  }
}

// ─── Professional Parallel Review Engine ──────────────────────────────────────

export async function reviewCode(
  files: CodeFile[], 
  onProgress?: (msg: string) => void, 
  signal?: AbortSignal,
  cachedReviews: Record<string, FileReview> = {}
): Promise<CodeReviewResult> {
  if (files.length === 0) throw new Error("Empty project");

  const results: FileReview[] = [];
  const uncached: CodeFile[] = [];

  // 1. Instant Cache Check
  files.forEach(f => {
    const hash = getFileHash(f.content);
    if (cachedReviews[hash]) {
      results.push({ ...cachedReviews[hash], path: f.path });
    } else {
      uncached.push(f);
    }
  });

  if (onProgress) onProgress(`[INTELLIGENCE] Cached: ${results.length} | To Process: ${uncached.length}`);
  if (uncached.length === 0) return finalizeReport(results, files, onProgress);

  // 2. High-Throughput Queue Management
  const CONCURRENCY = 10; // 10 simultaneous workers
  const queue = [...uncached];
  let completed = 0;

  const chefWorker = async () => {
    while (queue.length > 0) {
      if (signal?.aborted) break;
      const file = queue.shift();
      if (!file) break;

      const current = ++completed;
      if (onProgress) onProgress(`[AUDIT] ${current}/${uncached.length}: ${file.path}`);

      // QUEUED EXECUTION: p-queue handles the 25 RPM cap globally
      const review = await globalRequestQueue.add(() => auditFile(file));
      if (review) results.push(review);
    }
  };

  // Launch parallel workers to saturate the queue
  await Promise.all(Array.from({ length: CONCURRENCY }).map(() => chefWorker()));

  return finalizeReport(results, files, onProgress);
}

// ─── Synthesis ────────────────────────────────────────────────────────────────

async function finalizeReport(fileReviews: FileReview[], originalFiles: CodeFile[], onProgress?: (msg: string) => void): Promise<CodeReviewResult> {
  const totalLines = originalFiles.reduce((s, f) => s + f.content.split("\n").length, 0);
  const avg = Math.round(fileReviews.reduce((s, r) => s + r.score, 0) / (fileReviews.length || 1));

  if (onProgress) onProgress("[FINAL] Collate findings...");

  let global: any = { overallScore: avg, summary: "Audit complete.", recommendations: [], categories: { security: { score: avg, count: 0, critical: 0 }, performance: { score: avg, count: 0, critical: 0 }, bestPractices: { score: avg, count: 0, critical: 0 }, refactoring: { score: avg, count: 0, critical: 0 } } };
  
  try {
    const sys = `Synthesize results. SCHEMA: { "overallScore": 0, "summary": "", "recommendations": [], "categories": { "security": { "score": 0, "count": 0, "critical": 0 }, "performance": { "score": 0, "count": 0, "critical": 0 }, "bestPractices": { "score": 0, "count": 0, "critical": 0 }, "refactoring": { "score": 0, "count": 0, "critical": 0 } } }`;
    const summaries = fileReviews.slice(0, 20).map(r => `FILE: ${r.path} SCORE: ${r.score}`).join("\n");
    const raw = await globalRequestQueue.add(() => callGroq(sys, `SUMMARIES:\n${summaries}`), { priority: 1 });
    if (raw) global = JSON.parse(raw.replace(/```json\n?|```\n?/g, ""));
  } catch { }

  const allIssues = fileReviews.flatMap(r => r.issues);
  return {
    overallScore: global.overallScore ?? avg,
    grade: getGrade(global.overallScore ?? avg),
    summary: global.summary ?? "Done.",
    linesOfCode: totalLines,
    filesReviewed: fileReviews.length,
    language: detectLanguage(originalFiles[0]?.path ?? ""),
    categories: global.categories,
    files: fileReviews,
    topIssues: allIssues.sort((a, b) => (a.severity === 'critical' ? -1 : 1)).slice(0, 15),
    recommendations: global.recommendations ?? [],
  };
}

// ─── Fetchers ─────────────────────────────────────────────────────────────────

export async function fetchGitHubFiles(repo: string, token: string, branch = "main"): Promise<CodeFile[]> {
  const headers = { Authorization: `Bearer ${token}`, Accept: "application/vnd.github.v3+json" };
  let treeRes = await fetch(`https://api.github.com/repos/${repo}/git/trees/${branch}?recursive=1`, { headers });
  if (!treeRes.ok) treeRes = await fetch(`https://api.github.com/repos/${repo}/git/trees/master?recursive=1`, { headers });
  if (!treeRes.ok) throw new Error("Repo not found");
  const tree = await treeRes.json();
  const validFiles = (tree.tree as any[]).filter((i: any) => i.type === "blob" && CODE_EXT.test(i.path) && !SKIP_PATTERN.test(i.path) && (i.size || 0) < 50000).slice(0, 150);
  const results = await Promise.all(validFiles.map(async (i: any) => {
    try {
      const r = await fetch(`https://api.github.com/repos/${repo}/contents/${i.path}?ref=${branch}`, { headers });
      if (!r.ok) return null;
      const d = await r.json();
      if (!d.content) return null;
      return { path: i.path, content: Buffer.from(d.content, "base64").toString("utf-8") } as CodeFile;
    } catch { return null; }
  }));
  return results.filter(Boolean) as CodeFile[];
}

export async function extractZipFiles(buffer: Buffer): Promise<CodeFile[]> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(buffer);
  const files: CodeFile[] = [];
  for (const [p, f] of Object.entries(zip.files)) {
    if (!f.dir && CODE_EXT.test(p) && !SKIP_PATTERN.test(p)) {
      files.push({ path: p, content: await f.async("string") });
    }
  }
  return files.slice(0, 150);
}
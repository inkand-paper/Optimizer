/**
 * core/analyzer/code-review.ts
 * AI-powered recursive code review engine.
 * Optimized "Smart Walker" to maximize Groq TPM limits.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CodeFile {
  path: string;
  content: string;
  language?: string;
}

export interface LineIssue {
  line: number;
  column?: number;
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function detectLanguage(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  const map: Record<string, string> = {
    ts: "TypeScript", tsx: "TypeScript (React)",
    js: "JavaScript", jsx: "JavaScript (React)",
    py: "Python", rb: "Ruby", go: "Go", rs: "Rust",
    java: "Java", cs: "C#", cpp: "C++", c: "C",
    php: "PHP", swift: "Swift", kt: "Kotlin",
    vue: "Vue", svelte: "Svelte", sql: "SQL", sh: "Shell",
    yml: "YAML", yaml: "YAML", json: "JSON",
    md: "Markdown", css: "CSS", scss: "SCSS",
  };
  return map[ext ?? ""] ?? "Unknown";
}

function countLines(content: string): number {
  return content.split("\n").length;
}

function gradeFromScore(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  if (score >= 45) return "D";
  return "F";
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ─── Groq API call with Retry Logic ──────────────────────────────────────────

async function callGroq(systemPrompt: string, userPrompt: string, onProgress?:(msg:string)=>void, retries = 5, signal?: AbortSignal): Promise<string> {
  for (let i = 0; i < retries; i++) {
    if (signal?.aborted) throw new Error("Client disconnected");
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        max_tokens: 2000, // Reduced for faster processing and lower TPM hit
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
      signal,
    });

    if (res.status === 429) {
      const wait = Math.min(3000 * Math.pow(2, i), 90000); // More aggressive backoff
      if (onProgress) onProgress(`[THROTTLED] API Busy. Pausing for ${wait/1000}s...`);
      await sleep(wait);
      continue;
    }

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Groq API error ${res.status}: ${err}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? "";
  }
  throw new Error("Maximum retries reached for AI analysis.");
}

// ─── Individual File Auditor ──────────────────────────────────────────────────

async function auditSingleFile(file: CodeFile, signal?: AbortSignal, onProgress?: (msg: string) => void): Promise<FileReview> {
  // SMART FILTER: Is this file worth AI tokens?
  const lines = countLines(file.content);
  const isBoilerplate = /loading\.tsx|layout\.tsx|error\.tsx|globals\.css/.test(file.path) && lines < 15;
  
  if (isBoilerplate) {
    return {
      path: file.path,
      language: detectLanguage(file.path),
      score: 100,
      summary: "System boilerplate (Automated Pass).",
      issues: [],
      positives: ["Minimal logic confirmed."]
    };
  }

  const systemPrompt = `You are NexPulse AI Auditor. Audit a SINGLE file. Cite line numbers.
  SCHEMA: { "score": 0-100, "summary": "", "issues": [{ "line": 0, "severity": "critical", "category": "security", "message": "", "suggestion": "", "codeSnippet": "", "fixedSnippet": "" }], "positives": [] }`;

  const userPrompt = `TARGET: ${file.path}\nSOURCE:\n${file.content}`;
  
  const raw = await callGroq(systemPrompt, userPrompt, onProgress, 4, signal);
  const parsed = JSON.parse(raw.replace(/```json\n?|```\n?/g, ""));
  
  return {
    path: file.path,
    language: detectLanguage(file.path),
    score: parsed.score ?? 85,
    summary: parsed.summary ?? "",
    issues: (parsed.issues ?? []).map((iss: any) => ({
      ...iss,
      codeSnippet: iss.codeSnippet?.trim()
    })),
    positives: parsed.positives ?? []
  };
}

// ─── Main Review Engine ───────────────────────────────────────────────────────

export async function reviewCode(files: CodeFile[], onProgress?: (msg: string) => void, signal?: AbortSignal): Promise<CodeReviewResult> {
  if (files.length === 0) throw new Error("No files provided");

  const totalLines = files.reduce((sum, f) => sum + countLines(f.content), 0);
  const fileReviews: FileReview[] = [];
  const stashedFiles: CodeFile[] = [];

  if (onProgress) onProgress(`[INIT] Smart PowerShell Walker engaged for ${files.length} nodes...`);

  // 1. PRIMARY SWEEP
  for (let i = 0; i < files.length; i++) {
    if (signal?.aborted) throw new Error("Audit aborted");
    const file = files[i];
    
    // Quick skip for tiny files
    if (file.content.length < 50 && !file.path.endsWith('.ts')) {
        fileReviews.push({ path: file.path, language: detectLanguage(file.path), score: 100, summary: "Metadata file.", issues: [], positives: [] });
        continue;
    }

    if (onProgress) onProgress(`[WALKING] ${i + 1}/${files.length}: ${file.path}`);

    try {
      const review = await auditSingleFile(file, signal, onProgress);
      fileReviews.push(review);
      // MANDATORY COOL-DOWN: 1.5s between files to respect 12k TPM
      await sleep(1500); 
    } catch (e: any) {
      if (onProgress) onProgress(`[STASHED] ${file.path} queued for recovery.`);
      stashedFiles.push(file);
    }
  }

  // 2. RECOVERY PHASE
  if (stashedFiles.length > 0) {
    if (onProgress) onProgress(`[RECOVERY] Attempting to rebuild ${stashedFiles.length} modules...`);
    await sleep(5000); 

    for (let i = 0; i < stashedFiles.length; i++) {
      if (signal?.aborted) throw new Error("Audit aborted");
      const file = stashedFiles[i];
      if (onProgress) onProgress(`[RETRY] ${i + 1}/${stashedFiles.length}: ${file.path}`);

      try {
        const review = await auditSingleFile(file, signal, onProgress);
        fileReviews.push(review);
        await sleep(2000); 
      } catch (e: any) {
        if (onProgress) onProgress(`[SKIP] ${file.path} skipped after 2nd failure.`);
      }
    }
  }

  if (onProgress) onProgress("[SYNTHESIS] Collating architectural findings...");

  // 3. ARCHITECTURAL SYNTHESIS (With Fail-Safe Fallback)
  let global: any = null;
  try {
    const aggregatorPrompt = `Synthesize these file audits. Return valid JSON.
    SCHEMA: { "overallScore": 0-100, "summary": "", "recommendations": [], "categories": { "security": { "score": 0, "count": 0, "critical": 0 }, "performance": { "score": 0, "count": 0, "critical": 0 }, "bestPractices": { "score": 0, "count": 0, "critical": 0 }, "refactoring": { "score": 0, "count": 0, "critical": 0 } } }`;

    const summaries = fileReviews.map(r => `FILE: ${r.path}\nSCORE: ${r.score}`).join("\n");
    const globalRaw = await callGroq(aggregatorPrompt, `FILE SUMMARIES:\n${summaries}`, onProgress, 10, signal);
    global = JSON.parse(globalRaw.replace(/```json\n?|```\n?/g, ""));
  } catch (err: any) {
    if (onProgress) onProgress("[FALLBACK] Neural Synthesis limited. Calculating local metrics...");
    const avgScore = Math.round(fileReviews.reduce((s, r) => s + r.score, 0) / (fileReviews.length || 1));
    const allIssues = fileReviews.flatMap(r => r.issues);
    global = {
      overallScore: avgScore,
      summary: `Analyzed ${fileReviews.length} files. Platform detected ${allIssues.length} potential optimizations. Local verification complete.`,
      recommendations: ["Review top critical issues in the Registry Archives."],
      categories: {
        security: { score: avgScore, count: allIssues.filter(i => i.category === 'security').length, critical: allIssues.filter(i => i.category === 'security' && i.severity === 'critical').length },
        performance: { score: avgScore, count: allIssues.filter(i => i.category === 'performance').length, critical: allIssues.filter(i => i.category === 'performance' && i.severity === 'critical').length },
        bestPractices: { score: avgScore, count: allIssues.filter(i => i.category === 'best-practice').length, critical: allIssues.filter(i => i.category === 'best-practice' && i.severity === 'critical').length },
        refactoring: { score: avgScore, count: allIssues.filter(i => i.category === 'refactor').length, critical: allIssues.filter(i => i.category === 'refactor' && i.severity === 'critical').length }
      }
    };
  }

  const allIssues = fileReviews.flatMap(r => r.issues);
  const topIssues = allIssues.sort((a, b) => (a.severity === 'critical' ? -1 : 1)).slice(0, 10);

  return {
    overallScore: global.overallScore ?? 85,
    grade: gradeFromScore(global.overallScore ?? 85),
    summary: global.summary ?? "Audit successful.",
    linesOfCode: totalLines,
    filesReviewed: fileReviews.length,
    language: detectLanguage(files[0]?.path ?? ""),
    categories: global.categories,
    files: fileReviews,
    topIssues,
    recommendations: global.recommendations ?? [],
  };
}

// ─── GitHub File Fetcher ──────────────────────────────────────────────────────

export async function fetchGitHubFiles(
  repoFullName: string,
  accessToken: string,
  branch = "main",
  maxFiles = 100 
): Promise<CodeFile[]> {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/vnd.github.v3+json",
  };

  let treeRes = await fetch(
    `https://api.github.com/repos/${repoFullName}/git/trees/${branch}?recursive=1`,
    { headers }
  );

  if (treeRes.status === 404 && branch === "main") {
    treeRes = await fetch(
      `https://api.github.com/repos/${repoFullName}/git/trees/master?recursive=1`,
      { headers }
    );
  }

  if (!treeRes.ok) throw new Error(`GitHub Repository not found.`);

  const tree = await treeRes.json();
  const SKIP_PATTERNS = /node_modules|\.next|dist|build|\.git|\.lock|package-lock|\.min\.|\.map|__tests__|\.test\.|\.spec\.|svg|png|jpg|jpeg|ico|pdf|zip|gz/;
  const CODE_EXTENSIONS = /\.(ts|tsx|js|jsx|py|rb|go|rs|java|cs|cpp|c|php|swift|kt|vue|svelte|sql|sh|css|scss)$/i;

  const codeFiles = (tree.tree as { path: string; type: string; size?: number }[])
    .filter(
      (item) =>
        item.type === "blob" &&
        CODE_EXTENSIONS.test(item.path) &&
        !SKIP_PATTERNS.test(item.path) &&
        (item.size || 0) < 60000 
    )
    .slice(0, maxFiles);

  const files = await Promise.all(
    codeFiles.map(async (item) => {
      const contentRes = await fetch(
        `https://api.github.com/repos/${repoFullName}/contents/${item.path}?ref=${branch}`,
        { headers }
      );
      if (!contentRes.ok) return null;
      const data = await contentRes.json();
      const content = Buffer.from(data.content, "base64").toString("utf-8");
      return { path: item.path, content, language: detectLanguage(item.path) } as CodeFile;
    })
  );

  return files.filter(Boolean) as CodeFile[];
}

// ─── ZIP Extractor ────────────────────────────────────────────────────────────

export async function extractZipFiles(zipBuffer: Buffer): Promise<CodeFile[]> {
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(zipBuffer);

  const SKIP_PATTERNS = /node_modules|\.next|dist|build|\.git|\.lock|package-lock|\.min\.|\.map/;
  const CODE_EXTENSIONS = /\.(ts|tsx|js|jsx|py|rb|go|rs|java|cs|cpp|c|php|swift|kt|vue|svelte|sql|sh|css|scss)$/i;

  const files: CodeFile[] = [];

  for (const [path, file] of Object.entries(zip.files)) {
    if (
      file.dir ||
      SKIP_PATTERNS.test(path) ||
      !CODE_EXTENSIONS.test(path) ||
      files.length >= 100
    ) continue;

    const content = await file.async("string");
    files.push({ path, content, language: detectLanguage(path) });
  }

  return files;
}
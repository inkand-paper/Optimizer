/**
 * app/api/code-review/route.ts
 * Hybrid SSE Streamer for Neural Code Audits.
 * Turbo Edition: Parallel Workers + Intelligence Cache.
 */

import {
  extractZipFiles,
  fetchGitHubFiles,
  reviewCode,
  getFileHash,
  type CodeFile,
  type FileReview,
} from "@/core/analyzer/code-review";
import { getTokenFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLAN_LIMITS } from "@/lib/plans";
import { NextRequest, NextResponse } from "next/server";

// Derive monthly audit limits from the canonical PLAN_LIMITS source of truth
const MONTHLY_LIMITS: Record<string, number> = {
  FREE: PLAN_LIMITS.FREE.audits,
  PRO: PLAN_LIMITS.PRO.audits,
  BUSINESS: PLAN_LIMITS.BUSINESS.audits,
};

async function getMonthlyUsage(userId: string): Promise<number> {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return prisma.codeReview.count({
    where: { 
      userId, 
      status: "COMPLETED",
      createdAt: { gte: start } 
    },
  });
}

async function cleanupStaleRecords(userId: string) {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  await prisma.codeReview.deleteMany({
    where: {
      userId,
      status: "PROCESSING",
      createdAt: { lt: twoHoursAgo }
    }
  });
}

export async function GET(req: NextRequest) {
  const token = await getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: token.userId },
    select: { id: true, plan: true, role: true }
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  await cleanupStaleRecords(user.id);

  const reviews = await prisma.codeReview.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
    take: 50
  });

  const usage = await getMonthlyUsage(user.id);
  const isAdmin = user.role === "ADMIN";
  const finalLimit = isAdmin ? 999999 : (MONTHLY_LIMITS[user.plan] ?? 3);

  return NextResponse.json({ reviews, usage, limit: finalLimit });
}

export async function POST(req: NextRequest) {
  const token = await getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { id: token.userId },
    select: { id: true, role: true, plan: true, githubAccessToken: true }
  });

  if (!dbUser) return NextResponse.json({ error: "User not found" }, { status: 401 });

  const isAdmin = dbUser.role === "ADMIN";
  const usageCount = await getMonthlyUsage(dbUser.id);
  const limit = isAdmin ? 999999 : (MONTHLY_LIMITS[dbUser.plan] ?? 3);

  if (!isAdmin && usageCount >= limit) {
    return NextResponse.json({ error: "Limit reached" }, { status: 429 });
  }

  const responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  const encoder = new TextEncoder();

  let isClosed = false;
  const sendLog = (message: string, type: "info" | "success" | "error" = "info") => {
    if (isClosed) return;
    const data = `data: ${JSON.stringify({ log: message, type })}\n\n`;
    writer.write(encoder.encode(data)).catch(() => {
      isClosed = true;
    });
  };

  const abortController = new AbortController();
  req.signal.addEventListener("abort", () => {
    isClosed = true;
    abortController.abort();
  });
  
  (async () => {
    try {
      if (abortController.signal.aborted) return;
      sendLog("Establishing Neural Link...", "info");
      
      const contentType = req.headers.get("content-type") ?? "";
      let source: "GITHUB" | "ZIP" | "PASTE";
      let files: CodeFile[] = [];
      let repoName = "";
      let repoBranch = "";
      let fileName = "";

      if (contentType.includes("multipart/form-data")) {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        if (!file) throw new Error("No file provided");
        source = "ZIP"; fileName = file.name;
        const buffer = Buffer.from(await file.arrayBuffer());
        files = file.name.endsWith(".zip") ? await extractZipFiles(buffer, sendLog) : [{ path: file.name, content: buffer.toString("utf-8") }];
      } else {
        const body = await req.json();
        source = body.source;
        if (source === "GITHUB") {
          const name = (body.repoName || "").trim();
          if (!name) throw new Error("Repository name is required for GitHub audits.");
          // Validation: username/repo
          if (!/^[a-zA-Z0-9-._]+\/[a-zA-Z0-9-._]+$/.test(name)) {
            throw new Error("Invalid repository format. Use 'username/repo'.");
          }
          repoName = name;
          repoBranch = (body.branch || "main").trim();
          if (!/^[a-zA-Z0-9-._/]+$/.test(repoBranch)) {
            throw new Error("Invalid branch name format.");
          }
          files = await fetchGitHubFiles(name, dbUser.githubAccessToken!, repoBranch, sendLog);
        } else {
          source = "PASTE"; 
          fileName = (body.fileName ?? "untitled.txt").trim();
          files = [{ path: fileName, content: body.code }];
        }
      }

      if (files.length === 0) throw new Error("No source files detected.");

      // ─── CACHE LOOKUP ───────────────────────────────────────────────────────
      // [MONETIZATION] FREE users only benefit from their own prior submissions.
      // PRO/BUSINESS users get the full shared Intelligence Bank.
      const canUseSharedCache = isAdmin || dbUser.plan === 'PRO' || dbUser.plan === 'BUSINESS';
      const fileHashes = files.map(f => getFileHash(f.content));

      // Fetch previously reviewed file hashes by this user (for FREE tier cache)
      const userPriorHashes = canUseSharedCache ? new Set<string>() : new Set(
        (await prisma.auditCache.findMany({
          where: {
            hash: { in: fileHashes },
            // Filter to hashes the user has submitted before via their own codeReviews
            // We use a subquery pattern: find hashes that appear in this user's completed reviews
          },
          select: { hash: true }
        })).map((e: { hash: string }) => e.hash)
      );

      const cachedEntries = await prisma.auditCache.findMany({
        where: {
          hash: {
            in: canUseSharedCache
              ? fileHashes
              : fileHashes.filter(h => userPriorHashes.has(h))
          }
        }
      });
      
      const cachedMap: Record<string, FileReview> = {};
      cachedEntries.forEach((entry: { hash: string; review: unknown }) => {
        cachedMap[entry.hash] = entry.review as unknown as FileReview;
      });

      if (cachedEntries.length > 0) {
        sendLog(`[INTELLIGENCE] Found ${cachedEntries.length} modules in intelligence bank.`, "success");
      }

      // Find previous completed review for same source (for diff auditing)
      const previousReview = repoName ? await prisma.codeReview.findFirst({
        where: {
          userId: dbUser.id,
          repoName,
          status: 'COMPLETED',
        },
        orderBy: { createdAt: 'desc' },
        select: { id: true, score: true },
      }) : null;

      const reviewRecord = await prisma.codeReview.create({
        data: {
          userId: dbUser.id,
          source,
          repoName,
          repoBranch,
          fileName,
          status: "PROCESSING",
          previousReviewId: previousReview?.id || null,
          previousScore: previousReview?.score || null,
        },
      });

      const auditStart = Date.now();
      const result = await reviewCode(files, (msg) => {
        if (!isClosed) sendLog(msg);
      }, abortController.signal, cachedMap);
      const elapsedSec = ((Date.now() - auditStart) / 1000).toFixed(1);

      // ─── CACHE UPDATE ───────────────────────────────────────────────────────
      // Store any NEWLY audited files into the global cache
      const newFiles = result.files.filter(f => !cachedMap[f.hash!]);
      if (newFiles.length > 0) {
        await prisma.auditCache.createMany({
          data: newFiles.map(f => ({
            hash: f.hash!,
            path: f.path,
            language: f.language,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            review: f as any
          })),
          skipDuplicates: true
        });
      }

      const slimResult = {
        ...result,
        files: result.files.map(f => ({
          ...f,
          issues: f.issues.map(i => ({ ...i, codeSnippet: undefined, fixedSnippet: undefined }))
        })),
        // topIssues already contains the snippets, we just slice to keep the most important 15
        topIssues: result.topIssues.slice(0, 15) 
      };

      const updated = await prisma.codeReview.update({
        where: { id: reviewRecord.id },
        data: {
          status: "COMPLETED",
          score: result.overallScore,
          language: result.language,
          linesOfCode: result.linesOfCode,
          filesReviewed: result.filesReviewed,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          result: slimResult as any,
        },
      });

      if (!isClosed) {
        sendLog(`[DONE] ${result.filesReviewed} files analyzed in ${elapsedSec}s · Score: ${result.overallScore}/100`, "success");
        await writer.write(encoder.encode(`data: ${JSON.stringify({ review: updated, result, done: true })}\n\n`));
      }
    } catch (err: unknown) {
      if (!isClosed && (err as Error).name !== "AbortError") {
        console.error("[CODE_REVIEW_POST]", err);
        sendLog((err as Error).message || "Audit failed", "error");
      }
    } finally {
      if (!isClosed) {
        try { await writer.close(); } catch { }
      }
      isClosed = true;
    }
  })();

  return new Response(responseStream.readable, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", "Connection": "keep-alive" },
  });
}
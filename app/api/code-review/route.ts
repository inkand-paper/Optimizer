/**
 * app/api/code-review/route.ts
 * Hybrid SSE Streamer for Neural Code Audits.
 * Optimized for Database Health and Resilient Streaming.
 */

import {
  extractZipFiles,
  fetchGitHubFiles,
  reviewCode,
  type CodeFile,
} from "@/core/analyzer/code-review";
import { getTokenFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const MONTHLY_LIMITS: Record<string, number> = {
  FREE: 3,
  PRO: 50,
  BUSINESS: 9999,
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

  // DEFENSIVE LOGGING
  let isClosed = false;
  const sendLog = async (message: string, type: "info" | "success" | "error" = "info") => {
    if (isClosed) return;
    try { 
      await writer.write(encoder.encode(`data: ${JSON.stringify({ log: message, type })}\n\n`)); 
    } catch { 
      isClosed = true;
    }
  };

  const abortController = new AbortController();
  req.signal.addEventListener("abort", () => {
    isClosed = true;
    abortController.abort();
  });
  
  (async () => {
    try {
      if (abortController.signal.aborted) return;
      const contentType = req.headers.get("content-type") ?? "";
      let source: "GITHUB" | "ZIP" | "PASTE";
      let files: CodeFile[] = [];
      let repoName: string | undefined;
      let repoBranch: string | undefined;
      let fileName: string | undefined;

      if (contentType.includes("multipart/form-data")) {
        const formData = await req.formData();
        const file = formData.get("file") as File | null;
        if (!file) throw new Error("No file provided");
        source = "ZIP"; fileName = file.name;
        const buffer = Buffer.from(await file.arrayBuffer());
        files = file.name.endsWith(".zip") ? await extractZipFiles(buffer) : [{ path: file.name, content: buffer.toString("utf-8") }];
      } else {
        const body = await req.json();
        source = body.source;
        if (source === "GITHUB") {
          repoName = (body.repoName || "").trim();
          repoBranch = (body.branch || "main").trim();
          files = await fetchGitHubFiles(repoName, dbUser.githubAccessToken!, repoBranch);
        } else {
          source = "PASTE"; fileName = body.fileName ?? "untitled.txt";
          files = [{ path: fileName, content: body.code }];
        }
      }

      if (files.length === 0) throw new Error("No source files detected.");

      const reviewRecord = await prisma.codeReview.create({
        data: { userId: dbUser.id, source, repoName, repoBranch, fileName, status: "PROCESSING" },
      });

      const result = await reviewCode(files, (msg) => {
        if (!isClosed) sendLog(msg);
      }, abortController.signal);

      const slimResult = {
        ...result,
        files: result.files.map(f => ({
          ...f,
          issues: f.issues.map(i => ({ ...i, codeSnippet: undefined, fixedSnippet: undefined }))
        })),
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
          result: slimResult as any,
        },
      });

      if (!isClosed) {
        await sendLog("Audit synchronized.", "success");
        await writer.write(encoder.encode(`data: ${JSON.stringify({ review: updated, result, done: true })}\n\n`));
      }
    } catch (err: any) {
      if (!isClosed && err.name !== "AbortError") {
        console.error("[CODE_REVIEW_POST]", err);
        sendLog(err.message || "Audit failed", "error");
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
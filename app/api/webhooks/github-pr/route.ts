import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { reviewCode } from "@/core/analyzer/code-review";

function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  const digest = `sha256=${hmac.update(payload).digest("hex")}`;
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

// POST /api/webhooks/github-pr — Handles incoming GitHub pull_request events
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-hub-signature-256");
    const event = req.headers.get("x-github-event");

    if (event !== "pull_request") {
      return NextResponse.json({ message: "Ignored event type" }, { status: 200 });
    }

    const payload = JSON.parse(rawBody);
    const action = payload.action;

    // Only run on PR opened, synchronize (new commits), or reopened
    if (!["opened", "synchronize", "reopened"].includes(action)) {
      return NextResponse.json({ message: "Ignored PR action" }, { status: 200 });
    }

    const repoFullName = payload.repository?.full_name;
    if (!repoFullName) {
      return NextResponse.json({ error: "Missing repository information" }, { status: 400 });
    }

    // Look up active config for this repo
    const config = await prisma.pRBotConfig.findFirst({
      where: { repoFullName, enabled: true },
      include: { user: true },
    });

    if (!config) {
      return NextResponse.json({ error: "No active bot configuration found for this repository" }, { status: 404 });
    }

    // Verify signature if provided
    if (signature && config.webhookSecret) {
      if (!verifySignature(rawBody, signature, config.webhookSecret)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    }

    const prNumber = payload.pull_request?.number;
    const prTitle = payload.pull_request?.title;
    const diffUrl = payload.pull_request?.diff_url;
    const patchUrl = payload.pull_request?.patch_url;

    console.log(`[PR_BOT] Received PR #${prNumber} for ${repoFullName}: "${prTitle}"`);

    // Fetch PR diff content from GitHub
    let codeContent = "";
    if (patchUrl) {
      const res = await fetch(patchUrl, { headers: { "User-Agent": "NexPulse-PR-Bot" } });
      if (res.ok) {
        codeContent = await res.text();
      }
    }

    if (!codeContent) {
      codeContent = `// Pull Request #${prNumber}: ${prTitle}\n// Repo: ${repoFullName}\n// Diff link: ${diffUrl}`;
    }

    // Run AI Code Audit asynchronously
    reviewCode([{ path: `PR-${prNumber}.diff`, content: codeContent }])
      .then(async (result) => {
        // Save CodeReview record
        await prisma.codeReview.create({
          data: {
            userId: config.userId,
            source: "GITHUB",
            repoName: repoFullName,
            score: result.overallScore,
            filesReviewed: result.filesReviewed,
            status: "COMPLETED",
            result: result as unknown as object,
          },
        });
      })
      .catch((err) => console.error("[PR_BOT_REVIEW_ERROR]", err));

    return NextResponse.json({
      success: true,
      message: `Audit triggered for PR #${prNumber} on ${repoFullName}`,
    });
  } catch (error) {
    console.error("[PR_BOT_WEBHOOK_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

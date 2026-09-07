import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// GET /api/pr-bot — List user's PR Bot configurations
export async function GET(req: NextRequest) {
  try {
    const decoded = await getTokenFromRequest(req);
    if (!decoded?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const configs = await prisma.pRBotConfig.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ configs });
  } catch (error) {
    console.error("[PR_BOT_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/pr-bot — Connect a GitHub repository for automated PR audits
export async function POST(req: NextRequest) {
  try {
    const decoded = await getTokenFromRequest(req);
    if (!decoded?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { repoFullName } = await req.json();
    if (!repoFullName || typeof repoFullName !== "string" || !repoFullName.includes("/")) {
      return NextResponse.json(
        { error: "Invalid repository format. Must be owner/repo (e.g. inkand-paper/Optimizer)." },
        { status: 400 }
      );
    }

    const cleanRepo = repoFullName.trim();
    const webhookSecret = crypto.randomBytes(24).toString("hex");

    // Upsert or create configuration
    const config = await prisma.pRBotConfig.upsert({
      where: {
        userId_repoFullName: {
          userId: decoded.userId,
          repoFullName: cleanRepo,
        },
      },
      update: {
        enabled: true,
        webhookSecret,
      },
      create: {
        userId: decoded.userId,
        repoFullName: cleanRepo,
        enabled: true,
        webhookSecret,
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const webhookUrl = `${appUrl}/api/webhooks/github-pr`;

    return NextResponse.json({
      config,
      setup: {
        webhookUrl,
        webhookSecret,
        instructions: [
          `Go to GitHub repo settings: github.com/${cleanRepo}/settings/hooks`,
          `Click 'Add webhook'`,
          `Set Payload URL to: ${webhookUrl}`,
          `Set Content type to: application/json`,
          `Paste Secret: (shown below)`,
          `Select individual events -> check 'Pull requests'`,
          `Click 'Add webhook' to activate.`,
        ],
      },
    });
  } catch (error) {
    console.error("[PR_BOT_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH /api/pr-bot — Enable or disable a PR Bot config
export async function PATCH(req: NextRequest) {
  try {
    const decoded = await getTokenFromRequest(req);
    if (!decoded?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { configId, enabled } = await req.json();
    if (!configId) {
      return NextResponse.json({ error: "Missing configId" }, { status: 400 });
    }

    const config = await prisma.pRBotConfig.updateMany({
      where: { id: configId, userId: decoded.userId },
      data: { enabled: Boolean(enabled) },
    });

    return NextResponse.json({ success: true, updatedCount: config.count });
  } catch (error) {
    console.error("[PR_BOT_PATCH_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE /api/pr-bot — Remove a PR Bot config
export async function DELETE(req: NextRequest) {
  try {
    const decoded = await getTokenFromRequest(req);
    if (!decoded?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { configId } = await req.json();
    if (!configId) {
      return NextResponse.json({ error: "Missing configId" }, { status: 400 });
    }

    await prisma.pRBotConfig.deleteMany({
      where: { id: configId, userId: decoded.userId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PR_BOT_DELETE_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

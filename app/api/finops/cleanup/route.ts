import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/finops/cleanup — Execute zombie cloud resource termination
export async function POST(req: NextRequest) {
  try {
    const decoded = await getTokenFromRequest(req);
    if (!decoded || typeof decoded.userId !== "string") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = decoded.userId;

    const { resourceId, resourceName, provider, costMonthly } = await req.json();

    if (!resourceName || typeof costMonthly !== "number") {
      return NextResponse.json({ error: "Missing resource details" }, { status: 400 });
    }

    // Record cleanup activity log
    await prisma.activityLog.create({
      data: {
        userId,
        type: "FINOPS_CLEANUP",
        action: `Terminated ${provider || "Cloud"} Zombie Resource: ${resourceName}`,
        status: "SUCCESS",
        details: {
          resourceId,
          resourceName,
          provider,
          costSavedMonthly: costMonthly,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully terminated ${resourceName}. Recovered $${costMonthly}/mo in cloud spend.`,
      costSavedMonthly: costMonthly,
    });
  } catch (error) {
    console.error("[FINOPS_CLEANUP_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

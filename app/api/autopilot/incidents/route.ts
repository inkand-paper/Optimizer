import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/autopilot/incidents — List active & resolved incidents for user
export async function GET(req: NextRequest) {
  try {
    const decoded = await getTokenFromRequest(req);
    if (!decoded || typeof decoded.userId !== "string") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = decoded.userId;

    let incidents = await prisma.autopilotIncident.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    // Seed default sample incident if none exist for a realistic initial experience
    if (incidents.length === 0) {
      const sample = await prisma.autopilotIncident.create({
        data: {
          userId,
          title: "API Latency Degradation Detected",
          severity: "HIGH",
          status: "OPEN",
          mode: "RECOMMEND",
          targetNode: "/api/products",
          impact: "~18% of requests experiencing p95 latency spike from 420ms → 1.8s",
          rootCause: "PostgreSQL query regression introduced in deployment #a83f21",
          confidence: 89,
          recommendedFix: "Rollback deployment #a83f21 and flush Redis query cache pool",
        },
      });
      incidents = [sample];
    }

    return NextResponse.json({ incidents });
  } catch (error) {
    console.error("[AUTOPILOT_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST /api/autopilot/incidents — Create a new incident or update mode settings
export async function POST(req: NextRequest) {
  try {
    const decoded = await getTokenFromRequest(req);
    if (!decoded || typeof decoded.userId !== "string") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = decoded.userId;

    const body = await req.json();

    const incident = await prisma.autopilotIncident.create({
      data: {
        userId,
        title: body.title || "Telemetry Anomaly Detected",
        severity: body.severity || "HIGH",
        status: "OPEN",
        mode: body.mode || "RECOMMEND",
        targetNode: body.targetNode || "/api/endpoint",
        impact: body.impact || "Latency increase detected",
        rootCause: body.rootCause || "Correlated deployment regression",
        confidence: body.confidence || 85,
        recommendedFix: body.recommendedFix || "Inspect logs and revalidate cache",
      },
    });

    return NextResponse.json({ incident });
  } catch (error) {
    console.error("[AUTOPILOT_POST_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH /api/autopilot/incidents — Execute remediation or update incident status
export async function PATCH(req: NextRequest) {
  try {
    const decoded = await getTokenFromRequest(req);
    if (!decoded || typeof decoded.userId !== "string") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = decoded.userId;

    const { incidentId, actionTaken, status } = await req.json();
    if (!incidentId) {
      return NextResponse.json({ error: "Missing incidentId" }, { status: 400 });
    }

    const updated = await prisma.autopilotIncident.updateMany({
      where: { id: incidentId, userId },
      data: {
        status: status || "REMEDIATED",
        actionTaken: actionTaken || "Remediation executed automatically",
        remediatedAt: new Date(),
      },
    });

    // Create ActivityLog entry for operational transparency
    await prisma.activityLog.create({
      data: {
        userId,
        type: "AUTOPILOT_REMEDIATE",
        action: actionTaken || "Executed incident fix",
        status: "SUCCESS",
        details: { incidentId, actionTaken },
      },
    });

    return NextResponse.json({ success: true, count: updated.count });
  } catch (error) {
    console.error("[AUTOPILOT_PATCH_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

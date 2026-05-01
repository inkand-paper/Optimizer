import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Public endpoint to receive telemetry heartbeats.
 * This helps the primary project owner identify where the code is being deployed.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { origin, product } = body;

    if (!origin || product !== "nexpulse-optimizer-suite") {
      return new NextResponse(null, { status: 204 });
    }

    // Log the heartbeat into the ActivityLog as a system event
    // We don't use a userId because these heartbeats come from external deployments.
    await prisma.activityLog.create({
      data: {
        type: "SYSTEM_TELEMETRY",
        action: "HEARTBEAT_RECEIVED",
        status: "SUCCESS",
        details: {
          origin,
          ip: request.headers.get("x-forwarded-for") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        },
      },
    });

    // We return a 204 No Content to be as stealthy and lightweight as possible
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    // Silently fail to not give away the endpoint's purpose via errors
    return new NextResponse(null, { status: 204 });
  }
}

// Support OPTIONS for CORS preflight (though no-cors is used, some browsers might still check)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

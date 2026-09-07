import { NextRequest, NextResponse } from "next/server";
import { getTokenFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET /api/finops/resources — Fetch active (non-dismissed) zombie resources for the user
export async function GET(req: NextRequest) {
  try {
    const decoded = await getTokenFromRequest(req);
    if (!decoded?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resources = await prisma.zombieResource.findMany({
      where: { userId: decoded.userId, dismissed: false },
      orderBy: { costMonthly: "desc" },
    });

    const totalMonthlyWaste = resources.reduce((sum: number, r: { costMonthly: number }) => sum + r.costMonthly, 0);

    return NextResponse.json({ resources, totalMonthlyWaste });
  } catch (error) {
    console.error("[FINOPS_RESOURCES_GET_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { cancelSubscription } from "@lemonsqueezy/lemonsqueezy.js";
import { getTokenFromRequest } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import "@/lib/lemonsqueezy"; // Ensure SDK is initialised

export async function POST(req: NextRequest) {
  try {
    const decoded = await getTokenFromRequest(req);
    if (!decoded?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the user's current subscriptionId
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { subscriptionId: true, plan: true, email: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.subscriptionId) {
      return NextResponse.json(
        { error: "No active subscription found on this account." },
        { status: 400 }
      );
    }

    if (user.plan === "FREE") {
      return NextResponse.json(
        { error: "Your account is already on the Free plan." },
        { status: 400 }
      );
    }

    // Call LemonSqueezy to cancel the subscription
    // This schedules cancellation at end of current billing period.
    const { data, error } = await cancelSubscription(user.subscriptionId);

    if (error) {
      console.error("[BILLING_CANCEL] LemonSqueezy error:", error);
      return NextResponse.json(
        { error: "Failed to cancel subscription. Please try again or contact support." },
        { status: 500 }
      );
    }

    // Extract end date from LS response
    const endsAt: string | null = data?.data?.attributes?.ends_at ?? null;

    console.log(
      `[BILLING_CANCEL] Subscription cancelled for ${user.email}. Access until: ${endsAt ?? "end of period"}`
    );

    return NextResponse.json({
      success: true,
      endsAt, // ISO date string — e.g. "2026-10-07T00:00:00.000Z"
    });
  } catch (error) {
    console.error("[BILLING_CANCEL] Unhandled error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

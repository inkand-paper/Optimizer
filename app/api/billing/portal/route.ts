import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { lemonSqueezyId: true }
    });

    // If we have a LemonSqueezy ID, we can ideally generate a portal link.
    // For LemonSqueezy, the easiest way for the user to manage is through their email receipt
    // OR we can redirect them to the general customer portal if you have the Store ID.
    
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;
    if (!storeId) {
      return NextResponse.json({ error: "Billing system not configured" }, { status: 500 });
    }

    // LemonSqueezy dynamic portal link
    // Note: In a full implementation, you'd use the LS API to get a specific customer portal link.
    // For now, we will return the store's customer portal base which LS handles via email.
    const portalUrl = `https://nexpulse.lemonsqueezy.com/billing`;

    return NextResponse.json({ url: portalUrl });
  } catch (error) {
    console.error("[BILLING_PORTAL_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

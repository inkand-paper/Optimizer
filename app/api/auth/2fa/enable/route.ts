import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenFromRequest } from "@/lib/auth";
import speakeasy from "speakeasy";

export async function POST(req: NextRequest) {
  try {
    const decoded = await getTokenFromRequest(req);
    if (!decoded?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code } = await req.json();

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { twoFactorSecret: true, twoFactorEnabled: true }
    });

    if (!user || !user.twoFactorSecret) {
      return NextResponse.json({ error: "2FA setup not initiated" }, { status: 400 });
    }

    // Verify the code using speakeasy
    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token: code,
      window: 1 // Allowance for time drift (1 * 30 seconds)
    });

    if (!isValid) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    // Enable 2FA permanently
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { twoFactorEnabled: true }
    });

    return NextResponse.json({ success: true, message: "2FA enabled successfully" });
  } catch (error) {
    console.error("[2FA_ENABLE_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

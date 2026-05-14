import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenFromRequest } from "@/lib/auth";
import speakeasy from "speakeasy";
import qrcode from "qrcode";

export async function POST(req: NextRequest) {
  try {
    const decoded = await getTokenFromRequest(req);
    if (!decoded?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { email: true, name: true, twoFactorEnabled: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json({ error: "2FA is already enabled" }, { status: 400 });
    }

    // Generate secret and TOTP URL using speakeasy
    const secret = speakeasy.generateSecret({
      name: `NexPulse (${user.email})`,
      issuer: "NexPulse"
    });

    // Generate QR code as data URL
    const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url || "");

    // Temporarily store base32 secret in user
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { twoFactorSecret: secret.base32 }
    });

    return NextResponse.json({
      qrCodeUrl,
      secret: secret.base32,
    });
  } catch (error) {
    console.error("[2FA_SETUP_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

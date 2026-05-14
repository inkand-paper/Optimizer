import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenFromRequest } from "@/lib/auth";
import { authenticator } from "otplib";
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

    // Generate secret and TOTP URL
    const secret = authenticator.generateSecret();
    const otpauth = authenticator.keyuri(
      user.email,
      "NexPulse",
      secret
    );

    // Generate QR code as data URL
    const qrCodeUrl = await qrcode.toDataURL(otpauth);

    // Temporarily store secret in user (unverified state)
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { twoFactorSecret: secret }
    });

    return NextResponse.json({
      qrCodeUrl,
      secret, // Providing secret in case they want to enter manually
    });
  } catch (error) {
    console.error("[2FA_SETUP_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

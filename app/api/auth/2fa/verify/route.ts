import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signJwt, verifyJwt } from "@/lib/auth";
import { authenticator } from "otplib";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const { code, mfaToken } = await req.json();

    if (!code || !mfaToken) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Verify the temporary challenge token
    const decoded = verifyJwt(mfaToken) as { userId: string; mfaChallenge: boolean } | null;
    
    if (!decoded || !decoded.mfaChallenge) {
      return NextResponse.json({ error: "Invalid or expired MFA session" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, name: true, twoFactorSecret: true }
    });

    if (!user || !user.twoFactorSecret) {
      return NextResponse.json({ error: "MFA setup error" }, { status: 400 });
    }

    // Verify the 6-digit code
    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret,
    });

    if (!isValid) {
      return NextResponse.json({ error: "Invalid security code" }, { status: 400 });
    }

    // Generate permanent JWT
    const token = signJwt({ userId: user.id, email: user.email, role: user.role });
    
    // Set Secure HttpOnly Cookie
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error("[2FA_VERIFY_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

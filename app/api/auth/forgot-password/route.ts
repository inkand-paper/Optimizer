import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendEmail } from "@/lib/nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: "Email is required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // For security, don't reveal if user exists or not
    if (!user) {
      return NextResponse.json({ message: "If an account exists, a reset link has been sent." });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expiry,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

    await sendEmail({
      to: email,
      subject: "NexPulse — Reset Your Password",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto;">
          <h2 style="color: #B48C3C;">Password Reset Request</h2>
          <p>You requested to reset your NexPulse password. Click the button below to proceed. This link expires in 1 hour.</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background: #B48C3C; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0;">Reset Password</a>
          <p style="color: #666; font-size: 12px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({ message: "If an account exists, a reset link has been sent." });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json({ message: "Something went wrong" }, { status: 500 });
  }
}

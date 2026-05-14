import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/mail";
import { crypto } from "@/lib/auth"; // Assuming a helper for token generation exists or we use randomBytes

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: "Email already verified" }, { status: 400 });
    }

    // Generate a fresh verification token
    const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    await prisma.user.update({
      where: { email: session.user.email },
      data: { verificationToken: token },
    });

    await sendVerificationEmail({
      email: user.email,
      userName: user.name || "Operator",
      token: token,
    });

    return NextResponse.json({ success: true, message: "Verification email sent" });
  } catch (error) {
    console.error("[RESEND_VERIFICATION_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

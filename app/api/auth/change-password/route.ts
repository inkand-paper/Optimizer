import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenFromRequest } from "@/lib/auth";
import { sendSecurityAlert } from "@/lib/mail";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const decoded = await getTokenFromRequest(req);
    if (!decoded?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { currentPassword, newPassword } = await req.json();
    const userAgent = req.headers.get("user-agent") || "Unknown Device";

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.passwordHash) {
      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ error: "Current password incorrect" }, { status: 400 });
      }
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: decoded.userId },
      data: { passwordHash: hashedPassword },
    });

    // Parse a human-readable device/browser from User-Agent
    const device = userAgent.includes("Windows") ? "Windows PC" : 
                   userAgent.includes("Macintosh") ? "Mac" : 
                   userAgent.includes("iPhone") ? "iPhone" : 
                   userAgent.includes("Android") ? "Android Device" : "Unknown Device";
    
    const browser = userAgent.includes("Chrome") ? "Google Chrome" : 
                    userAgent.includes("Firefox") ? "Mozilla Firefox" : 
                    userAgent.includes("Safari") ? "Apple Safari" : 
                    userAgent.includes("Edge") ? "Microsoft Edge" : "Web Browser";

    await sendSecurityAlert({
      email: user.email,
      userName: user.name || "Operator",
      action: "Password",
      device,
      browser,
    });

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("[CHANGE_PASSWORD_ERROR]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


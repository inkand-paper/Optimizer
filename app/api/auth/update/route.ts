import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTokenFromRequest } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  try {
    const decoded = await getTokenFromRequest(req);
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // [SECURITY] Prevent DoS by checking content length before parsing JSON
    const contentLength = parseInt(req.headers.get("content-length") || "0");
    if (contentLength > 3 * 1024 * 1024) { // 3MB limit (includes buffer for JSON overhead)
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    const { name, image, weeklyDigestEnabled } = await req.json();
    
    // Ensure Base64 image is not too large (> 2MB)
    if (image && image.length > 2.5 * 1024 * 1024) { // Roughly 2MB in binary
      return NextResponse.json({ error: "Image too large" }, { status: 413 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: { name, image, ...(weeklyDigestEnabled !== undefined && { weeklyDigestEnabled }) },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        name: updatedUser.name,
        role: updatedUser.role,
        plan: updatedUser.plan,
        image: updatedUser.image,
        emailVerified: updatedUser.emailVerified,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

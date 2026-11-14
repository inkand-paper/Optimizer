import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signJwt } from "@/lib/auth";
import { cookies } from "next/headers";

/**
 * GET /api/auth/dev-login
 * Instant developer bypass for local preview and design verification.
 * Sets the authenticated admin session cookie and redirects directly to /dashboard.
 */
export async function GET(req: NextRequest) {
  // Never allow in production builds
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    // Find admin user (prefer tabir8431@gmail.com or admin@nexpulse.dev)
    const adminUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: "tabir8431@gmail.com" },
          { email: "admin@nexpulse.dev" },
          { role: "ADMIN" },
        ],
      },
    });

    if (!adminUser) {
      return NextResponse.json({ error: "No admin account available" }, { status: 404 });
    }

    const token = signJwt({
      userId: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    });

    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    // Also store user in a temporary cookie so dashboard gets immediate cache
    cookieStore.set("dev_bypass_user", JSON.stringify({
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      role: adminUser.role,
      plan: adminUser.plan,
    }), {
      httpOnly: false,
      secure: false,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60,
      path: "/",
    });

    return NextResponse.redirect(new URL("/dashboard", req.url));
  } catch (error) {
    console.error("[DEV_LOGIN_ERROR]", error);
    return NextResponse.json({ error: "Failed to initialize dev session" }, { status: 500 });
  }
}

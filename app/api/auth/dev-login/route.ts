import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { signJwt } from "@/lib/auth";
import { cookies } from "next/headers";

/**
 * GET /api/auth/dev-login
 * Developer bypass strictly restricted to local development environments.
 * Gated behind:
 * 1. NODE_ENV !== "production"
 * 2. Host header strictly localhost / 127.0.0.1
 * 3. Never exposes personal emails in source
 */
export async function GET(req: NextRequest) {
  // Hard blocker: never allow in production builds
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Hard blocker: strictly require localhost
  const host = req.headers.get("host") || "";
  const isLocalhost = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  if (!isLocalhost) {
    return NextResponse.json({ error: "Dev login restricted to localhost" }, { status: 403 });
  }

  try {
    // Find admin user from seeded admin or system admin role
    const adminUser = await prisma.user.findFirst({
      where: {
        OR: [
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

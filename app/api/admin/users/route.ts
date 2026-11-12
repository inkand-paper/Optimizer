import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest } from '@/lib/auth';

/**
 * [ADMIN] User Management API
 * Allows system administrators to view and modify user tiers and roles.
 */

async function ensureAdmin(req: NextRequest) {
  const decoded = await getTokenFromRequest(req);
  if (!decoded) {
    console.warn("[ADMIN SECURITY] No token found in request");
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { role: true, email: true }
  });

  if (!user || user.role !== 'ADMIN') {
    console.warn(`[ADMIN SECURITY] Access Denied for ${user?.email || 'Unknown'}. Role: ${user?.role || 'NONE'}`);
    return null;
  }

  console.log(`[ADMIN SECURITY] Access Granted to ${user.email}`);
  return decoded.userId;
}

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export async function GET(req: NextRequest) {
  const adminId = await ensureAdmin(req);
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor') ?? undefined;
    const limitRaw = parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10);
    const limit = Math.min(isNaN(limitRaw) || limitRaw < 1 ? DEFAULT_LIMIT : limitRaw, MAX_LIMIT);

    const userSelect = {
      id: true,
      email: true,
      name: true,
      role: true,
      plan: true,
      createdAt: true,
      _count: {
        select: { monitors: true, apiKeys: true }
      }
    } as const;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        select: userSelect,
        orderBy: { createdAt: 'desc' },
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      }),
      prisma.user.count(),
    ]);

    const hasMore = users.length > limit;
    const page = hasMore ? users.slice(0, limit) : users;
    const nextCursor = hasMore ? page[page.length - 1].id : null;

    return NextResponse.json({ success: true, users: page, nextCursor, total });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

const updateUserSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  plan: z.enum(['FREE', 'PRO', 'BUSINESS']).optional(),
  role: z.enum(['ADMIN', 'DEVELOPER', 'VIEWER']).optional(),
});

export async function PATCH(req: NextRequest) {
  const adminId = await ensureAdmin(req);
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation Error', message: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { userId, plan, role } = parsed.data;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(plan && { plan }),
        ...(role && { role })
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const adminId = await ensureAdmin(req);
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Prevent self-deletion
    if (userId === adminId) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 403 });
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}

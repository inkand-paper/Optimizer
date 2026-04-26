import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest } from '@/lib/auth';

/**
 * [ADMIN] User Management API
 * Allows system administrators to view and modify user tiers and roles.
 */

async function ensureAdmin(req: NextRequest) {
  const decoded = getTokenFromRequest(req);
  if (!decoded) return null;

  const user = await prisma.user.findUnique({
    where: { id: decoded.userId },
    select: { role: true }
  });

  return user?.role === 'ADMIN' ? decoded.userId : null;
}

export async function GET(req: NextRequest) {
  const adminId = await ensureAdmin(req);
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        plan: true,
        createdAt: true,
        _count: {
          select: { monitors: true, apiKeys: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100 // [PRODUCTION SCALE] Cap results to prevent OOM on large userbases
    });

    return NextResponse.json({ success: true, users });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const adminId = await ensureAdmin(req);
  if (!adminId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { userId, plan, role } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(plan && { plan }),
        ...(role && { role })
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
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

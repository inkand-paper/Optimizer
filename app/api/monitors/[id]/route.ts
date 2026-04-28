import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const decoded = getTokenFromRequest(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch the user from the database to get their REAL, CURRENT role
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    // Verify ownership or Admin status
    const monitor = await prisma.monitor.findUnique({ 
      where: { id },
      include: { user: true }
    });

    if (!monitor) {
      return NextResponse.json({ error: 'Monitor not found' }, { status: 404 });
    }

    const isOwner = monitor.userId === decoded.userId;
    const isAdmin = user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      console.warn(`[SECURITY] Unauthorized delete attempt by ${decoded.email} on monitor ${id}`);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Clean up related checks first (just to be safe, though Cascade should handle it)
    await prisma.check.deleteMany({ where: { monitorId: id } });
    
    // Delete the monitor
    await prisma.monitor.delete({ where: { id } });

    console.log(`[MONITOR] Deleted by ${isAdmin ? 'ADMIN' : 'OWNER'}: ${monitor.name} (${id})`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete monitor error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const decoded = getTokenFromRequest(request);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Fetch the user from the database to get their REAL, CURRENT role
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 401 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Valid name is required' }, { status: 400 });
    }

    // Verify ownership or Admin status
    const monitor = await prisma.monitor.findUnique({ where: { id } });
    
    if (!monitor) {
      return NextResponse.json({ error: 'Monitor not found' }, { status: 404 });
    }

    const isOwner = monitor.userId === decoded.userId;
    const isAdmin = user.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const updated = await prisma.monitor.update({
      where: { id },
      data: { name }
    });

    return NextResponse.json({ success: true, monitor: updated });
  } catch (error) {
    console.error('Update monitor error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

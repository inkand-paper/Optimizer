import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest } from '@/lib/auth';

async function ensureAdmin(req: NextRequest) {
  const token = await getTokenFromRequest(req);
  if (!token || token.role !== 'ADMIN') return null;
  return token;
}

// POST /api/admin/gift-trial — gift a plan to a user
export async function POST(req: NextRequest) {
  const token = await ensureAdmin(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { userId, plan, days, permanent, reason } = await req.json();

    if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    if (!plan || !['PRO', 'BUSINESS'].includes(plan)) {
      return NextResponse.json({ error: 'plan must be PRO or BUSINESS' }, { status: 400 });
    }
    if (!permanent && (!days || days < 1)) {
      return NextResponse.json({ error: 'days must be at least 1 unless permanent' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, plan: true },
    });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // If user already has a gifted trial, remove it first
    await prisma.giftedTrial.deleteMany({ where: { userId } });

    const expiresAt = permanent ? null : new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    await prisma.$transaction([
      prisma.giftedTrial.create({
        data: {
          userId,
          giftedBy: token.userId,
          plan,
          reason: reason || null,
          permanent: Boolean(permanent),
          expiresAt,
        },
      }),
      prisma.user.update({
        where: { id: userId },
        data: { plan: plan as never },
      }),
    ]);

    // Send gifted PRO email
    const { sendGiftedTrialEmail } = await import('@/lib/mail');
    sendGiftedTrialEmail({
      email: user.email,
      userName: user.name || 'there',
      plan,
      permanent: Boolean(permanent),
      expiresAt: expiresAt
        ? expiresAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : undefined,
    }).catch(console.error);

    return NextResponse.json({ success: true, expiresAt });
  } catch (error) {
    console.error('POST /api/admin/gift-trial error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/admin/gift-trial — revoke a gifted plan
export async function DELETE(req: NextRequest) {
  const token = await ensureAdmin(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ error: 'userId is required' }, { status: 400 });

    const gift = await prisma.giftedTrial.findUnique({ where: { userId } });
    if (!gift) return NextResponse.json({ error: 'No gifted trial found for this user' }, { status: 404 });

    await prisma.$transaction([
      prisma.giftedTrial.delete({ where: { userId } }),
      prisma.user.update({ where: { id: userId }, data: { plan: 'FREE' as never } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/admin/gift-trial error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest } from '@/lib/auth';

async function ensureAdmin(req: NextRequest) {
  const token = await getTokenFromRequest(req);
  if (!token || token.role !== 'ADMIN') return null;
  return token;
}

// GET /api/admin/student-trials?status=PENDING
export async function GET(req: NextRequest) {
  const token = await ensureAdmin(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || 'PENDING';

  const trials = await prisma.studentTrial.findMany({
    where: { status: status as never },
    include: {
      user: { select: { id: true, email: true, name: true, plan: true, createdAt: true } },
    },
    orderBy: { submittedAt: 'asc' }, // oldest first so nothing sits waiting
  });

  return NextResponse.json({ success: true, trials });
}

// PATCH /api/admin/student-trials — approve or reject
export async function PATCH(req: NextRequest) {
  const token = await ensureAdmin(req);
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { trialId, action, rejectionReason, rejectionNote } = await req.json();

  if (!trialId || !action) {
    return NextResponse.json({ error: 'trialId and action are required' }, { status: 400 });
  }
  if (!['APPROVE', 'REJECT'].includes(action)) {
    return NextResponse.json({ error: 'action must be APPROVE or REJECT' }, { status: 400 });
  }
  if (action === 'REJECT' && !rejectionReason) {
    return NextResponse.json({ error: 'rejectionReason is required when rejecting' }, { status: 400 });
  }

  const trial = await prisma.studentTrial.findUnique({
    where: { id: trialId },
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  if (!trial) return NextResponse.json({ error: 'Trial not found' }, { status: 404 });
  if (trial.status !== 'PENDING') {
    return NextResponse.json({ error: 'This application has already been reviewed.' }, { status: 409 });
  }

  if (action === 'APPROVE') {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await prisma.$transaction([
      prisma.studentTrial.update({
        where: { id: trialId },
        data: {
          status: 'APPROVED',
          reviewedAt: new Date(),
          reviewedBy: token.userId,
          expiresAt,
        },
      }),
      prisma.user.update({
        where: { id: trial.userId },
        data: { plan: 'PRO' as never },
      }),
    ]);

    // Send approval email
    const { sendStudentTrialEmail } = await import('@/lib/mail');
    sendStudentTrialEmail({
      email: trial.user.email,
      userName: trial.user.name || 'Student',
      eduEmail: trial.eduEmail,
      expiresAt: expiresAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    }).catch(console.error);

    return NextResponse.json({ success: true, action: 'APPROVED', expiresAt });
  }

  // REJECT
  await prisma.studentTrial.update({
    where: { id: trialId },
    data: {
      status: 'REJECTED',
      rejectionReason,
      rejectionNote: rejectionNote || null,
      reviewedAt: new Date(),
      reviewedBy: token.userId,
    },
  });

  // Send rejection email
  const { sendStudentRejectionEmail } = await import('@/lib/mail');
  sendStudentRejectionEmail({
    email: trial.user.email,
    userName: trial.user.name || 'Student',
    rejectionReason,
    rejectionNote: rejectionNote || undefined,
  }).catch(console.error);

  return NextResponse.json({ success: true, action: 'REJECTED' });
}

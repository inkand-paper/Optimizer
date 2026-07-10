import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

function isEduEmail(email: string): boolean {
  const lower = email.toLowerCase().trim();
  return (
    lower.endsWith('.edu') ||
    lower.endsWith('.ac.uk') ||
    lower.endsWith('.ac.in') ||
    lower.endsWith('.edu.au') ||
    lower.endsWith('.edu.bd') ||
    lower.endsWith('.ac.nz') ||
    lower.endsWith('.edu.sg') ||
    lower.endsWith('.edu.pk')
  );
}

export async function POST(req: NextRequest) {
  try {
    const token = await getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rl = await checkRateLimit(`student_verify_${token.userId}`, { maxRequests: 3, windowMs: 60 * 60 * 1000 });
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many attempts. Please wait an hour.' }, { status: 429 });
    }

    const { eduEmail } = await req.json();
    if (!eduEmail || typeof eduEmail !== 'string') {
      return NextResponse.json({ error: 'eduEmail is required' }, { status: 400 });
    }
    if (!isEduEmail(eduEmail)) {
      return NextResponse.json({ error: 'Invalid academic email. Use your university email (.edu, .ac.uk, .edu.bd, etc.)' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: token.userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (user.plan !== 'FREE') {
      return NextResponse.json({ error: 'Your account is already on a paid plan.' }, { status: 400 });
    }

    const existingByEmail = await prisma.studentTrial.findUnique({ where: { eduEmail: eduEmail.toLowerCase() } });
    if (existingByEmail) {
      return NextResponse.json({ error: 'This academic email has already been used for a student trial.' }, { status: 409 });
    }

    const existingByUser = await prisma.studentTrial.findUnique({ where: { userId: token.userId } });
    if (existingByUser) {
      return NextResponse.json({ error: 'You have already used your student trial.', expiresAt: existingByUser.expiresAt }, { status: 409 });
    }

    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await prisma.$transaction([
      prisma.studentTrial.create({
        data: { userId: token.userId, eduEmail: eduEmail.toLowerCase(), expiresAt, used: true },
      }),
      prisma.user.update({
        where: { id: token.userId },
        data: { plan: 'PRO' as never },
      }),
    ]);

    const { sendStudentTrialEmail } = await import('@/lib/mail');
    sendStudentTrialEmail({
      email: user.email,
      userName: user.name || 'Student',
      eduEmail: eduEmail.toLowerCase(),
      expiresAt: expiresAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    }).catch(console.error);

    return NextResponse.json({ success: true, message: 'Student trial activated! PRO access for 30 days.', expiresAt });
  } catch (error) {
    console.error('POST /api/student/verify error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const token = await getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const trial = await prisma.studentTrial.findUnique({ where: { userId: token.userId } });
    if (!trial) return NextResponse.json({ hasTrial: false });

    return NextResponse.json({ hasTrial: true, eduEmail: trial.eduEmail, expiresAt: trial.expiresAt, isExpired: trial.expiresAt < new Date() });
  } catch (error) {
    console.error('GET /api/student/verify error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

// POST /api/student/verify — submit academic email + ID card for manual review
export async function POST(req: NextRequest) {
  try {
    const token = await getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const rl = await checkRateLimit(`student_verify_${token.userId}`, { maxRequests: 50, windowMs: 60 * 60 * 1000 });
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many attempts. Please wait an hour.' }, { status: 429 });
    }

    const { eduEmail, studentIdUrl } = await req.json();

    if (!eduEmail || typeof eduEmail !== 'string') {
      return NextResponse.json({ error: 'Institutional email is required.' }, { status: 400 });
    }
    if (!studentIdUrl || typeof studentIdUrl !== 'string') {
      return NextResponse.json({ error: 'Student ID card upload is required.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: token.userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    if (user.plan !== 'FREE') {
      return NextResponse.json({ error: 'Your account is already on a paid plan.' }, { status: 400 });
    }

    // Check if email already used
    const existingByEmail = await prisma.studentTrial.findUnique({
      where: { eduEmail: eduEmail.toLowerCase() }
    });
    if (existingByEmail) {
      return NextResponse.json({ error: 'This email has already been used for a student trial.' }, { status: 409 });
    }

    // Check if user already has a trial (any status)
    const existingByUser = await prisma.studentTrial.findUnique({ where: { userId: token.userId } });
    if (existingByUser) {
      if (existingByUser.status === 'PENDING') {
        return NextResponse.json({ error: 'Your application is already under review. We will email you within 1-2 business days.' }, { status: 409 });
      }
      if (existingByUser.status === 'APPROVED') {
        return NextResponse.json({ error: 'You have already used your student trial.' }, { status: 409 });
      }
      // REJECTED — allow reapplication by deleting old record
      await prisma.studentTrial.delete({ where: { userId: token.userId } });
    }

    // Create PENDING record — no plan upgrade yet, admin must approve
    await prisma.studentTrial.create({
      data: {
        userId: token.userId,
        eduEmail: eduEmail.toLowerCase(),
        studentIdUrl,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      status: 'PENDING',
      message: 'Application submitted. We will review your student ID and email you within 1-2 business days.',
    });

  } catch (error) {
    console.error('POST /api/student/verify error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// GET /api/student/verify — check current user's trial status
export async function GET(req: NextRequest) {
  try {
    const token = await getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const trial = await prisma.studentTrial.findUnique({ where: { userId: token.userId } });
    if (!trial) return NextResponse.json({ hasTrial: false });

    return NextResponse.json({
      hasTrial: true,
      status: trial.status,
      eduEmail: trial.eduEmail,
      expiresAt: trial.expiresAt,
      isExpired: trial.expiresAt ? trial.expiresAt < new Date() : false,
      rejectionReason: trial.rejectionReason,
      rejectionNote: trial.rejectionNote,
    });
  } catch (error) {
    console.error('GET /api/student/verify error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

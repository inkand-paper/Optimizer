import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    // Find user with this token
    const user = await prisma.user.findUnique({
      where: { verificationToken: token }
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 404 });
    }

    // Update user to verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null // Clear the token after use
      }
    });

    // Redirect to login or success page
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${appUrl}/login?verified=true`);

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

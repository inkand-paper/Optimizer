import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePasswords, signJwt } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { checkRateLimit } from '@/lib/rate-limit';
import { dispatchSecurityAlert, SECURITY_THRESHOLDS } from '@/lib/security-monitor';
import { logActivity } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Protection (Max 5 attempts per minute per IP)
    // Use last IP from x-forwarded-for to resist spoofing via prepended IPs
    const forwarded = req.headers.get('x-forwarded-for') ?? '';
    const ip = forwarded.split(',').pop()?.trim() || '127.0.0.1';
    const rateLimit = await checkRateLimit(`login_${ip}`, { maxRequests: 5, windowMs: 60000 });
    
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Too Many Requests', message: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsedData = loginSchema.parse(body);
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: parsedData.email }
    });
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Verify password
    if (!user.passwordHash) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'This account uses social login. Please sign in with Google or GitHub.' },
        { status: 401 }
      );
    }

    const isPasswordValid = await comparePasswords(parsedData.password, user.passwordHash);
    
    if (!isPasswordValid) {
      // [SECURITY] Track failed attempts and detect brute force
      await logActivity({
        userId: user.id,
        type: 'AUTH',
        action: 'FAILED_LOGIN',
        status: 'FAILURE',
        details: { ip, reason: 'invalid_password' }
      });

      const failureCount = await prisma.activityLog.count({
        where: {
          action: 'FAILED_LOGIN',
          details: {
            path: ['ip'],
            equals: ip
          },
          createdAt: { gte: new Date(Date.now() - 60 * 60 * 1000) }
        }
      });

      if (failureCount >= SECURITY_THRESHOLDS.FAILED_LOGINS_PER_HOUR) {
        await dispatchSecurityAlert({
          type: 'BRUTE_FORCE_DETECTED',
          severity: 'high',
          message: `Multiple failed logins detected from IP: ${ip}`,
          metadata: { ip, attempts: failureCount, target: parsedData.email }
        });
      }

      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // 3. Email Verification Check
    if (!user.emailVerified) {
      return NextResponse.json(
        { 
          error: 'Forbidden', 
          message: 'Please verify your email address before logging in. Check your inbox for the activation link.' 
        },
        { status: 403 }
      );
    }
    
    // [MFA] Check if Multi-Factor Authentication is enabled
    if (user.twoFactorEnabled) {
      // Generate a temporary short-lived challenge token (valid for 5 mins)
      const mfaToken = signJwt({ userId: user.id, mfaChallenge: true }, '5m');
      
      return NextResponse.json({
        mfaRequired: true,
        mfaToken,
        message: 'Multi-factor authentication required.'
      });
    }
    
    // Generate permanent JWT
    const token = signJwt({ userId: user.id, email: user.email, role: user.role });
    
    // 2. Secure HttpOnly Cookie (Enterprise standard)
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',

      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    });
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation Error', message: error.issues },
        { status: 400 }
      );
    }
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to log in' },
      { status: 500 }
    );
  }
}

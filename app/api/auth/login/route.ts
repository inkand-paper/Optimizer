import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePasswords, signJwt } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { checkRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  try {
    // 1. Rate Limiting Protection (Max 5 attempts per minute per IP)
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
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
        { error: 'Unauthorized', message: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Verify password
    const isPasswordValid = await comparePasswords(parsedData.password, user.passwordHash);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid email or password' },
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
    
    // Generate JWT
    const token = signJwt({ userId: user.id, email: user.email, role: user.role });
    
    // 2. Secure HttpOnly Cookie (Enterprise standard)
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 days
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
        { error: 'Validation Error', message: (error as any).errors },
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

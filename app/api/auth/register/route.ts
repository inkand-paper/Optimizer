import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signJwt } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Validate request data
    const parsedData = registerSchema.parse(body);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: parsedData.email }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'Conflict', message: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    // Hash password & create user
    const hashed = await hashPassword(parsedData.password);
    
    // [GENESIS RULE] - Handle First User & Admin Promotion
    const adminEmail = process.env.ADMIN_EMAIL;
    const userCount = await prisma.user.count();
    
    const isFirstUser = userCount === 0;
    const isFounderEmail = adminEmail && parsedData.email.toLowerCase() === adminEmail.toLowerCase();

    const role = (isFirstUser || isFounderEmail) ? 'ADMIN' : 'DEVELOPER';
    const plan = (isFirstUser || isFounderEmail) ? 'BUSINESS' : 'FREE';
    
    const newUser = await prisma.user.create({
      data: {
        email: parsedData.email,
        passwordHash: hashed,
        name: parsedData.name,
        role: role as any,
        plan: plan as any
      }
    });
    
    // Generate JWT
    const token = signJwt({ userId: newUser.id, email: newUser.email, role: newUser.role });
    
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    }, { status: 201 });

    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation Error', message: (error as any).errors },
        { status: 400 }
      );
    }
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to register user' },
      { status: 500 }
    );
  }
}

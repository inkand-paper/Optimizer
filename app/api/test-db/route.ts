import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Attempt a simple query
    const userCount = await prisma.user.count();
    return NextResponse.json({ 
      success: true, 
      message: "Database connection successful!", 
      userCount 
    });
  } catch (error: any) {
    console.error('Diagnostic DB Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      stack: error.stack,
      code: error.code
    }, { status: 500 });
  }
}

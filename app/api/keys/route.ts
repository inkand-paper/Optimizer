import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth';
import { createApiKeySchema } from '@/lib/validations';
import { z } from 'zod';
import crypto from 'crypto';

// Helper to hash API keys quickly (sha256)
export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = verifyJwt(authHeader.split(' ')[1]);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const keys = await prisma.apiKey.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        createdAt: true,
        lastUsedAt: true,
        // We do NOT return the key hash, just standard info
      }
    });
    
    return NextResponse.json({ success: true, keys });
  } catch (error) {
    console.error('Fetch keys error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = verifyJwt(authHeader.split(' ')[1]);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const body = await req.json();
    const { name } = createApiKeySchema.parse(body);
    
    // Generate secure random string
    const prefix = 'opt_';
    const randomString = crypto.randomBytes(32).toString('base64url');
    const plainApiKey = `${prefix}${randomString}`;
    
    // Hash before storing
    const hashedKey = hashApiKey(plainApiKey);
    
    const newKey = await prisma.apiKey.create({
      data: {
        name,
        keyHash: hashedKey,
        userId: decoded.userId
      }
    });
    
    return NextResponse.json({
      success: true,
      apiKey: plainApiKey, // This is the ONLY time the user will see this plain text key
      id: newKey.id,
      name: newKey.name,
      createdAt: newKey.createdAt
    }, { status: 201 });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation Error', message: error.errors }, { status: 400 });
    }
    console.error('Create key error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

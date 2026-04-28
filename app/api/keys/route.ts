import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest } from '@/lib/auth';
import { createApiKeySchema } from '@/lib/validations';
import { z } from 'zod';
import crypto from 'crypto';
import { logActivity } from '@/lib/logger';
import { hasPermission, ROLES } from '@/lib/rbac';
import { PLAN_LIMITS, PlanType } from '@/lib/plans';

// Helper to hash API keys quickly (sha256)
export function hashApiKey(key: string): string {
  return crypto.createHash('sha256').update(key).digest('hex');
}

export async function GET(req: NextRequest) {
  try {
    const decoded = getTokenFromRequest(req);
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
  let currentUserId: string | undefined = undefined;
  try {
    const decoded = getTokenFromRequest(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dbUser = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!dbUser || !hasPermission(dbUser.role, ROLES.DEVELOPER)) {
      return NextResponse.json({ error: 'Forbidden', message: `Your role is ${dbUser?.role || 'UNKNOWN'}. Only developers can generate API keys.` }, { status: 403 });
    }

    // [MONETIZATION] Enforce API Access Limit
    if (dbUser.role !== 'ADMIN') {
      const userPlan = (dbUser.plan || 'FREE') as PlanType;
      const canGenerateKeys = PLAN_LIMITS[userPlan].allowApiKeys;
      if (!canGenerateKeys) {
        return NextResponse.json({ 
          error: 'Forbidden', 
          message: 'API Access is a Pro tier feature. Please upgrade your plan to generate machine keys.' 
        }, { status: 403 });
      }
    }
    
    currentUserId = decoded.userId;
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

    await logActivity({
      type: 'KEY_GEN',
      action: `Key Generated: ${name}`,
      status: 'SUCCESS',
      userId: currentUserId,
      details: { keyName: name, keyId: newKey.id }
    });
    
    return NextResponse.json({
      success: true,
      apiKey: plainApiKey, // This is the ONLY time the user will see this plain text key
      id: newKey.id,
      name: newKey.name,
      createdAt: newKey.createdAt
    }, { status: 201 });
    
  } catch (error) {
    if (currentUserId) {
      await logActivity({
        type: 'KEY_GEN',
        action: 'Key Generation Failed',
        status: 'FAILURE',
        userId: currentUserId,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation Error', message: (error as any).errors }, { status: 400 });
    }
    console.error('Create key error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


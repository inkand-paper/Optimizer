import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import type { RevalidateRequest } from '@/lib/types';
import { logActivity } from '@/lib/logger';
import { dispatchWebhook } from '@/lib/webhooks';
import { sendPulseAlert } from '@/lib/mail';

async function processRevalidation(
  tag: string | undefined,
  path: string | undefined,
  currentUserId: string | undefined,
  dbKey: any,
  startTime: number
) {
  if (!path && !tag) {
    if (currentUserId) {
      await logActivity({
        type: 'REVALIDATE',
        action: 'Handshake Verification',
        status: 'SUCCESS',
        userId: currentUserId,
        details: { message: 'Handshake only' }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Handshake verified. Your machine key is active and authorized.',
      timestamp: new Date().toISOString()
    });
  }
  
  if (tag) {
    // @ts-ignore
    revalidateTag(tag, 'max'); 
    
    if (currentUserId) {
      await logActivity({
        type: 'REVALIDATE',
        action: `Tag Revalidation: ${tag}`,
        status: 'SUCCESS',
        userId: currentUserId,
        details: { tag, durationMs: Date.now() - startTime }
      });
      await dispatchWebhook(currentUserId, 'REVALIDATE_SUCCESS', { type: 'tag', value: tag });
    }

    if (dbKey?.user?.email) {
      console.log(`[EMAIL] Attempting to send Pulse alert to: ${dbKey.user.email}`);
      sendPulseAlert({
        email: dbKey.user.email,
        userName: dbKey.user.name || 'Developer',
        type: 'tag',
        value: tag
      })
      .then(res => console.log(`[EMAIL] Status: ${res.success ? '✅ Sent' : '❌ Failed'}`))
      .catch(err => console.error(`[EMAIL] Fatal Error:`, err));
    } else {
      console.warn(`[EMAIL] Skip: No email found for user associated with this key.`);
    }

    return NextResponse.json({
      success: true,
      revalidated: { type: 'tag', value: tag },
      timestamp: new Date().toISOString()
    });
  } 
  else if (path) {
    // @ts-ignore
    revalidatePath(path); 
    
    if (currentUserId) {
      await logActivity({
        type: 'REVALIDATE',
        action: `Path Revalidation: ${path}`,
        status: 'SUCCESS',
        userId: currentUserId,
        details: { path, durationMs: Date.now() - startTime }
      });
      await dispatchWebhook(currentUserId, 'REVALIDATE_SUCCESS', { type: 'path', value: path });
    }

    if (dbKey?.user?.email) {
      console.log(`[EMAIL] Attempting to send Pulse alert to: ${dbKey.user.email}`);
      sendPulseAlert({
        email: dbKey.user.email,
        userName: dbKey.user.name || 'Developer',
        type: 'path',
        value: path
      })
      .then(res => console.log(`[EMAIL] Status: ${res.success ? '✅ Sent' : '❌ Failed'}`))
      .catch(err => console.error(`[EMAIL] Fatal Error:`, err));
    } else {
      console.warn(`[EMAIL] Skip: No email found for user associated with this key.`);
    }

    return NextResponse.json({
      success: true,
      revalidated: { type: 'path', value: path },
      timestamp: new Date().toISOString()
    });
  }
  
  return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let currentUserId: string | undefined = undefined;
  
  try {
    const body = await request.json();
    const { secret, path, tag, email } = body;
    const masterSecret = process.env.REVALIDATE_SECRET;

    // 1. Check for Master Secret (Internal Dashboard)
    if (secret && masterSecret && secret === masterSecret) {
      console.log(`[PULSE] Dashboard trigger for ${tag || path} to ${email}`);
      
      const adminUser = email 
        ? await prisma.user.findUnique({ where: { email } })
        : await prisma.user.findFirst({ orderBy: { createdAt: 'asc' } });
        
      currentUserId = adminUser?.id;
      const dbKey = adminUser ? { user: adminUser } : null;
      
      return await processRevalidation(tag, path, currentUserId, dbKey, startTime);
    }

    // 2. Validate API key (External SDK)
    const authHeader = request.headers.get('authorization');
    const apiKey = authHeader?.replace('Bearer ', '');
    
    if (!apiKey) {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'Missing API key or Master Secret.',
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }

    const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');
    const dbKey = await prisma.apiKey.findUnique({
      where: { keyHash: hashedKey },
      include: { user: true }
    });

    if (!dbKey) {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'Invalid API key.',
        timestamp: new Date().toISOString()
      }, { status: 401 });
    }

    currentUserId = dbKey.userId;
    prisma.apiKey.update({
      where: { id: dbKey.id },
      data: { lastUsedAt: new Date() }
    }).catch(console.error);
    
    return await processRevalidation(tag, path, currentUserId, dbKey, startTime);
    
  } catch (error) {
    console.error('❌ Revalidation error:', error);
    return NextResponse.json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Failed to revalidate'
    }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Allow': 'POST, OPTIONS',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}
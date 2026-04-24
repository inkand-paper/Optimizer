import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import type { RevalidateRequest, RevalidateResponse, ErrorResponse } from '@/lib/types';
import { logActivity } from '@/lib/logger';
import { dispatchWebhook } from '@/lib/webhooks';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let currentUserId: string | undefined = undefined;
  
  try {
    // 1. Validate API key
    const authHeader = request.headers.get('authorization');
    const apiKey = authHeader?.replace('Bearer ', '');
    
    if (!apiKey) {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'Missing API key.',
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

    // Update lastUsedAt in the background
    prisma.apiKey.update({
      where: { id: dbKey.id },
      data: { lastUsedAt: new Date() }
    }).catch(console.error);
    
    // 2. Parse and validate request body
    let body: RevalidateRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({
        error: 'Bad Request',
        message: 'Invalid JSON body',
        timestamp: new Date().toISOString()
      }, { status: 400 });
    }
    
    // 3. Validate request parameters
    const { path, tag } = body;
    
    if (!path && !tag) {
      await logActivity({
        type: 'REVALIDATE',
        action: 'Handshake Verification',
        status: 'SUCCESS',
        userId: currentUserId,
        details: { message: 'Handshake only' }
      });

      return NextResponse.json({
        success: true,
        message: 'Handshake verified. Your machine key is active and authorized.',
        timestamp: new Date().toISOString()
      });
    }
    
    // 4. Perform revalidation
    if (tag) {
      // @ts-ignore - Next.js experimental signature
      revalidateTag(tag); 
      
      await logActivity({
        type: 'REVALIDATE',
        action: `Tag Revalidation: ${tag}`,
        status: 'SUCCESS',
        userId: currentUserId,
        details: { tag, durationMs: Date.now() - startTime }
      });

      await dispatchWebhook(currentUserId, 'REVALIDATE_SUCCESS', { type: 'tag', value: tag });

      return NextResponse.json({
        success: true,
        revalidated: { type: 'tag', value: tag },
        timestamp: new Date().toISOString()
      });
    } 
    else if (path) {
      // @ts-ignore - Next.js experimental signature
      revalidatePath(path); 
      
      await logActivity({
        type: 'REVALIDATE',
        action: `Path Revalidation: ${path}`,
        status: 'SUCCESS',
        userId: currentUserId,
        details: { path, durationMs: Date.now() - startTime }
      });

      await dispatchWebhook(currentUserId, 'REVALIDATE_SUCCESS', { type: 'path', value: path });

      return NextResponse.json({
        success: true,
        revalidated: { type: 'path', value: path },
        timestamp: new Date().toISOString()
      });
    }
    
    return NextResponse.json({
      error: 'Internal Server Error',
      message: 'Unexpected error during revalidation',
      timestamp: new Date().toISOString()
    }, { status: 500 });
    
  } catch (error) {
    console.error('❌ Revalidation error:', error);
    
    if (currentUserId) {
      await logActivity({
        type: 'REVALIDATE',
        action: 'Revalidation Failed',
        status: 'FAILURE',
        userId: currentUserId,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }

    return NextResponse.json({
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Failed to revalidate',
      timestamp: new Date().toISOString()
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
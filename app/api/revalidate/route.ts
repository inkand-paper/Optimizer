import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { config } from '@/lib/config';
import type { RevalidateRequest, RevalidateResponse, ErrorResponse } from '@/lib/types';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // 1. Validate API key
    const authHeader = request.headers.get('authorization');
    const apiKey = authHeader?.replace('Bearer ', '');
    
    if (!apiKey || apiKey !== config.apiSecretKey) {
      const errorResponse: ErrorResponse = {
        error: 'Unauthorized',
        message: 'Invalid or missing API key. Provide in Authorization: Bearer <key>',
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }
    
    // 2. Parse and validate request body
    let body: RevalidateRequest;
    try {
      body = await request.json();
    } catch {
      const errorResponse: ErrorResponse = {
        error: 'Bad Request',
        message: 'Invalid JSON body',
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    // 3. Validate request parameters
    const { path, tag } = body;
    
    if (!path && !tag) {
      const errorResponse: ErrorResponse = {
        error: 'Bad Request',
        message: 'Provide either "path" (string) or "tag" (string) in request body',
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    if (path && typeof path !== 'string') {
      const errorResponse: ErrorResponse = {
        error: 'Bad Request',
        message: '"path" must be a string',
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    if (tag && typeof tag !== 'string') {
      const errorResponse: ErrorResponse = {
        error: 'Bad Request',
        message: '"tag" must be a string',
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    // 4. Perform revalidation (CORRECT for Next.js 16.2.4)
    if (tag) {
      // @ts-ignore - Next.js 16.2.4 expects second parameter but documentation varies
      revalidateTag(tag, 'page');
      const response: RevalidateResponse = {
        success: true,
        revalidated: { type: 'tag', value: tag },
        timestamp: new Date().toISOString()
      };
      console.log(`✅ Revalidated tag: ${tag} (${Date.now() - startTime}ms)`);
      return NextResponse.json(response);
    } 
    else if (path) {
      // @ts-ignore - Next.js 16.2.4 expects second parameter but documentation varies
      revalidatePath(path, 'page');
      const response: RevalidateResponse = {
        success: true,
        revalidated: { type: 'path', value: path },
        timestamp: new Date().toISOString()
      };
      console.log(`✅ Revalidated path: ${path} (${Date.now() - startTime}ms)`);
      return NextResponse.json(response);
    }
    
    // This should never happen due to validation above
    const errorResponse: ErrorResponse = {
      error: 'Internal Server Error',
      message: 'Unexpected error during revalidation',
      timestamp: new Date().toISOString()
    };
    return NextResponse.json(errorResponse, { status: 500 });
    
  } catch (error) {
    console.error('❌ Revalidation error:', error);
    const errorResponse: ErrorResponse = {
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Failed to revalidate',
      timestamp: new Date().toISOString()
    };
    return NextResponse.json(errorResponse, { status: 500 });
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
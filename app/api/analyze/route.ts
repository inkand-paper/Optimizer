import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import type { AnalyzeRequest, AnalyzeResponse, ErrorResponse } from '@/lib/types';
import { runFullAudit } from '@/core/analyzer';
import { logActivity } from '@/lib/logger';

/**
 * [PRODUCTION-GRADE] - Advanced Website Analyzer API
 * This engine performs a multi-dimensional audit of target websites.
 * Secure: Requires a verified Machine API Key.
 */
export async function POST(request: NextRequest) {
  let currentUserId: string | undefined = undefined;
  
  try {
    // 1. Security Check (API Key)
    const authHeader = request.headers.get('authorization');
    const apiKey = authHeader?.replace('Bearer ', '');
    
    if (!apiKey) {
      return NextResponse.json({ error: 'Unauthorized', message: 'Missing API Key' }, { status: 401 });
    }

    const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');
    const dbKey = await prisma.apiKey.findUnique({ where: { keyHash: hashedKey } });

    if (!dbKey) {
      return NextResponse.json({ error: 'Unauthorized', message: 'Invalid API Key' }, { status: 401 });
    }

    currentUserId = dbKey.userId;

    // 2. Parse Body
    let body: AnalyzeRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Bad Request', message: 'Invalid JSON' }, { status: 400 });
    }

    const { url } = body;
    if (!url || !url.startsWith('http')) {
      return NextResponse.json({ error: 'Bad Request', message: 'Valid URL (with http/https) is required' }, { status: 400 });
    }

    // 3. Perform Advanced Analysis
    const auditResult = await runFullAudit(url);

    // 4. Log Activity
    await logActivity({
      type: 'ANALYZE',
      action: `Website Audit: ${url}`,
      status: 'SUCCESS',
      userId: currentUserId,
      details: { url, score: auditResult.overallScore }
    });

    const response: AnalyzeResponse = {
      success: true,
      results: auditResult,
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Analysis failed:', error);
    
    if (currentUserId) {
      await logActivity({
        type: 'ANALYZE',
        action: 'Website Audit Failed',
        status: 'FAILURE',
        userId: currentUserId,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }

    return NextResponse.json({ 
      error: 'Internal Server Error', 
      message: error instanceof Error ? error.message : 'Failed to scan the target website' 
    }, { status: 500 });
  }
}



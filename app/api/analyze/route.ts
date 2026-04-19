import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';
import type { AnalyzeRequest, AnalyzeResponse, ErrorResponse } from '@/lib/types';

/**
 * [ENTRY-LEVEL] - Website Analyzer API
 * This engine "scans" another website to check if it's healthy.
 * It's secure: only a verified Machine (via API Key) can run it.
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
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

    // 3. Perform Analysis (Scanning the site)
    const fetchStartTime = Date.now();
    const response = await fetch(url, { 
      headers: { 'User-Agent': 'NextOptimizerBot/1.0' },
      next: { revalidate: 0 } // Don't cache the scan itself
    });
    
    const html = await response.text();
    const loadTime = Date.now() - fetchStartTime;

    // Regex scanners (Simulated engine)
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const descMatch = html.match(/<meta name="description" content="(.*?)"/i);
    const faviconMatch = html.match(/rel="icon"|rel="shortcut icon"/i);

    const metrics = {
      hasTitle: !!titleMatch,
      hasDescription: !!descMatch,
      hasFavicon: !!faviconMatch,
      isSsl: url.startsWith('https'),
      loadTime: loadTime
    };

    // Calculate score (0-100)
    let score = 0;
    if (metrics.hasTitle) score += 20;
    if (metrics.hasDescription) score += 20;
    if (metrics.hasFavicon) score += 20;
    if (metrics.isSsl) score += 20;
    if (loadTime < 1000) score += 20;
    else if (loadTime < 3000) score += 10;

    const analyzeResult: AnalyzeResponse = {
      success: true,
      results: {
        url,
        score,
        metrics,
        details: {
          title: titleMatch?.[1]?.substring(0, 100),
          description: descMatch?.[1]?.substring(0, 200),
          server: response.headers.get('server') || 'unknown'
        }
      },
      timestamp: new Date().toISOString()
    };

    return NextResponse.json(analyzeResult);

  } catch (error) {
    console.error('Analysis failed:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      message: 'Failed to scan the target website' 
    }, { status: 500 });
  }
}

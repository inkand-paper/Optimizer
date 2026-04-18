import { NextResponse } from 'next/server';
import type { HealthResponse } from '@/lib/types';
import { corsHeaders } from '@/lib/cors';

export async function GET() {
  const startTime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  const response: HealthResponse = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: {
      seconds: Math.floor(startTime),
      minutes: Math.floor(startTime / 60),
      hours: (startTime / 3600).toFixed(2)
    },
    memory: {
      rss: memoryUsage.rss,
      heapTotal: memoryUsage.heapTotal,
      heapUsed: memoryUsage.heapUsed,
      external: memoryUsage.external
    },
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      revalidate: '/api/revalidate'
    }
  };
  
  // Create response with CORS headers
  return NextResponse.json(response, {
    headers: corsHeaders
  });
}
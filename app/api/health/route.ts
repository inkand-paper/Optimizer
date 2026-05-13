import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as Sentry from '@sentry/nextjs';

/**
 * [SaaS INFRA] - Health Check & Observability Endpoint
 * Checks Database connectivity and AI provider availability.
 * Automatically reports failures to Sentry with 'critical' severity.
 */
export async function GET() {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: 'unknown',
      groq_api: 'unknown',
      gemini_api: 'unknown',
    }
  };
  
  // 1. Check Database
  try {
    // Simple query to verify connection
    await prisma.$queryRaw`SELECT 1`;
    health.checks.database = 'connected';
  } catch (e) {
    health.checks.database = 'disconnected';
    health.status = 'degraded';
    Sentry.captureException(e, { tags: { component: 'database', type: 'health_check_failure' } });
  }
  
  // 2. Check Groq API (Connectivity only)
  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/models', {
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` }
    });
    health.checks.groq_api = groqRes.ok ? 'connected' : 'error';
    if (!groqRes.ok) health.status = 'degraded';
  } catch (e) {
    health.checks.groq_api = 'disconnected';
    health.status = 'degraded';
  }
  
  // 3. Check Gemini API (Connectivity only)
  try {
    const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`);
    health.checks.gemini_api = geminiRes.ok ? 'connected' : 'error';
    if (!geminiRes.ok) health.status = 'degraded';
  } catch (e) {
    health.checks.gemini_api = 'disconnected';
    health.status = 'degraded';
  }
  
  // Report to Sentry if system is degraded
  if (health.status !== 'healthy') {
    Sentry.captureMessage('NexPulse System Degraded', {
      level: 'error',
      extra: health
    });
  }
  
  return NextResponse.json(health, {
    status: health.status === 'healthy' ? 200 : 503
  });
}

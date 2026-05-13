import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { corsHeaders } from '@/lib/cors';

/**
 * [SECURITY] - Global NexPulse Middleware (Unified Shield)
 * This combines Auth, RBAC, Rate Limiting, and CORS Proxy into one 
 * high-performance Edge execution layer.
 */

// Simple in-memory cache for rate limiting at the Edge (Vercel)
const RATE_LIMIT_CACHE = new Map<string, { count: number; expires: number }>();

export async function proxy(req: NextRequest) {
  const startTime = Date.now();
  const { pathname } = req.nextUrl;
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  const authHeader = req.headers.get('authorization');

  // ─── 1. CORS & PREFLIGHT HANDLING ──────────────────────────────────────────
  
  // Handle preflight OPTIONS requests immediately
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // CORS Origin Validation (In Production)
  if (process.env.NODE_ENV === 'production' && origin) {
    const allowedOrigin = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/\/$/, '');
    const normalizedOrigin = origin.replace(/\/$/, '');
    
    if (normalizedOrigin !== allowedOrigin && !normalizedOrigin.includes(host || '')) {
      // Allow only if it's our own domain or authorized cross-origin
      if (!authHeader) { // Machine API keys are allowed from any origin
        console.error(`[CORS SECURITY] Blocked origin: ${origin}`);
        return new NextResponse(
          JSON.stringify({ error: 'CORS Security Error', message: 'Unauthorized origin.' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
  }

  // ─── 2. RATE LIMITING (API PROTECTION) ──────────────────────────────────────
  if (pathname.startsWith('/api/')) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'anonymous';
    const now = Date.now();
    const limit = 60; 
    const windowMs = 60 * 1000; 

    const record = RATE_LIMIT_CACHE.get(ip);
    if (record && record.expires > now) {
      if (record.count >= limit) {
        return new NextResponse(
          JSON.stringify({ error: 'Too Many Requests', message: 'Rate limit exceeded.' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
      record.count++;
    } else {
      RATE_LIMIT_CACHE.set(ip, { count: 1, expires: now + windowMs });
    }
  }

  // ─── 3. AUTHENTICATION & RBAC ───────────────────────────────────────────────
  
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/admin')) {
    // 1. Try NextAuth Token
    let token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    
    // 2. Fallback: Check for custom 'token' cookie (Enterprise Shield)
    if (!token) {
      const customToken = req.cookies.get('token')?.value;
      if (customToken) {
        try {
          // If we have a custom token, we treat it as valid for the redirect check
          // The actual API routes will perform deeper verification
          token = { sub: 'custom-session' } as unknown as import('next-auth/jwt').JWT; 
        } catch {
          token = null;
        }
      }
    }

    if (!token) {
      const url = new URL('/login', req.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith('/dashboard/admin') || pathname.startsWith('/api/admin')) {
      if (token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
  }

  // ─── 4. GLOBAL SECURITY HEADERS & LOGGING ──────────────────────────────────
  
  const response = NextResponse.next();
  
  // Inject CORS headers
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Logging (Only for API calls)
  if (pathname.startsWith('/api/')) {
    console.log(`📱 [MIDDLEWARE] ${req.method} ${pathname} | ${Date.now() - startTime}ms`);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};

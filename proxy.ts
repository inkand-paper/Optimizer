import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { corsHeaders } from '@/lib/cors';
import { checkRateLimit } from '@/lib/rate-limit';

/**
 * [SECURITY] - Global NexPulse Middleware (Unified Shield)
 * This combines Auth, RBAC, Rate Limiting, and CORS Proxy into one 
 * high-performance Edge execution layer.
 */

// Simple in-memory cache for rate limiting at the Edge (Vercel) - DEPRECATED for Redis
// const RATE_LIMIT_CACHE = new Map<string, { count: number; expires: number }>();

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

  // ─── 2. RATE LIMITING (DISTRIBUTED REDIS PROTECTION) ───────────────────────
  if (pathname.startsWith('/api/')) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'anonymous';
    
    // [SECURITY] Use Distributed Redis for global protection across all Vercel Edge instances
    const { success, remaining, resetAt } = await checkRateLimit(ip, {
      maxRequests: 60,
      windowMs: 60 * 1000
    });

    if (!success) {
      return new NextResponse(
        JSON.stringify({ 
          error: 'Too Many Requests', 
          message: 'Rate limit exceeded.',
          retryAfter: Math.ceil((resetAt - Date.now()) / 1000)
        }),
        { 
          status: 429, 
          headers: { 
            'Content-Type': 'application/json',
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': resetAt.toString()
          } 
        }
      );
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
          // [SECURITY] Decode the custom JWT to extract the role
          // We use a safe base64 decode for the payload at the edge
          const payloadBase64 = customToken.split('.')[1];
          if (payloadBase64) {
            const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
            token = { 
              sub: payload.userId, 
              role: payload.role,
              email: payload.email 
            } as any;
          }
        } catch (e) {
          console.error('[AUTH_ERROR] Failed to decode custom token at Edge:', e);
          token = null;
        }
      }
    }

    // ─── 4. ROLE-BASED ACCESS CONTROL (RBAC) ─────────────────────────────────
    
    // If accessing an admin route, ensure the user has the ADMIN role
    if (pathname.startsWith('/dashboard/admin') || pathname.startsWith('/api/admin')) {
      const userRole = (token as any)?.role || 'DEVELOPER';
      
      if (userRole !== 'ADMIN') {
        console.warn(`[UNAUTHORIZED_ACCESS] User ${token?.email} attempted to access Admin Panel.`);
        return NextResponse.redirect(new URL('/dashboard', req.url));
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

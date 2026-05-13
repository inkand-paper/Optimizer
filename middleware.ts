import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

/**
 * [SECURITY] - Global NexPulse Middleware
 * 1. Enforces authentication for dashboard routes.
 * 2. Implements a lightweight rate-limiting skeleton for API routes.
 * 3. Prevents unauthorized access to Admin-only endpoints.
 */

// Simple in-memory cache for rate limiting at the Edge (Vercel)
// Note: In a true multi-server production environment, this should be replaced with Upstash/Redis.
const RATE_LIMIT_CACHE = new Map<string, { count: number; expires: number }>();

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ─── 1. RATE LIMITING (API PROTECTION) ──────────────────────────────────────
  if (pathname.startsWith('/api/')) {
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'anonymous';
    const now = Date.now();
    const limit = 60; // 60 requests per window
    const windowMs = 60 * 1000; // 1 minute window

    const record = RATE_LIMIT_CACHE.get(ip);

    if (record && record.expires > now) {
      if (record.count >= limit) {
        return new NextResponse(
          JSON.stringify({ error: 'Too Many Requests', message: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }
      record.count++;
    } else {
      RATE_LIMIT_CACHE.set(ip, { count: 1, expires: now + windowMs });
    }

    // Periodically clean up the cache
    if (RATE_LIMIT_CACHE.size > 1000) {
      for (const [key, value] of RATE_LIMIT_CACHE.entries()) {
        if (value.expires < now) RATE_LIMIT_CACHE.delete(key);
      }
    }
  }

  // ─── 2. AUTHENTICATION & RBAC ───────────────────────────────────────────────
  
  // Protect Dashboard & Admin routes
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/admin')) {
    // We use next-auth's getToken which is fast and works at the Edge
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      const url = new URL('/login', req.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    // Admin-only protection
    if (pathname.startsWith('/dashboard/admin') || pathname.startsWith('/api/admin')) {
      if (token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};

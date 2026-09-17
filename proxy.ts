import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { corsHeaders } from '@/lib/cors';
import { checkRateLimit } from '@/lib/rate-limit';

/**
 * [SECURITY] Global NexPulse Proxy Middleware (Unified Shield)
 * Next.js 16 Proxy execution layer for Auth, RBAC, Rate Limiting, and CORS.
 */

async function verifyJwtEdge(token: string): Promise<{ userId: string; role?: string; email?: string } | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, sigB64] = parts;

    const secret = process.env.JWT_SECRET || 'dev_secret_only';
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Convert base64url signature to ArrayBuffer
    const base64Sig = sigB64.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64Sig.length % 4 ? '='.repeat(4 - (base64Sig.length % 4)) : '';
    const binarySig = atob(base64Sig + pad);
    const sigBytes = new Uint8Array(binarySig.length);
    for (let i = 0; i < binarySig.length; i++) {
      sigBytes[i] = binarySig.charCodeAt(i);
    }

    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, data);

    if (!isValid) return null;

    // Signature valid — decode payload
    const base64Payload = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
    const payloadPad = base64Payload.length % 4 ? '='.repeat(4 - (base64Payload.length % 4)) : '';
    const payloadJson = atob(base64Payload + payloadPad);
    const payload = JSON.parse(payloadJson);

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return {
      userId: payload.userId || payload.sub,
      role: payload.role,
      email: payload.email,
    };
  } catch (e) {
    console.error('[AUTH_ERROR] Failed to verify custom token at Edge:', e);
    return null;
  }
}

export async function proxy(req: NextRequest) {
  const startTime = Date.now();
  const { pathname } = req.nextUrl;
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  const authHeader = req.headers.get('authorization');

  // ─── 0. AUTH BYPASS ────────────────────────────────────────────────────────
  // We must NEVER interfere with OAuth handshakes or callbacks.
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // ─── 1. CORS & PREFLIGHT HANDLING ──────────────────────────────────────────
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
      if (!authHeader) {
        console.error(`[CORS SECURITY] Blocked origin: ${origin}`);
        return new NextResponse(
          JSON.stringify({ error: 'CORS Security Error', message: 'Unauthorized origin.' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
  }

  // ─── 2. RATE LIMITING ───────────────────────────────────────────────────────
  if (pathname.startsWith('/api/')) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 'anonymous';
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
        const verifiedPayload = await verifyJwtEdge(customToken);
        if (verifiedPayload) {
          token = {
            sub: verifiedPayload.userId,
            role: verifiedPayload.role,
            email: verifiedPayload.email
          } as import('next-auth/jwt').JWT & { role?: string };
        }
      }
    }

    // ─── 4. AUTH & ROLE-BASED ACCESS CONTROL (RBAC) ──────────────────────────
    if (!token) {
      if (pathname.startsWith('/api/')) {
        return new NextResponse(
          JSON.stringify({ error: 'Unauthorized', message: 'Authentication required.' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }
      const url = new URL('/login', req.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    // If accessing an admin route, ensure the user has the ADMIN role
    if (pathname.startsWith('/dashboard/admin') || pathname.startsWith('/api/admin')) {
      const userRole = (token as { role?: string } | null)?.role || 'DEVELOPER';
      
      if (userRole !== 'ADMIN') {
        console.warn(`[UNAUTHORIZED_ACCESS] User ${token?.email} attempted to access Admin Panel.`);
        if (pathname.startsWith('/api/')) {
          return new NextResponse(
            JSON.stringify({ error: 'Forbidden', message: 'Admin role required.' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          );
        }
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }
  }

  // ─── 4. GLOBAL SECURITY HEADERS & LOGGING ──────────────────────────────────
  const response = NextResponse.next();
  
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  if (pathname.startsWith('/api/')) {
    console.log(`📱 [PROXY] ${req.method} ${pathname} | ${Date.now() - startTime}ms`);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};

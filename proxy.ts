import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';

/**
 * [SECURITY] Global Proxy & Security Layer
 * This acts as the "Shield" for the NexPulse backend.
 * It handles CORS, Security Headers, and API Logging.
 */
export function proxy(request: NextRequest) {
  const startTime = Date.now();
  const origin = request.headers.get('origin');
  const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const authHeader = request.headers.get('authorization');

  // 1. Handle preflight OPTIONS requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // 2. [SECURITY] CORS Protection
  // Normalize origins
  const normalizedOrigin = origin?.replace(/\/$/, '');
  const normalizedAllowed = allowedOrigin?.replace(/\/$/, '');
  const host = request.headers.get('host');

  // Strict check: Allow if:
  // 1. Origin matches the environment variable
  // 2. Origin matches the current host (Auto-detect)
  // 3. It's localhost
  const isExactMatch = normalizedOrigin === normalizedAllowed;
  const isSameHost = normalizedOrigin && host && normalizedOrigin.includes(host);
  const isLocalhost = normalizedOrigin?.includes('localhost');
  const isProduction = process.env.NODE_ENV === 'production';

  // [PRODUCTION LOCKDOWN]
  if (isProduction && !isExactMatch && !isSameHost && !isLocalhost && !authHeader) {
    console.error(`[CORS SECURITY] Blocked unauthorized origin: ${origin}. Host: ${host}`);
    return new NextResponse(
      JSON.stringify({ 
        error: 'CORS Security Error', 
        message: 'Unauthorized origin.',
        debug: { origin, host, expected: allowedOrigin } 
      }),
      { 
        status: 403, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }

  // Get the response
  const response = NextResponse.next();
  
  // 3. Add CORS headers to all responses
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // 4. [SECURITY] Global Security Headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocations=()');
  
  // 5. [DIAGNOSTICS] API Logging
  if (request.nextUrl.pathname.startsWith('/api/')) {
    console.log(`📱 API Call: ${request.method} ${request.nextUrl.pathname}`);
    console.log(`   Headers: Authorization=${authHeader ? '✓ Present' : '✗ Missing'}`);
    console.log(`   Response Time: ${Date.now() - startTime}ms`);
  }
  
  return response;
}

// Configure which routes the proxy runs on
export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*'],
};
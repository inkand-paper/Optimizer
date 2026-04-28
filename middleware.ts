import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // 1. Get the origin of the request
  const origin = request.headers.get('origin');
  const allowedOrigin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  // 2. [SECURITY] CORS Protection
  // Only allow browser requests from your own domain in production
  // We allow requests if:
  // a) It's your official domain
  // b) It has an Authorization header (API Key from SDK)
  // c) It's development mode
  const authHeader = request.headers.get('authorization');
  
  if (origin && origin !== allowedOrigin && !authHeader && process.env.NODE_ENV === 'production') {
    return new NextResponse(
      JSON.stringify({ error: 'CORS Error', message: 'Forbidden origin' }),
      { 
        status: 403, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }

  // 3. [SECURITY] Global Headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocations=()');

  return response;
}

// Ensure middleware only runs on API routes and Dashboard
export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*'],
};

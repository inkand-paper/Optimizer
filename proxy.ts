import { NextRequest, NextResponse } from 'next/server';
import { corsHeaders } from '@/lib/cors';

// This runs before every request to your API
export function proxy(request: NextRequest) {
    const startTime = Date.now();
  // Handle preflight OPTIONS requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Get the response
  const response = NextResponse.next();
  
  // Add CORS headers to all responses
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  
  // Log API calls for debugging Android integration
  if (request.nextUrl.pathname.startsWith('/api/')) {
    console.log(`📱 API Call: ${request.method} ${request.nextUrl.pathname}`);
    console.log(`   Headers: Authorization=${request.headers.get('authorization') ? '✓ Present' : '✗ Missing'}`);
    console.log(`   Response Time: ${Date.now() - startTime}ms`);
  }
  
  return response;
}

// Configure which routes the proxy runs on
export const config = {
  matcher: '/api/:path*',
};
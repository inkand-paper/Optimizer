// CORS headers for API responses
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // In production, replace with your Android app's domain
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
  'Access-Control-Max-Age': '86400', // 24 hours cache for preflight requests
};

// Helper to create CORS-enabled response
export function addCorsHeaders(response: Response): Response {
  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}
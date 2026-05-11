import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * [AUTH] - Secure Logout
 * Destroys the server-side HttpOnly authentication cookie.
 * This is the ONLY secure way to log out with cookie-based auth.
 */
export async function POST() {
  return new NextResponse(JSON.stringify({ success: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': 'token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0'
    }
  });
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * [AUTH] - Secure Logout
 * Destroys the server-side HttpOnly authentication cookie.
 * This is the ONLY secure way to log out with cookie-based auth.
 */
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete('token');
  
  return NextResponse.json({ success: true });
}

import bcrypt from 'bcrypt';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_only';

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  if (typeof window === 'undefined') {
    console.warn('⚠️ WARNING: JWT_SECRET is missing in production environment. Authentication will fail.');
  }
}

export interface JwtPayload {
  userId: string;
  email?: string;
  role?: string;
  mfaChallenge?: boolean;
}


export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePasswords(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

export function signJwt(payload: JwtPayload, expiresIn: SignOptions['expiresIn'] = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyJwt(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth-options";

/**
 * Extracts and verifies a JWT or NextAuth session from:
 * 1. A secure HttpOnly cookie named 'token'
 * 2. A NextAuth session (for social logins)
 * 3. An Authorization: Bearer <token> header
 */
export async function getTokenFromRequest(req: NextRequest): Promise<JwtPayload | null> {
  // Priority 1: HttpOnly Cookie (custom JWT)
  const cookieToken = req.cookies.get('token')?.value;
  if (cookieToken) {
    const verified = verifyJwt(cookieToken);
    if (verified) return verified;
  }

  // Priority 2: NextAuth Session (Social Logins)
  // In App Router route handlers, getServerSession needs req/res context
  // We pass a minimal adapter so it can read cookies from the request
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.getAll()
      .map(c => `${c.name}=${c.value}`)
      .join('; ');
    const fakeReq = { headers: { cookie: cookieHeader } };
    const fakeRes = { getHeader: () => '', setHeader: () => '', end: () => '' };
    const session = await getServerSession(fakeReq as never, fakeRes as never, authOptions);
    if (session?.user) {
      return {
        userId: (session.user as Record<string, unknown>).id as string,
        email: session.user.email!,
        role: ((session.user as Record<string, unknown>).role as string) || 'DEVELOPER'
      };
    }
  } catch {
    // Fall through to bearer token check
  }

  // Priority 3: Bearer Token (API clients)
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return verifyJwt(authHeader.split(' ')[1]);
  }

  return null;
}

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';

const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_do_not_use_in_prod';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}


export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePasswords(plain: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plain, hashed);
}

export function signJwt(payload: JwtPayload, expiresIn = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: expiresIn as any });
}

export function verifyJwt(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Extracts and verifies a JWT from either:
 * 1. A secure HttpOnly cookie named 'token' (preferred, enterprise-grade)
 * 2. An Authorization: Bearer <token> header (legacy, for API clients)
 * 
 * This dual-support approach ensures zero downtime during migration.
 */
export function getTokenFromRequest(req: NextRequest): JwtPayload | null {
  // Priority 1: HttpOnly Cookie (secure browser sessions)
  const cookieToken = req.cookies.get('token')?.value;
  if (cookieToken) {
    return verifyJwt(cookieToken);
  }

  // Priority 2: Bearer Token (API clients, mobile apps)
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return verifyJwt(authHeader.split(' ')[1]);
  }

  return null;
}

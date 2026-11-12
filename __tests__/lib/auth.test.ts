/**
 * __tests__/lib/auth.test.ts
 * Unit tests for auth helpers: signJwt, verifyJwt, hashPassword, comparePasswords
 */

import { describe, it, expect } from 'vitest';
import { signJwt, verifyJwt, hashPassword, comparePasswords } from '@/lib/auth';

describe('signJwt / verifyJwt', () => {
  it('signs a token and verifies it successfully', () => {
    const payload = { userId: 'user-123', email: 'test@example.com', role: 'DEVELOPER' };
    const token = signJwt(payload);
    const decoded = verifyJwt(token);

    expect(decoded).not.toBeNull();
    expect(decoded?.userId).toBe('user-123');
    expect(decoded?.email).toBe('test@example.com');
    expect(decoded?.role).toBe('DEVELOPER');
  });

  it('returns null for a tampered token', () => {
    const token = signJwt({ userId: 'user-abc' });
    const tampered = token.slice(0, -5) + 'XXXXX';
    expect(verifyJwt(tampered)).toBeNull();
  });

  it('returns null for an expired token', () => {
    // Sign with 0-second expiry (expires immediately) — jsonwebtoken accepts '0s'
    const token = signJwt({ userId: 'user-exp' }, '0s');
    // A token with 0s TTL is immediately expired
    expect(verifyJwt(token)).toBeNull();
  });

  it('returns null for a completely invalid string', () => {
    expect(verifyJwt('not.a.jwt')).toBeNull();
    expect(verifyJwt('')).toBeNull();
  });

  it('signs MFA challenge token with mfaChallenge flag', () => {
    const token = signJwt({ userId: 'user-mfa', mfaChallenge: true }, '5m');
    const decoded = verifyJwt(token);
    expect(decoded?.mfaChallenge).toBe(true);
  });
});

describe('hashPassword / comparePasswords', () => {
  it('hashes a password and verifies it correctly', async () => {
    const password = 'SuperSecret!123';
    const hash = await hashPassword(password);

    expect(hash).not.toBe(password);
    expect(hash.startsWith('$2b$')).toBe(true);

    const match = await comparePasswords(password, hash);
    expect(match).toBe(true);
  });

  it('returns false for a wrong password', async () => {
    const hash = await hashPassword('CorrectPassword#1');
    const match = await comparePasswords('WrongPassword#1', hash);
    expect(match).toBe(false);
  });

  it('produces different hashes for the same password (salted)', async () => {
    const password = 'SamePassword!456';
    const hash1 = await hashPassword(password);
    const hash2 = await hashPassword(password);
    expect(hash1).not.toBe(hash2);
  });
});

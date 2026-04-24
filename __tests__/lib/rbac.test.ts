import { describe, it, expect } from 'vitest';
import { hasPermission, isAdmin, isDeveloper, ROLES } from '../../lib/rbac';

describe('RBAC — hasPermission', () => {
  it('VIEWER can access VIEWER-level routes', () => {
    expect(hasPermission(ROLES.VIEWER, 'VIEWER')).toBe(true);
  });

  it('VIEWER cannot access DEVELOPER-level routes', () => {
    expect(hasPermission(ROLES.VIEWER, 'DEVELOPER')).toBe(false);
  });

  it('VIEWER cannot access ADMIN-level routes', () => {
    expect(hasPermission(ROLES.VIEWER, 'ADMIN')).toBe(false);
  });

  it('DEVELOPER can access VIEWER-level routes', () => {
    expect(hasPermission(ROLES.DEVELOPER, 'VIEWER')).toBe(true);
  });

  it('DEVELOPER can access DEVELOPER-level routes', () => {
    expect(hasPermission(ROLES.DEVELOPER, 'DEVELOPER')).toBe(true);
  });

  it('DEVELOPER cannot access ADMIN-level routes', () => {
    expect(hasPermission(ROLES.DEVELOPER, 'ADMIN')).toBe(false);
  });

  it('ADMIN can access VIEWER-level routes', () => {
    expect(hasPermission(ROLES.ADMIN, 'VIEWER')).toBe(true);
  });

  it('ADMIN can access DEVELOPER-level routes', () => {
    expect(hasPermission(ROLES.ADMIN, 'DEVELOPER')).toBe(true);
  });

  it('ADMIN can access ADMIN-level routes', () => {
    expect(hasPermission(ROLES.ADMIN, 'ADMIN')).toBe(true);
  });

  it('unknown role has no permissions', () => {
    expect(hasPermission('GHOST', 'VIEWER')).toBe(false);
  });
});

describe('RBAC — isAdmin', () => {
  it('returns true for ADMIN role', () => {
    expect(isAdmin(ROLES.ADMIN)).toBe(true);
  });

  it('returns false for DEVELOPER role', () => {
    expect(isAdmin(ROLES.DEVELOPER)).toBe(false);
  });

  it('returns false for VIEWER role', () => {
    expect(isAdmin(ROLES.VIEWER)).toBe(false);
  });
});

describe('RBAC — isDeveloper', () => {
  it('returns true for DEVELOPER role', () => {
    expect(isDeveloper(ROLES.DEVELOPER)).toBe(true);
  });

  it('returns true for ADMIN role (supersets developer)', () => {
    expect(isDeveloper(ROLES.ADMIN)).toBe(true);
  });

  it('returns false for VIEWER role', () => {
    expect(isDeveloper(ROLES.VIEWER)).toBe(false);
  });
});

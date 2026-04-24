import { JwtPayload } from './auth';

/**
 * [SaaS SECURITY] - RBAC Helpers
 * Use these to enforce permissions in API routes.
 */

export const ROLES = {
  ADMIN: 'ADMIN',
  DEVELOPER: 'DEVELOPER',
  VIEWER: 'VIEWER'
} as const;

export type Role = keyof typeof ROLES;

export function hasPermission(userRole: string, requiredRole: Role): boolean {
  const roleWeights: Record<string, number> = {
    [ROLES.VIEWER]: 1,
    [ROLES.DEVELOPER]: 2,
    [ROLES.ADMIN]: 3
  };

  return roleWeights[userRole] >= roleWeights[requiredRole];
}

export function isAdmin(userRole: string): boolean {
  return userRole === ROLES.ADMIN;
}

export function isDeveloper(userRole: string): boolean {
  return userRole === ROLES.DEVELOPER || userRole === ROLES.ADMIN;
}

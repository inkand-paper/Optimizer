import { prisma } from './prisma';

export type ActivityType = 'REVALIDATE' | 'ANALYZE' | 'AUTH' | 'KEY_GEN' | 'KEY_REVOKE';
export type ActivityStatus = 'SUCCESS' | 'FAILURE';

interface LogOptions {
  type: ActivityType;
  action: string;
  status: ActivityStatus;
  userId?: string;
  details?: any;
}

/**
 * [SaaS INFRA] - Centralized Activity Logger
 * Records every major action in the system for observability and audit trails.
 */
export async function logActivity({ type, action, status, userId, details }: LogOptions) {
  try {
    await prisma.activityLog.create({
      data: {
        type,
        action,
        status,
        userId,
        details: details ? JSON.parse(JSON.stringify(details)) : undefined,
      }
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
    // We don't throw here to avoid breaking the main flow if logging fails
  }
}

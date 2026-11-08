import { z } from 'zod';

// [SECURITY — M5] Password: minimum 12 characters (NIST SP 800-63B guidance).
// The reset-password route already enforces complexity; we keep the same bar here.
const passwordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters long');

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: passwordSchema,
  name: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string(), // No complexity check on login — just forward to bcrypt compare
});

export const createApiKeySchema = z.object({
  name: z.string().min(1, 'Key name is required').max(50, 'Key name is too long'),
});

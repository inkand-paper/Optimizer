import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  name: z.string().optional()
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string()
});

export const createApiKeySchema = z.object({
  name: z.string().min(1, "Key name is required").max(50, "Key name is too long")
});

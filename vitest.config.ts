import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      include: ['core/**/*.ts', 'lib/**/*.ts'],
      exclude: ['lib/prisma.ts', 'lib/auth.ts'],
    },
    include: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});

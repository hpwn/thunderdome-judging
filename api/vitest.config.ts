import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'], // only our tests
    exclude: [
      // Vitest defaults (kept explicit to avoid surprises)
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/.{idea,git,cache,output,temp}/**',
      // Pre-Prisma: skip DB integration test
      'src/server.test.ts'
    ],
  },
  resolve: {
    alias: {
      '@prisma/client': fileURLToPath(new URL('./test/shims/prisma.ts', import.meta.url)),
      'zod': fileURLToPath(new URL('./test/shims/zod.ts', import.meta.url)),
      '@testcontainers/postgresql': fileURLToPath(new URL('./test/shims/testcontainers-postgresql.ts', import.meta.url)),
    }
  }
});

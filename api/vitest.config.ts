import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: {
    environment: 'node',
    exclude: ['src/server.test.ts'], // pre-Prisma: skip DB integration test
  },
  resolve: {
    alias: {
      '@prisma/client': fileURLToPath(new URL('./test/shims/prisma.ts', import.meta.url)),
      'zod': fileURLToPath(new URL('./test/shims/zod.ts', import.meta.url)),
      '@testcontainers/postgresql': fileURLToPath(new URL('./test/shims/testcontainers-postgresql.ts', import.meta.url)),
    }
  }
});

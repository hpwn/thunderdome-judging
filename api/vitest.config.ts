import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  test: {
    environment: 'node'
  },
  resolve: {
    alias: {
      '@prisma/client': fileURLToPath(new URL('./test/shims/prisma.ts', import.meta.url)),
      'zod': fileURLToPath(new URL('./test/shims/zod.ts', import.meta.url)),
    }
  }
});

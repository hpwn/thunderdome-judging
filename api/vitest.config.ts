import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    pool: 'forks',
    testTimeout: 120000,
    hookTimeout: 120000,
    coverage: {
      reporter: ['text', 'html']
    }
  }
});

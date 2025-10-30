import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'], // only our tests
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.next/**',
      '**/.{idea,git,cache,output,temp}/**',
    ],
    passWithNoTests: true, // <-- key line
  },
});

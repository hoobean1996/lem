import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/__tests__/*.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/lang/**/*.ts'],
      exclude: ['src/lang/index.ts', 'src/lang/__tests__/**'],
    },
  },
});

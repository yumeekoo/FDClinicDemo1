import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.test.tsx', 'tests/integration/**/*.test.ts', 'tests/security/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: ['node_modules/', '.next/', 'tests/e2e/'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
      }
    }
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, '.') }
  }
});

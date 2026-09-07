/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      // Whole app is reported; only the engine module — the seam that carries
      // the calculator's behaviour — is gated to a high bar (see ADR 6).
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.test.{ts,tsx}',
        'src/test/**',
        'src/vite-env.d.ts',
        'src/calculator/types.ts',
        'src/calculator/index.ts',
      ],
      thresholds: {
        'src/calculator/**/*.ts': {
          lines: 95,
          branches: 95,
          functions: 95,
          statements: 95,
        },
      },
    },
  },
});

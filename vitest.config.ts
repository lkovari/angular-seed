import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import angular from '@analogjs/vite-plugin-angular';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  plugins: [
    angular({
      jit: true,
      tsconfig: resolve(__dirname, './tsconfig.json'),
    }),
  ],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    include: ['projects/**/*.spec.ts', 'projects/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'text-summary'],
      include: ['projects/**/*.ts'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.spec.ts',
        '**/*.test.ts',
        '**/index.ts',
        '**/*.interface.ts',
        '**/*.model.ts',
        '**/*.config.ts',
        '**/*.mjs',
        '**/node_modules/**',
        '**/dist/**',
        '**/out-tsc/**',
        '**/.angular/**',
        '**/coverage/**',
      ],
      reportsDirectory: './coverage',
      thresholds: {
        lines: 0,
        functions: 0,
        branches: 0,
        statements: 0,
      },
    },
  },
  resolve: {
    alias: {
      'global-error-handler-lib': resolve(
        __dirname,
        './projects/global-error-handler-lib/src/public-api.ts',
      ),
      'seed-common-lib': resolve(
        __dirname,
        './projects/seed-common-lib/src/public-api.ts',
      ),
    },
  },
  assetsInclude: ['**/*.html'],
  optimizeDeps: {
    exclude: ['@angular/platform-browser', '@angular/platform-browser-dynamic'],
  },
});

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@hooks': resolve(__dirname, 'src/hooks'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@tokens': resolve(__dirname, 'src/tokens'),
    },
  },
  test: {
    // Use jsdom for browser-like environment
    environment: 'jsdom',

    // Global test utilities (describe, it, expect, etc.)
    globals: true,

    // Setup files run before each test file
    setupFiles: ['./src/test-setup.ts'],

    // Test file patterns
    include: [
      'src/**/*.test.ts',
      'src/**/*.test.tsx',
      'src/**/*.spec.ts',
      'src/**/*.spec.tsx',
    ],

    // Exclude patterns
    exclude: [
      'node_modules',
      'dist',
      'storybook-static',
      'coverage',
    ],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      exclude: [
        'node_modules/',
        'src/test-setup.ts',
        '**/*.stories.{ts,tsx}',
        '**/*.config.{ts,js,cjs}',
        'dist/',
        'storybook-static/',
        '.storybook/',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },

    // Reporter configuration
    reporter: ['verbose', 'json', 'html'],
    outputFile: {
      json: './test-results/results.json',
      html: './test-results/index.html',
    },

    // Timeout for async tests (ms)
    testTimeout: 10000,

    // Retry flaky tests
    retry: 0,

    // Pool options for parallel test execution
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: false,
      },
    },
  },
});
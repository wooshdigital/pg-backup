import { defineConfig } from 'rollup';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import postcss from 'rollup-plugin-postcss';
import copy from 'rollup-plugin-copy';
import { readFileSync } from 'fs';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8')) as {
  main: string;
  module: string;
};

export default defineConfig([
  // Main library bundle (ESM + CJS)
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.module,
        format: 'esm',
        sourcemap: true,
        exports: 'named',
      },
      {
        file: pkg.main,
        format: 'cjs',
        sourcemap: true,
        exports: 'named',
        interop: 'auto',
      },
    ],
    plugins: [
      // Externalize peer dependencies automatically
      peerDepsExternal(),

      // Resolve node_modules
      resolve({
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        browser: true,
      }),

      // Convert CommonJS modules to ESM
      commonjs(),

      // Process CSS files
      postcss({
        extract: 'styles.css',
        minimize: false,
        sourceMap: true,
        modules: false,
      }),

      // TypeScript compilation with declarations
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: './dist',
        rootDir: 'src',
        noEmit: false,
        exclude: [
          '**/*.test.ts',
          '**/*.test.tsx',
          '**/*.spec.ts',
          '**/*.spec.tsx',
          '**/*.stories.ts',
          '**/*.stories.tsx',
          'src/test-setup.ts',
        ],
      }),

      // Copy static assets
      copy({
        targets: [
          {
            src: 'src/tokens/*.css',
            dest: 'dist/tokens',
          },
        ],
      }),
    ],
    external: ['react', 'react-dom', 'react/jsx-runtime'],
  },
]);
import type { StorybookConfig } from '@storybook/react-vite';
import { resolve } from 'path';

const config: StorybookConfig = {
  // Story file patterns
  stories: [
    '../src/**/*.mdx',
    '../src/**/*.stories.@(js|jsx|ts|tsx)',
  ],

  // Addons
  addons: [
    // Core essentials (controls, actions, backgrounds, viewport, docs)
    '@storybook/addon-essentials',

    // Accessibility testing addon
    '@storybook/addon-a11y',

    // Component interactions and user event simulation
    '@storybook/addon-interactions',
  ],

  // Use Vite as the builder for fast HMR
  framework: {
    name: '@storybook/react-vite',
    options: {
      builder: {
        viteConfigPath: './vite.config.ts',
      },
    },
  },

  // Vite configuration overrides for Storybook
  viteFinal: async (config) => {
    // Ensure path aliases work in Storybook
    if (config.resolve) {
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': resolve(__dirname, '../src'),
        '@components': resolve(__dirname, '../src/components'),
        '@hooks': resolve(__dirname, '../src/hooks'),
        '@utils': resolve(__dirname, '../src/utils'),
        '@tokens': resolve(__dirname, '../src/tokens'),
      };
    }

    return config;
  },

  // TypeScript configuration
  typescript: {
    check: false,
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      propFilter: (prop) => {
        // Filter out HTML element props to keep stories focused
        if (prop.parent) {
          return !prop.parent.fileName.includes('node_modules');
        }
        return true;
      },
    },
  },

  // Static files
  staticDirs: ['../public'],

  // Docs configuration
  docs: {
    autodocs: 'tag',
    defaultName: 'Docs',
  },
};

export default config;
import type { Preview } from '@storybook/react';
import '../src/tokens/index.css';

/**
 * Storybook Preview Configuration
 *
 * Global decorators, parameters, and accessibility addon configuration.
 */
const preview: Preview = {
  parameters: {
    // Actions configuration
    actions: {
      argTypesRegex: '^on[A-Z].*',
    },

    // Controls configuration
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      // Sort controls alphabetically, with required first
      sort: 'requiredFirst',
      // Expand color pickers
      expanded: true,
    },

    // Background options for testing components on different backgrounds
    backgrounds: {
      default: 'white',
      values: [
        {
          name: 'white',
          value: '#ffffff',
        },
        {
          name: 'light gray',
          value: '#f9fafb',
        },
        {
          name: 'dark',
          value: '#111827',
        },
        {
          name: 'black',
          value: '#000000',
        },
      ],
    },

    // Viewport options
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: { width: '375px', height: '667px' },
        },
        tablet: {
          name: 'Tablet',
          styles: { width: '768px', height: '1024px' },
        },
        desktop: {
          name: 'Desktop',
          styles: { width: '1280px', height: '800px' },
        },
        widescreen: {
          name: 'Widescreen',
          styles: { width: '1920px', height: '1080px' },
        },
      },
    },

    // Accessibility addon configuration
    a11y: {
      // Use the axe-core engine
      config: {
        rules: [
          // Ensure all page content is contained by landmarks
          {
            id: 'region',
            enabled: false,
          },
        ],
      },
      // Run a11y checks on all stories
      options: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice'],
        },
      },
      // Highlight violations in the canvas
      element: '#storybook-root',
    },

    // Docs configuration
    docs: {
      // Show source code by default
      source: {
        type: 'dynamic',
        excludeDecorators: true,
      },
      // Story sorting
      toc: true,
    },

    // Options
    options: {
      storySort: {
        order: [
          'Introduction',
          'Design Tokens',
          'Hooks',
          'Utilities',
          'Components',
          ['Common', '*'],
        ],
      },
    },
  },

  // Global decorators
  decorators: [
    // Wrap all stories in a div to ensure proper styling context
    (Story) => {
      return Story();
    },
  ],

  // Global types for toolbar controls
  globalTypes: {
    colorScheme: {
      name: 'Color Scheme',
      description: 'Global color scheme for components',
      defaultValue: 'light',
      toolbar: {
        icon: 'contrast',
        items: [
          { value: 'light', title: 'Light', left: '☀️' },
          { value: 'dark', title: 'Dark', left: '🌙' },
        ],
        showName: true,
      },
    },
    locale: {
      name: 'Locale',
      description: 'Internationalization locale',
      defaultValue: 'en',
      toolbar: {
        icon: 'globe',
        items: [
          { value: 'en', title: 'English', right: '🇺🇸' },
          { value: 'ar', title: 'Arabic (RTL)', right: '🇸🇦' },
        ],
        showName: true,
      },
    },
  },
};

export default preview;
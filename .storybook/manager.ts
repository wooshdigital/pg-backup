import { addons } from '@storybook/manager-api';
import { create } from '@storybook/theming/create';

/**
 * Storybook UI Theme Configuration
 *
 * Customizes the Storybook manager (sidebar, toolbar, etc.)
 * to match the library's brand identity.
 */
const theme = create({
  base: 'light',

  // Brand
  brandTitle: 'Accessible Components',
  brandUrl: 'https://github.com/your-org/accessible-components',
  brandTarget: '_blank',

  // Colors
  colorPrimary: '#2563eb',    // Blue 600
  colorSecondary: '#1d4ed8',  // Blue 700

  // UI
  appBg: '#f9fafb',           // Gray 50
  appContentBg: '#ffffff',    // White
  appPreviewBg: '#ffffff',    // White
  appBorderColor: '#e5e7eb',  // Gray 200
  appBorderRadius: 6,

  // Typography
  fontBase: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontCode: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',

  // Text colors
  textColor: '#111827',       // Gray 900
  textInverseColor: '#ffffff', // White
  textMutedColor: '#6b7280',  // Gray 500

  // Toolbar default and active colors
  barTextColor: '#4b5563',    // Gray 600
  barHoverColor: '#2563eb',   // Blue 600
  barSelectedColor: '#2563eb', // Blue 600
  barBg: '#ffffff',           // White

  // Form colors
  inputBg: '#ffffff',
  inputBorder: '#d1d5db',     // Gray 300
  inputTextColor: '#111827',  // Gray 900
  inputBorderRadius: 4,

  // Button colors
  buttonBg: '#ffffff',
  buttonBorder: '#d1d5db',    // Gray 300
  booleanBg: '#f3f4f6',       // Gray 100
  booleanSelectedBg: '#2563eb', // Blue 600
});

addons.setConfig({
  theme,

  // Sidebar configuration
  sidebar: {
    showRoots: true,
    collapsedRoots: [],
  },

  // Enable keyboard shortcuts
  enableShortcuts: true,

  // Panel position
  panelPosition: 'bottom',

  // Initial active tab in the panel
  selectedPanel: 'storybook/a11y/panel',

  // Toolbar configuration
  toolbar: {
    title: { hidden: false },
    zoom: { hidden: false },
    eject: { hidden: false },
    copy: { hidden: false },
    fullscreen: { hidden: false },
  },
});
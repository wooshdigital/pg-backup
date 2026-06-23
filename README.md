# Accessible React Component Library

A production-ready, fully accessible React component library built with TypeScript, following WCAG 2.1 AA guidelines.

## Accessibility Philosophy

Every component in this library is designed with accessibility as a first-class concern, not an afterthought. We adhere to the following principles:

1. **Keyboard Navigation**: All interactive components are fully operable via keyboard
2. **Screen Reader Support**: Proper ARIA roles, states, and properties are applied throughout
3. **Focus Management**: Visible focus indicators and logical focus order
4. **Color Contrast**: All color combinations meet WCAG 2.1 AA contrast ratios (4.5:1 for text, 3:1 for UI components)
5. **Semantic HTML**: We use the right element for the right job
6. **Error Identification**: Form errors are clearly communicated to all users

## Installation

```bash
npm install @your-org/accessible-components
# or
yarn add @your-org/accessible-components
# or
pnpm add @your-org/accessible-components
```

## Quick Start

```tsx
import { /* components */ } from '@your-org/accessible-components';
import '@your-org/accessible-components/dist/styles.css';

function App() {
  return (
    <div>
      {/* Your accessible components here */}
    </div>
  );
}
```

## Development

### Prerequisites

- Node.js >= 18
- pnpm >= 8

### Setup

```bash
pnpm install
```

### Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start Vite development server |
| `pnpm build` | Build library for production |
| `pnpm test` | Run unit tests with Vitest |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm storybook` | Start Storybook development server |
| `pnpm build-storybook` | Build static Storybook site |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Run ESLint with auto-fix |
| `pnpm type-check` | Run TypeScript type checking |

### Project Structure

```
src/
├── components/        # UI components
│   └── common/        # Shared/primitive components
├── hooks/             # Custom React hooks
│   ├── useId.ts       # Stable ID generation
│   └── useFocusVisible.ts  # Focus visibility detection
├── tokens/            # Design tokens (CSS custom properties)
│   ├── colors.css     # Color palette
│   ├── spacing.css    # Spacing scale
│   ├── typography.css # Typography tokens
│   ├── focus.css      # Focus ring styles
│   └── index.css      # Barrel import
├── utils/             # Utility functions
│   ├── aria.ts        # ARIA helper utilities
│   ├── keys.ts        # Keyboard event constants
│   └── classNames.ts  # Class name utility
├── types.ts           # Shared TypeScript types
├── index.ts           # Main library exports
└── test-setup.ts      # Test configuration
.storybook/            # Storybook configuration
```

## Contributing

### Code Style

- TypeScript strict mode is enforced
- ESLint with `eslint-plugin-jsx-a11y` rules set to error
- All components must pass automated accessibility tests
- Every component requires a Storybook story

### Testing Requirements

All components must have:
1. Unit tests with `@testing-library/react`
2. Accessibility tests with `jest-axe`
3. Keyboard interaction tests
4. A Storybook story with accessibility addon enabled

### Accessibility Testing

```tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('component has no accessibility violations', async () => {
  const { container } = render(<YourComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `a11y:` Accessibility improvement
- `docs:` Documentation changes
- `test:` Test additions/changes
- `chore:` Maintenance tasks

## Browser Support

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+
- iOS Safari 14+

## License

MIT
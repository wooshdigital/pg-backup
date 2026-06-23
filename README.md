# SplitWise Clone

> Split expenses effortlessly with friends and family — a React Native / Expo app.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://typescriptlang.org)
[![Expo](https://img.shields.io/badge/Expo-~50.0-000020.svg)](https://expo.dev)
[![React Navigation](https://img.shields.io/badge/React%20Navigation-v6-7B68EE.svg)](https://reactnavigation.org)

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Roadmap](#roadmap)

---

## Overview

A mobile-first expense splitting app that makes sharing costs with groups simple and transparent. Track trips, log expenses, split bills with configurable methods (equal, exact, percentage, shares), and settle up with ease.

**Phase 1 status:** Foundation complete — navigation, theming, placeholder screens, and the full dev toolchain are configured.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          App.tsx                                 │
│                 (ThemeProvider + NavigationContainer)            │
└────────────────────────┬────────────────────────────────────────┘
                         │
              ┌──────────▼──────────┐
              │    RootNavigator    │  (Bottom Tab Navigator)
              └─────────┬───────────┘
          ┌─────────────┼─────────────┐
          │             │             │
   ┌──────▼─────┐ ┌─────▼──────┐ ┌───▼──────────┐
   │ HomeScreen │ │TripStack   │ │SettingsScreen│
   │            │ │Navigator   │ │              │
   └────────────┘ └─────┬──────┘ └──────────────┘
                        │
              ┌─────────▼──────────┐
              │   TripsScreen      │
              │   TripDetailScreen │  (Phase 2+)
              │   AddExpenseScreen │  (Phase 2+)
              └────────────────────┘

State / Persistence
┌──────────────────────────────────────────────────────────────┐
│  ThemeContext  │  TripContext (Phase 2)  │  AsyncStorage      │
│  (light/dark)  │  (trips, expenses)     │  (persistence)     │
└──────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native 0.73 via Expo ~50 (managed workflow) |
| Language | TypeScript 5.3 (strict mode) |
| Navigation | React Navigation v6 (Bottom Tabs + Native Stack) |
| State | React Context + AsyncStorage |
| Styling | StyleSheet API + Token-based theme system |
| Linting | ESLint 8 + @typescript-eslint |
| Formatting | Prettier 3 |
| Git hooks | Husky 8 + lint-staged |

---

## Project Structure

```
/
├── App.tsx                  # Entry point: ThemeProvider + NavigationContainer
├── app.json                 # Expo metadata
├── assets/                  # Static assets (icon, splash)
└── src/
    ├── components/
    │   └── common/
    │       ├── Button.tsx   # Themed button (5 variants, 3 sizes)
    │       ├── Card.tsx     # Reusable card with elevation
    │       └── Typography.tsx # Heading, Body, Caption, Label, Display
    ├── constants/
    │   ├── routes.ts        # Screen name enums
    │   └── theme.ts         # Light/dark palette, spacing, typography tokens
    ├── context/
    │   └── ThemeContext.tsx  # Theme provider + useTheme hook
    ├── hooks/
    │   ├── useAsyncStorage.ts # AsyncStorage-backed persistent state
    │   ├── useFocusVisible.ts # Keyboard focus detection
    │   └── useId.ts         # Stable unique ID generation
    ├── navigation/
    │   ├── RootNavigator.tsx     # Bottom tab navigator
    │   └── TripStackNavigator.tsx # Trip stack navigator
    ├── screens/
    │   ├── HomeScreen.tsx   # Dashboard / home
    │   ├── TripsScreen.tsx  # Trip list
    │   └── SettingsScreen.tsx # App settings
    ├── types/
    │   └── index.ts         # Trip, Participant, Expense, Split, AppTheme
    └── utils/
        ├── currency.ts      # Format/parse currency amounts
        ├── date.ts          # Format dates, relative time
        └── id.ts            # UUID generation
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) ≥ 18
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [iOS Simulator](https://developer.apple.com/xcode/) or [Android Emulator](https://developer.android.com/studio), or the [Expo Go](https://expo.dev/go) app

### Installation

```bash
# Clone the repository
git clone https://github.com/yourname/splitwise-clone.git
cd splitwise-clone

# Install dependencies
npm install

# Install Husky hooks
npm run prepare
```

### Running the App

```bash
# Start Expo dev server
npm start

# Or target a specific platform
npm run ios
npm run android
npm run web
```

---

## Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run lint` | Lint and auto-fix |
| `npm run lint:check` | Lint without fixing |
| `npm run type-check` | TypeScript type check |
| `npm run format` | Format all files |
| `npm test` | Run tests with Jest |

### Code Style

- **TypeScript strict mode** — no implicit any, all return types checked
- **Prettier** enforces consistent formatting (single quotes, 100 char width)
- **ESLint** catches React, React Native, and TypeScript anti-patterns
- **Husky pre-commit** runs lint-staged + type-check before every commit
- **Path aliases** — use `@components/`, `@screens/`, `@hooks/` etc.

### Theme System

The app uses a token-based theme system with full light/dark support:

```typescript
import { useTheme } from '@context/ThemeContext';

function MyComponent() {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <Text style={{ color: theme.colors.text, fontSize: theme.typography.fontSize.md }}>
        Hello World
      </Text>
    </View>
  );
}
```

### Adding a New Screen

1. Create `src/screens/MyScreen.tsx`
2. Export from `src/screens/index.ts`
3. Add the route name to `src/constants/routes.ts`
4. Add the param type to `src/types/index.ts`
5. Register in the appropriate navigator

---

## Roadmap

| Phase | Features |
|-------|---------|
| ✅ Phase 1 | Foundation, navigation, theming, placeholder screens |
| 🔲 Phase 2 | Trip CRUD, participant management, AsyncStorage persistence |
| 🔲 Phase 3 | Expense entry, split calculation engine, balance tracking |
| 🔲 Phase 4 | Settlement suggestions, activity feed, charts |
| 🔲 Phase 5 | Multi-currency support, export, sharing |
| 🔲 Phase 6 | Backend sync, authentication, real-time updates |

---

## License

MIT © 2026 Your Name
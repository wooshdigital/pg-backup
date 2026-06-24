# SplitEase 💰

> Split expenses effortlessly. No awkward money conversations.

A React Native (Expo) app for tracking shared expenses on group trips.

---

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Phase Roadmap](#phase-roadmap)

---

## Overview

SplitEase helps groups of friends and travelers track shared expenses, split costs fairly, and settle debts — all without spreadsheets or awkward conversations.

**Core Features (planned):**
- 📋 Create trips and invite participants
- 💸 Add expenses with flexible split methods (equal, percentage, exact, shares)
- 📊 Real-time balance summaries
- 🌍 Multi-currency support
- ✅ Settle up with one tap

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        App.tsx                          │
│              (ThemeProvider + NavigationContainer)      │
└────────────────────────┬────────────────────────────────┘
                         │
              ┌──────────▼──────────┐
              │    RootNavigator    │
              │  (Bottom Tab Nav)   │
              └──┬────────┬────────┘
                 │        │
        ┌────────▼──┐  ┌──▼──────────────┐
        │   Home    │  │ TripStackNav     │
        │  Screen   │  │                 │
        └───────────┘  │ ┌─────────────┐ │
                       │ │ TripsList   │ │
        ┌──────────┐   │ ├─────────────┤ │
        │ Settings │   │ │ TripDetail  │ │
        │  Screen  │   │ ├─────────────┤ │
        └──────────┘   │ │ AddExpense  │ │
                       │ ├─────────────┤ │
                       │ │ ExpDetail   │ │
                       │ └─────────────┘ │
                       └─────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    Global State                         │
│                                                         │
│  ThemeContext ──────► light/dark palette tokens         │
│  AsyncStorage ──────► color mode persistence           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                  Domain Types (TypeScript)               │
│                                                         │
│  Trip ──► Expense ──► Split ──► SplitShare              │
│      └──► Participant                                   │
│      └──► Currency                                      │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native (Expo Managed) |
| Language | TypeScript (strict mode) |
| Navigation | React Navigation v6 (Stack + Bottom Tabs) |
| Theming | Custom ThemeContext (light/dark) |
| Persistence | AsyncStorage (Phase 1) |
| Linting | ESLint + @typescript-eslint |
| Formatting | Prettier |
| Git Hooks | Husky + lint-staged |

---

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 9 or Yarn >= 1.22
- Expo CLI: `npm install -g expo-cli`
- Expo Go app on your iOS/Android device (or a simulator)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/splitease.git
cd splitease

# Install dependencies
npm install

# Install Husky hooks
npm run prepare

# Start the development server
npm start
```

### Running on Device

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web browser
npm run web
```

Scan the QR code with **Expo Go** (Android) or the Camera app (iOS) to run on a physical device.

---

## Project Structure

```
splitease/
├── App.tsx                    # Root component
├── app.json                   # Expo configuration
├── babel.config.js            # Babel + module resolver aliases
├── tsconfig.json              # TypeScript strict config
├── .eslintrc.js               # ESLint rules
├── .prettierrc                # Prettier rules
├── .husky/                    # Git hooks
│   └── pre-commit             # lint + type-check on commit
├── assets/
│   ├── icon.png               # App icon
│   └── splash.png             # Splash screen
└── src/
    ├── types/
    │   └── index.ts           # Trip, Expense, Participant, Split, Currency
    ├── constants/
    │   ├── theme.ts           # Color palette, typography, spacing, shadows
    │   └── routes.ts          # Route name enums
    ├── context/
    │   └── ThemeContext.tsx   # Light/dark ThemeProvider + useTheme hook
    ├── hooks/
    │   ├── useAsyncStorage.ts # Persistent state hook
    │   ├── useFocusVisible.ts # Keyboard focus tracking
    │   └── useId.ts           # Stable unique ID generation
    ├── utils/
    │   ├── aria.ts            # Accessibility helpers
    │   ├── classNames.ts      # Conditional style merging
    │   ├── currency.ts        # Currency formatting utilities
    │   ├── date.ts            # Date formatting utilities
    │   ├── id.ts              # UUID generation
    │   └── keys.ts            # Keyboard key constants
    ├── components/
    │   └── common/
    │       ├── Card.tsx       # Reusable card with shadow
    │       ├── Button.tsx     # Themed button (5 variants)
    │       └── Typography.tsx # Heading, Body, Caption components
    ├── navigation/
    │   ├── RootNavigator.tsx      # Bottom tab navigator
    │   └── TripStackNavigator.tsx # Trip stack navigator
    └── screens/
        ├── HomeScreen.tsx     # Hero + feature highlights
        ├── TripsScreen.tsx    # Trip list with placeholder data
        └── SettingsScreen.tsx # Theme toggle + preferences
```

---

## Development Workflow

### Commands

```bash
npm start          # Start Expo dev server
npm run ios        # Open iOS simulator
npm run android    # Open Android emulator
npm run lint       # Run ESLint
npm run lint:fix   # Auto-fix ESLint issues
npm run type-check # Run TypeScript type-checker
npm run format     # Prettier format all files
```

### Path Aliases

TypeScript path aliases are configured for clean imports:

```typescript
import { useTheme } from '@context/ThemeContext';
import { HomeScreen } from '@screens/HomeScreen';
import { Button } from '@components/common/Button';
import { Trip } from '@types/index';
import { Routes } from '@constants/routes';
```

### Pre-commit Hooks

Every commit automatically runs:
1. **ESLint** — catches code quality issues on staged `.ts/.tsx` files
2. **Prettier** — formats staged files
3. **TypeScript** — full type-check across the codebase

---

## Phase Roadmap

| Phase | Status | Description |
|-------|--------|-------------|
| **Phase 1** | ✅ Complete | Foundation: navigation, theming, placeholder screens |
| **Phase 2** | 🔜 Planned | Trip & expense CRUD with AsyncStorage |
| **Phase 3** | 🔜 Planned | Balance calculation & settlement suggestions |
| **Phase 4** | 🔜 Planned | Camera receipts & multi-currency conversion |
| **Phase 5** | 🔜 Planned | Cloud sync & real-time collaboration |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit with conventional commits: `git commit -m "feat: add expense splitting"`
4. Push and open a Pull Request

---

## License

MIT © SplitEase Contributors
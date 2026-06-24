# ✈️ SplitEase

> **Travel together, settle smarter.**
> A React Native app for splitting group travel expenses fairly, quickly, and without the drama.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Development Workflow](#development-workflow)
- [Roadmap](#roadmap)

---

## Overview

SplitEase is a mobile-first expense splitting app designed for group travel. Add expenses in any currency, assign custom splits, and see who owes whom — all in real time. No account required to get started.

---

## ✨ Features

| Phase | Feature | Status |
|-------|---------|--------|
| 1 | Project setup, navigation, theming | ✅ Done |
| 2 | Trip & participant management | 🔜 Upcoming |
| 3 | Expense tracking with splits | 🔜 Upcoming |
| 4 | Balance calculation & settlements | 🔜 Upcoming |
| 5 | Multi-currency support | 🔜 Upcoming |
| 6 | Export & sharing | 🔜 Upcoming |

---

## 🏛️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        App.tsx (Root)                           │
│                                                                 │
│  ┌─────────────────┐    ┌──────────────────────────────────┐   │
│  │  ThemeProvider  │    │     NavigationContainer          │   │
│  │  (ThemeContext) │    │                                  │   │
│  └────────┬────────┘    │  ┌────────────────────────────┐  │   │
│           │             │  │     RootNavigator          │  │   │
│           │             │  │   (Bottom Tab Navigator)   │  │   │
│           │             │  │                            │  │   │
│           │             │  │  ┌──────┐ ┌──────┐ ┌────┐ │  │   │
│           │             │  │  │ Home │ │Trips │ │Sets│ │  │   │
│           │             │  │  │      │ │Stack │ │    │ │  │   │
│           │             │  │  └──────┘ └──┬───┘ └────┘ │  │   │
│           │             │  └─────────────┼─────────────┘  │   │
│           │             │                │                  │   │
│           │             │     TripStackNavigator           │   │
│           │             │   ┌────────────────────────┐     │   │
│           │             │   │ TripsList → TripDetail │     │   │
│           │             │   │ AddExpense → Settlements│    │   │
│           │             │   └────────────────────────┘     │   │
│           │             └──────────────────────────────────┘   │
└───────────┴─────────────────────────────────────────────────────┘

Data Flow:
AsyncStorage ←→ Hooks ←→ Screens/Components
ThemeContext → useTheme() → any component
```

### Key Design Decisions

- **No backend yet**: Phase 1 uses AsyncStorage for all persistence. A REST/GraphQL backend can be dropped in later.
- **ThemeContext**: Single source of truth for light/dark mode. Persisted to AsyncStorage across sessions.
- **TypeScript strict mode**: All domain types are defined in `src/types/index.ts`.
- **Barrel exports**: Each folder has an `index.ts` for clean imports.

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- npm or yarn
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS Simulator (macOS) or Android Emulator, or the **Expo Go** app on your phone

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/splitease.git
cd splitease

# Install dependencies
npm install

# Set up Husky pre-commit hooks
npm run prepare
```

### Running the App

```bash
# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run in browser (limited functionality)
npm run web
```

### Scan the QR Code

After running `npm start`, scan the QR code with **Expo Go** (iOS/Android) to preview on your physical device.

---

## 📁 Project Structure

```
splitease/
├── App.tsx                  # Root component
├── app.json                 # Expo metadata
├── assets/
│   ├── icon.png             # App icon
│   └── splash.png           # Splash screen
├── src/
│   ├── components/
│   │   └── common/
│   │       ├── Button.tsx   # Reusable themed button
│   │       ├── Card.tsx     # Reusable card container
│   │       └── Typography.tsx # Heading, Body, Caption, etc.
│   ├── constants/
│   │   ├── routes.ts        # Screen route name enums
│   │   └── theme.ts         # Color palette, spacing, typography tokens
│   ├── context/
│   │   └── ThemeContext.tsx  # Light/dark theme provider + useTheme hook
│   ├── hooks/
│   │   ├── useAsyncStorage.ts
│   │   ├── useFocusVisible.ts
│   │   └── useId.ts
│   ├── navigation/
│   │   ├── RootNavigator.tsx      # Bottom tab navigator
│   │   └── TripStackNavigator.tsx # Trip flow stack navigator
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── TripsScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── types/
│   │   └── index.ts         # Trip, Expense, Participant, Split, etc.
│   └── utils/
│       ├── currency.ts      # Format & parse currency values
│       ├── date.ts          # Date helpers
│       └── id.ts            # ID generators
├── .eslintrc.js
├── .husky/pre-commit
├── .prettierrc
├── babel.config.js
├── package.json
└── tsconfig.json
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native + Expo (managed workflow) |
| Language | TypeScript (strict) |
| Navigation | React Navigation v6 (Stack + Bottom Tabs) |
| Persistence | AsyncStorage |
| Theming | Custom ThemeContext with light/dark tokens |
| Linting | ESLint + TypeScript ESLint |
| Formatting | Prettier |
| Git Hooks | Husky + lint-staged |

---

## 🔧 Development Workflow

### Available Scripts

```bash
npm start          # Start Expo dev server
npm run ios        # Run on iOS
npm run android    # Run on Android
npm run lint       # Run ESLint
npm run lint:fix   # Run ESLint with auto-fix
npm run type-check # Run TypeScript compiler check
npm run format     # Run Prettier on all files
npm run test       # Run Jest test suite
```

### Pre-commit Hooks

Husky runs the following checks automatically on `git commit`:

1. `lint-staged` → ESLint + Prettier on staged files
2. `tsc --noEmit` → TypeScript type check

### Code Style

- **Single quotes** for strings
- **2 spaces** for indentation
- **100 character** line width
- **Trailing commas** everywhere
- **No inline styles** (use StyleSheet.create)

---

## 🗺️ Roadmap

- **Phase 1** ✅ Foundation & project setup
- **Phase 2** 🔜 Trip & participant management
- **Phase 3** 🔜 Expense tracking (add/edit/delete)
- **Phase 4** 🔜 Balance calculation & settlement suggestions
- **Phase 5** 🔜 Multi-currency with live exchange rates
- **Phase 6** 🔜 Export to PDF/CSV, sharing via link
- **Phase 7** 🔜 Optional cloud sync

---

## 📄 License

MIT © SplitEase Contributors
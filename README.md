# ✈️ TripSplit

> Split travel expenses with friends & family — effortlessly.

TripSplit is a React Native mobile application built with Expo that helps groups of travelers track shared expenses, split bills using various methods, and settle debts with minimal transactions.

---

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Phase Roadmap](#phase-roadmap)
- [Core Domain Types](#core-domain-types)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      App.tsx                            │
│         (ThemeProvider + NavigationContainer)           │
└─────────────────────┬───────────────────────────────────┘
                      │
         ┌────────────▼────────────┐
         │     RootNavigator       │
         │  (Bottom Tab Navigator) │
         └──┬──────────┬───────────┘
            │          │           
     ┌──────▼──┐  ┌────▼───────┐  ┌──────────────┐
     │  Home   │  │   Trips    │  │   Settings   │
     │ Screen  │  │   Stack    │  │    Screen    │
     └─────────┘  └────┬───────┘  └──────────────┘
                       │
              ┌────────▼────────────┐
              │   TripStackNavigator│
              │  ┌───────────────┐  │
              │  │  TripsList    │  │
              │  │  TripDetail   │  │
              │  │  TripCreate   │  │
              │  │  ExpenseCreate│  │
              │  └───────────────┘  │
              └─────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                    State & Data Layer                    │
│                                                         │
│  ThemeContext ──── AsyncStorage (persistence)           │
│  (light/dark)                                           │
│                                                         │
│  [Phase 2+] TripContext ── AsyncStorage                 │
│             ExpenseContext                              │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
tripsplit/
├── App.tsx                     # Root component
├── app.json                    # Expo configuration
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config (strict)
├── babel.config.js             # Babel config with path aliases
├── .eslintrc.js                # ESLint rules
├── .prettierrc                 # Prettier rules
├── .husky/
│   └── pre-commit              # Pre-commit hooks
├── assets/
│   ├── icon.png                # App icon
│   └── splash.png              # Splash screen
└── src/
    ├── index.ts                # Public API barrel export
    ├── types/
    │   └── index.ts            # Core domain interfaces
    ├── constants/
    │   ├── theme.ts            # Colors, spacing, typography tokens
    │   ├── routes.ts           # Route name enums
    │   └── index.ts
    ├── context/
    │   ├── ThemeContext.tsx     # Light/dark theme provider + hook
    │   └── index.ts
    ├── navigation/
    │   ├── RootNavigator.tsx   # Bottom tab navigator
    │   ├── TripStackNavigator.tsx
    │   └── index.ts
    ├── screens/
    │   ├── HomeScreen.tsx      # App home / landing
    │   ├── TripsScreen.tsx     # Trip list
    │   ├── SettingsScreen.tsx  # Settings / preferences
    │   └── index.ts
    ├── components/
    │   ├── common/
    │   │   ├── Card.tsx        # Reusable card container
    │   │   ├── Button.tsx      # Themed button component
    │   │   └── Typography.tsx  # Heading, Body, Caption, Label
    │   └── index.ts
    ├── hooks/
    │   ├── useAsyncStorage.ts  # AsyncStorage CRUD hook
    │   └── index.ts
    └── utils/
        ├── currency.ts         # Currency formatting helpers
        ├── date.ts             # Date formatting helpers
        ├── id.ts               # UUID generation
        └── index.ts
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native (Expo Managed) |
| Language | TypeScript 5 (strict mode) |
| Navigation | React Navigation v6 (Stack + Bottom Tabs) |
| Theming | Custom ThemeContext + React Native StyleSheet |
| Persistence | AsyncStorage (Phase 1) |
| Linting | ESLint + TypeScript-ESLint |
| Formatting | Prettier |
| Git Hooks | Husky + lint-staged |

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Emulator — or the **Expo Go** app on a physical device

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/tripsplit.git
cd tripsplit

# 2. Install dependencies
npm install

# 3. Set up Husky git hooks
npm run prepare

# 4. Start the development server
npm start
```

### Running on a device

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web (preview only)
npm run web
```

---

## 🔧 Development Workflow

### Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start Expo dev server |
| `npm run lint` | Run ESLint (with auto-fix) |
| `npm run lint:check` | Run ESLint (no fix, for CI) |
| `npm run type-check` | Run TypeScript compiler check |
| `npm run format` | Format all files with Prettier |
| `npm run format:check` | Check formatting (for CI) |
| `npm test` | Run Jest tests |

### Pre-commit Hooks

Every commit automatically runs:
1. **lint-staged** — ESLint + Prettier on staged files
2. **tsc --noEmit** — TypeScript type checking

### Path Aliases

Use `@/`, `@screens/`, `@components/`, etc. instead of relative paths:

```ts
// ❌ Don't do this
import { Button } from '../../components/common/Button';

// ✅ Do this
import { Button } from '@components/common/Button';
```

---

## 🗺️ Phase Roadmap

| Phase | Description | Status |
|-------|-------------|--------|
| **Phase 1** | Foundation & Project Setup | ✅ Current |
| **Phase 2** | Trip CRUD & AsyncStorage | 🔜 Planned |
| **Phase 3** | Expense Tracking | 🔜 Planned |
| **Phase 4** | Split Logic Engine | 🔜 Planned |
| **Phase 5** | Settlement & Balances | 🔜 Planned |
| **Phase 6** | Polish & Animations | 🔜 Planned |
| **Phase 7** | Backend / Sync | 🔜 Planned |

---

## 📐 Core Domain Types

```ts
interface Trip {
  id: string;
  name: string;
  destination?: string;
  startDate?: string;    // ISO 8601
  endDate?: string;      // ISO 8601
  currency: CurrencyCode;
  status: 'planning' | 'active' | 'completed' | 'archived';
  participants: Participant[];
  expenses: Expense[];
}

interface Expense {
  id: string;
  tripId: string;
  title: string;
  amount: number;        // minor units (cents)
  currency: CurrencyCode;
  category: ExpenseCategory;
  paidBy: string;        // participantId
  split: Split;
}

interface Split {
  id: string;
  method: 'equal' | 'exact' | 'percentage' | 'shares';
  shares: SplitShare[];
}

interface Participant {
  id: string;
  name: string;
  email?: string;
}
```

---

## 📄 License

MIT © 2026 TripSplit
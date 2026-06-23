# TripSplit 🌍✈️

> Split expenses effortlessly with friends and family on any adventure.

TripSplit is a mobile app built with **React Native + Expo** that makes shared travel expense tracking painless. Add trips, invite companions, log expenses, and let TripSplit handle the math.

---

## 📐 Architecture Overview

```
tripsplit/
├── App.tsx                    # Root: ThemeProvider + NavigationContainer
├── app.json                   # Expo config (icon, splash, build settings)
├── assets/                    # Static assets (icon, splash)
├── src/
│   ├── components/
│   │   └── common/            # Reusable UI primitives
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       └── Typography.tsx
│   ├── constants/
│   │   ├── routes.ts          # Route name enums
│   │   ├── theme.ts           # Design tokens (colors, spacing, etc.)
│   │   └── index.ts
│   ├── context/
│   │   └── ThemeContext.tsx   # Light/dark theme provider + useTheme hook
│   ├── hooks/
│   │   ├── useAsyncStorage.ts # Typed AsyncStorage wrapper hook
│   │   └── index.ts
│   ├── navigation/
│   │   ├── RootNavigator.tsx  # Bottom tab navigator (Home / Trips / Settings)
│   │   ├── TripStackNavigator.tsx
│   │   └── index.ts
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── TripsScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── index.ts
│   ├── types/
│   │   └── index.ts           # Core domain types: Trip, Expense, Split, etc.
│   └── utils/
│       ├── currency.ts        # Money formatting utilities
│       ├── date.ts            # Date formatting utilities
│       ├── id.ts              # ID generation helpers
│       └── index.ts
```

---

## 🗺️ Domain Model

```
Trip
 ├── id, name, description, destination
 ├── currency (default)
 ├── status: planning | active | completed | archived
 ├── participants: Participant[]
 └── expenses: Expense[]
         ├── id, title, amount, currency, category
         ├── paidBy: participantId
         └── split: Split
                  ├── method: equal | exact | percentage | shares
                  └── shares: SplitShare[]
                           └── participantId, amount, settled
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (macOS) or Android Emulator, or the **Expo Go** app on your device

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/your-org/tripsplit.git
cd tripsplit

# 2. Install dependencies
npm install

# 3. Start the Expo development server
npm start

# 4. Open on your preferred platform
#    Press 'i' for iOS simulator
#    Press 'a' for Android emulator
#    Scan QR code with Expo Go for physical device
```

---

## 🛠️ Available Scripts

| Command | Description |
|---|---|
| `npm start` | Start Expo dev server |
| `npm run ios` | Open in iOS Simulator |
| `npm run android` | Open in Android Emulator |
| `npm run lint` | Run ESLint (zero warnings) |
| `npm run lint:fix` | Auto-fix ESLint issues |
| `npm run format` | Format all files with Prettier |
| `npm run format:check` | Check formatting without writing |
| `npm run type-check` | Run TypeScript compiler check |
| `npm test` | Run Vitest in watch mode |
| `npm run test:run` | Run Vitest once (CI) |

---

## 🎨 Design System

### Theming

TripSplit uses a **token-based design system** with full light/dark mode support.

```tsx
import { useTheme } from '@context/ThemeContext';

function MyComponent() {
  const { colors, isDark, toggleTheme } = useTheme();
  return <View style={{ backgroundColor: colors.background }} />;
}
```

### Color Palette

| Token | Light | Dark |
|---|---|---|
| `primary` | `#6C63FF` | `#8B6EFF` |
| `background` | `#F9FAFB` | `#0A0A0F` |
| `surface` | `#FFFFFF` | `#12121A` |
| `text` | `#111827` | `#F9FAFB` |
| `success` | `#22C55E` | `#4ADE80` |
| `error` | `#EF4444` | `#F87171` |

### Spacing Scale

Uses a 4px base grid: `spacing[1] = 4px`, `spacing[4] = 16px`, `spacing[8] = 32px`.

---

## 📱 Navigation Structure

```
RootNavigator (Bottom Tabs)
├── HomeScreen               # Dashboard & getting started
├── TripStackNavigator       # Stack navigator
│   └── TripsScreen          # List of all trips
└── SettingsScreen           # App preferences
```

---

## 🔧 Code Quality

### ESLint

Uses `@typescript-eslint/recommended` + `react-hooks` + `react-native` plugins.

```bash
npm run lint        # Check
npm run lint:fix    # Auto-fix
```

### Prettier

Enforces consistent formatting (single quotes, trailing commas, 100-char line width).

```bash
npm run format        # Write
npm run format:check  # Check only (CI)
```

### Husky Pre-commit Hooks

Automatically runs `lint-staged` + `tsc --noEmit` before every commit. No broken code gets committed.

### TypeScript

Strict mode enabled with path aliases (`@/`, `@components/`, `@screens/`, etc.).

---

## 📦 Key Dependencies

| Package | Version | Purpose |
|---|---|---|
| `expo` | ~50.0.0 | Managed workflow runtime |
| `react-native` | 0.73.x | Core framework |
| `@react-navigation/native` | ^6.x | Navigation primitives |
| `@react-navigation/bottom-tabs` | ^6.x | Tab navigator |
| `@react-navigation/native-stack` | ^6.x | Stack navigator |
| `@react-native-async-storage/async-storage` | 1.21.x | Local persistence |
| `typescript` | ^5.3 | Type safety |

---

## 🗓️ Development Phases

| Phase | Status | Description |
|---|---|---|
| **Phase 1** | ✅ Current | Foundation, navigation, theming, folder structure |
| Phase 2 | 🔜 | Trip CRUD — create, list, and view trips |
| Phase 3 | 🔜 | Expense tracking — add and categorize expenses |
| Phase 4 | 🔜 | Smart splitting — equal, exact, percentage, shares |
| Phase 5 | 🔜 | Settlement flow — mark debts as paid |
| Phase 6 | 🔜 | Multi-currency support |
| Phase 7 | 🔜 | Export & sharing — PDF, CSV, share sheets |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feat/my-feature`
5. Open a Pull Request

All commits must pass the pre-commit hooks (lint + type-check).

---

## 📄 License

MIT © TripSplit Contributors
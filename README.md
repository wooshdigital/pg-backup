# ✈️ TripSplit

> Split expenses, not friendships.

TripSplit is a mobile app for tracking shared expenses on trips. Whether you're backpacking through Europe or road-tripping across the country, TripSplit helps you record who paid what, split costs fairly, and settle up without the awkwardness.

---

## 📱 Features (Roadmap)

- [x] **Phase 1**: Foundation & Project Setup — Navigation, theming, folder structure
- [ ] **Phase 2**: Trip Management — Create, edit, and manage trips
- [ ] **Phase 3**: Expense Tracking — Add and categorize expenses
- [ ] **Phase 4**: Smart Splitting — Equal, percentage, exact, and shares-based splits
- [ ] **Phase 5**: Settlements — Calculate who owes whom and mark debts settled
- [ ] **Phase 6**: Sync & Collaboration — Real-time multi-device sync

---

## 🏗️ Architecture

```
tripsplit/
├── App.tsx                    # Root component
├── app.json                   # Expo configuration
├── babel.config.js            # Babel + module aliases
├── tsconfig.json              # TypeScript strict config
├── .eslintrc.js               # ESLint rules
├── .prettierrc                # Prettier formatting
├── .husky/                    # Git hooks
│   └── pre-commit             # Lint + type-check on commit
├── assets/                    # Static assets
│   ├── icon.png
│   └── splash.png
└── src/
    ├── components/            # Reusable UI components
    │   └── common/            # Shared primitives (Button, Card, Typography)
    ├── constants/             # App-wide constants
    │   ├── theme.ts           # Color tokens, spacing, typography
    │   └── routes.ts          # Screen route name enums + param lists
    ├── context/               # React contexts
    │   └── ThemeContext.tsx   # Light/dark theme provider + useTheme hook
    ├── hooks/                 # Custom React hooks
    │   └── useAsyncStorage.ts # Typed AsyncStorage hook
    ├── navigation/            # React Navigation setup
    │   ├── RootNavigator.tsx  # Bottom tab navigator
    │   └── TripStackNavigator.tsx # Trip-related stack
    ├── screens/               # Screen components
    │   ├── HomeScreen.tsx
    │   ├── TripsScreen.tsx
    │   └── SettingsScreen.tsx
    ├── types/                 # TypeScript interfaces
    │   └── index.ts           # Trip, Expense, Participant, Split, etc.
    └── utils/                 # Pure utility functions
        ├── currency.ts        # Currency formatting
        ├── date.ts            # Date formatting utilities
        └── id.ts              # ID generation helpers
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Expo CLI](https://expo.dev/) (`npm install -g expo-cli`)
- [Expo Go](https://expo.dev/client) app on your phone (for quick testing)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/tripsplit.git
cd tripsplit

# Install dependencies
npm install

# Set up Husky hooks
npm run prepare
```

### Running the App

```bash
# Start the Expo dev server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run in web browser
npm run web
```

---

## 🎨 Design System

### Color Tokens

The app uses semantic color tokens that automatically adapt to light and dark mode:

| Token | Light | Dark |
|-------|-------|------|
| `background.primary` | `#FFFFFF` | `#171717` |
| `surface.primary` | `#FFFFFF` | `#262626` |
| `text.primary` | `#171717` | `#FAFAFA` |
| `brand.primary` | `#6C63FF` | `#8077FF` |

### Theme Preference

Users can choose between:
- **Light** — Always light mode
- **Dark** — Always dark mode
- **System** — Follows the device setting (default)

Theme preference is persisted via AsyncStorage.

### Path Aliases

TypeScript path aliases are configured for clean imports:

```typescript
import { HomeScreen } from '@screens/HomeScreen';
import { useTheme } from '@context/ThemeContext';
import { Trip } from '@types/index';
import { formatCurrency } from '@utils/currency';
```

---

## 🧱 Core Domain Types

```typescript
// A trip groups participants and expenses
interface Trip {
  id: TripId;
  name: string;
  currency: CurrencyCode;
  participants: Participant[];
  expenses: Expense[];
  status: 'planning' | 'active' | 'completed' | 'archived';
}

// An expense records who paid and how much
interface Expense {
  id: ExpenseId;
  tripId: string;
  title: string;
  amount: number; // minor units (e.g. cents)
  currency: CurrencyCode;
  paidBy: ParticipantId;
  split: Split;
}

// A split defines how an expense is divided
interface Split {
  method: 'equal' | 'exact' | 'percentage' | 'shares';
  shares: SplitShare[];
}
```

---

## 🛠️ Development

### Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start Expo dev server |
| `npm run lint` | Run ESLint with auto-fix |
| `npm run lint:check` | Run ESLint without auto-fix |
| `npm run type-check` | Run TypeScript type checker |
| `npm run format` | Format code with Prettier |
| `npm test` | Run Jest tests |

### Code Quality

- **ESLint** — TypeScript + React Native rules
- **Prettier** — Consistent code formatting
- **Husky** — Pre-commit hooks run lint + type-check automatically
- **TypeScript** — Strict mode enabled

### Commit Convention

Pre-commit hooks automatically:
1. Run ESLint with auto-fix on staged `.ts`/`.tsx` files
2. Format with Prettier
3. Run TypeScript type-check

---

## 📦 Key Dependencies

| Package | Purpose |
|---------|---------|
| `expo` | Managed React Native workflow |
| `@react-navigation/native` | Navigation container |
| `@react-navigation/bottom-tabs` | Tab bar navigation |
| `@react-navigation/stack` | Stack navigation |
| `@react-native-async-storage/async-storage` | Local persistence |
| `react-native-reanimated` | Animations |
| `react-native-gesture-handler` | Touch handling |

---

## 📄 License

MIT © TripSplit Contributors
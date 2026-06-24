# SplitMate ✈️

> Split travel expenses with friends, stress-free.

SplitMate is a React Native (Expo) app that helps groups of friends track and settle shared expenses during trips and events. Built with a focus on offline-first UX, multi-currency support, and clean architecture.

---

## 📐 Architecture

```
splitmate/
├── App.tsx                  # Root component: ThemeProvider + NavigationContainer
├── app.json                 # Expo app metadata
├── babel.config.js          # Babel config with path aliases
├── tsconfig.json            # Strict TypeScript + path aliases
├── .eslintrc.js             # ESLint rules
├── .prettierrc              # Prettier config
├── .husky/pre-commit        # Pre-commit hooks
└── src/
    ├── types/               # Core domain TypeScript interfaces
    │   └── index.ts         # Trip, Participant, Expense, Split, Settlement, ...
    ├── constants/           # App-wide constants
    │   ├── theme.ts         # Color tokens, typography, spacing, radii, shadows
    │   └── routes.ts        # Route name enums + ParamList types
    ├── context/             # React Context providers
    │   └── ThemeContext.tsx  # Light/dark theme with AsyncStorage persistence
    ├── navigation/          # React Navigation setup
    │   ├── RootNavigator.tsx     # Bottom tab navigator
    │   └── TripStackNavigator.tsx # Stack navigator for trip screens
    ├── screens/             # Top-level screen components
    │   ├── HomeScreen.tsx
    │   ├── TripsScreen.tsx
    │   └── SettingsScreen.tsx
    ├── components/          # Reusable UI components
    │   └── common/
    │       ├── Button.tsx     # Themed button (5 variants, 3 sizes)
    │       ├── Card.tsx       # Card container (elevated, outlined, filled)
    │       └── Typography.tsx # Display, Heading, Body, Caption, Label
    ├── hooks/               # Custom React hooks
    │   └── useAsyncStorage.ts  # Generic typed AsyncStorage hook
    └── utils/               # Pure utility functions
        ├── currency.ts      # Money formatting, conversion helpers
        ├── date.ts          # Date formatting and relative time
        ├── id.ts            # ID generation utilities
        ├── aria.ts          # Accessibility label helpers
        ├── classNames.ts    # cn() utility (web/cross-platform)
        └── keys.ts          # AsyncStorage key constants
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9 or Yarn ≥ 1.22
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (macOS) or Android Emulator

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/splitmate.git
cd splitmate

# Install dependencies
npm install

# Start Expo dev server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Environment Setup

```bash
# Install Husky pre-commit hooks
npm run prepare

# Verify type checking
npm run type-check

# Run linter
npm run lint

# Auto-fix lint issues
npm run lint:fix

# Format code
npm run format
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Expo](https://expo.dev/) (managed workflow) |
| Language | TypeScript (strict mode) |
| Navigation | [React Navigation v6](https://reactnavigation.org/) (Stack + Bottom Tabs) |
| Storage | [@react-native-async-storage/async-storage](https://github.com/react-native-async-storage/async-storage) |
| Theming | Custom ThemeContext with light/dark tokens |
| Linting | ESLint + @typescript-eslint + react-native plugins |
| Formatting | Prettier |
| Pre-commit | Husky + lint-staged |

---

## 📋 Domain Model

```
Trip
├── id, name, description, destination
├── currency: CurrencyCode
├── status: planning | active | completed | archived
├── startDate?, endDate?
├── participants: Participant[]
└── expenseIds: string[]

Participant
├── id, name, email?, avatarUrl?
└── createdAt

Expense
├── id, tripId, title, description?
├── amount: Money { amount: number, currency: CurrencyCode }
├── category: food | transport | accommodation | ...
├── paidBy: participantId
├── splitId: string
└── date, createdAt, updatedAt

Split
├── id, expenseId
├── method: equal | exact | percentage | shares
└── shares: SplitShare[]
    ├── participantId
    ├── amount (smallest unit)
    ├── percentage?
    └── shares?

Settlement
├── id, tripId
├── fromParticipantId → toParticipantId
├── amount: Money
└── settled: boolean
```

---

## 🗺️ Development Phases

| Phase | Status | Description |
|---|---|---|
| **Phase 1** | ✅ Complete | Foundation: Navigation, theming, folder structure, TypeScript interfaces |
| **Phase 2** | 🔄 Planned | Trip CRUD: Create, list, and view trips with AsyncStorage persistence |
| **Phase 3** | 🔄 Planned | Expense tracking: Add/edit expenses, split calculations |
| **Phase 4** | 🔄 Planned | Settlement view: Who owes whom, mark as paid |
| **Phase 5** | 🔄 Planned | Polish: Animations, export, onboarding flow |

---

## 🧑‍💻 Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes (Husky will run lint + type-check)
4. Push and open a pull request

---

## 📄 License

MIT © SplitMate Contributors
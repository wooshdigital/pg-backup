# SplitWise Travel ✈️💰

> Split travel expenses effortlessly with friends and family.

A mobile app built with React Native (Expo) that helps travelers track, split, and settle shared expenses across any currency.

---

## 📱 Features (Planned)

- **Trip Management** — Create and manage trips with multiple participants
- **Expense Tracking** — Log expenses in any currency with automatic conversion
- **Flexible Splits** — Equal, exact, percentage, or share-based splits
- **Balance Calculations** — Real-time per-person balance tracking
- **Settlement Suggestions** — Minimized debt settlement recommendations
- **Offline-First** — Works without internet, syncs when connected
- **Dark Mode** — Full light/dark theme support

---

## 🏗️ Architecture

```
splitwise-travel/
├── App.tsx                    # Root component
├── app.json                   # Expo configuration
├── src/
│   ├── types/
│   │   └── index.ts           # Core TypeScript interfaces
│   ├── constants/
│   │   ├── theme.ts           # Design tokens (colors, spacing, etc.)
│   │   └── routes.ts          # Route name enums & param lists
│   ├── context/
│   │   └── ThemeContext.tsx   # Light/dark theme provider
│   ├── navigation/
│   │   ├── RootNavigator.tsx  # Bottom tab navigator
│   │   └── TripStackNavigator.tsx
│   ├── screens/
│   │   ├── HomeScreen.tsx
│   │   ├── TripsScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── components/
│   │   └── common/
│   │       ├── Card.tsx
│   │       ├── Button.tsx
│   │       └── Typography.tsx
│   ├── hooks/
│   │   └── useAsyncStorage.ts
│   └── utils/
│       ├── currency.ts
│       ├── date.ts
│       └── id.ts
```

### Data Flow

```
AsyncStorage (persistence)
       ↕
  React Context (state)
       ↕
   Screens / Hooks
       ↕
  UI Components
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** or **yarn**
- **Expo CLI**: `npm install -g expo-cli`
- **Expo Go** app on your iOS/Android device, or an emulator

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/yourorg/splitwise-travel.git
cd splitwise-travel

# 2. Install dependencies
npm install

# 3. Install Husky hooks
npm run prepare

# 4. Start the development server
npm start
```

### Running on a Device / Emulator

```bash
# iOS Simulator
npm run ios

# Android Emulator
npm run android

# Web (limited support)
npm run web
```

---

## 🛠️ Development

### Code Quality

```bash
# Lint (zero warnings policy)
npm run lint

# Auto-fix lint issues
npm run lint:fix

# Format with Prettier
npm run format

# TypeScript type check
npm run type-check
```

### Pre-commit Hooks

Husky runs automatically before each commit:
1. `lint-staged` — lints and formats changed files
2. `tsc --noEmit` — full TypeScript type check

---

## 📐 Design System

### Theme Tokens

| Token Category | Description |
|---|---|
| `colors` | Brand, semantic, and neutral color palette |
| `fontSizes` | `xs` (11) → `5xl` (40) |
| `fontWeights` | `regular` → `extraBold` |
| `spacing` | 4px base unit scale |
| `borderRadius` | `xs` (2) → `full` (9999) |
| `shadows` | `none` → `xl` |

### Color Palette

| Name | Light | Dark |
|---|---|---|
| Primary | `#6C63FF` | `#8B6BFF` |
| Accent | `#38B2AC` | `#4FD1C5` |
| Background | `#F9FAFB` | `#111827` |
| Surface | `#FFFFFF` | `#1F2937` |

---

## 🗺️ Roadmap

### Phase 1 ✅ — Foundation & Project Setup
- [x] Expo project with TypeScript
- [x] React Navigation v6 (Stack + Bottom Tabs)
- [x] Global ThemeContext with light/dark palette
- [x] Core TypeScript interfaces
- [x] ESLint + Prettier + Husky
- [x] Component library foundation

### Phase 2 — Core Expense Features
- [ ] Trip CRUD (create, read, update, delete)
- [ ] Participant management
- [ ] Expense creation with split logic
- [ ] AsyncStorage persistence layer

### Phase 3 — Balance & Settlement
- [ ] Balance calculation engine
- [ ] Settlement suggestions
- [ ] Expense history & filtering

### Phase 4 — Polish & Export
- [ ] Data export (CSV/PDF)
- [ ] Currency conversion API
- [ ] Onboarding flow
- [ ] Animations & micro-interactions

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes (pre-commit hooks will run automatically)
4. Push and open a pull request

---

## 📄 License

MIT © Your Company
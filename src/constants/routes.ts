// ─── Root Tab Routes ─────────────────────────────────────────────────────────

export enum RootTab {
  Home = 'Home',
  Trips = 'Trips',
  Settings = 'Settings',
}

// ─── Trip Stack Routes ────────────────────────────────────────────────────────

export enum TripStack {
  TripsList = 'TripsList',
  TripDetail = 'TripDetail',
  AddExpense = 'AddExpense',
  ExpenseDetail = 'ExpenseDetail',
}

// ─── Combined Route Names ─────────────────────────────────────────────────────

export const Routes = {
  ...RootTab,
  ...TripStack,
} as const;

export type RouteName = (typeof Routes)[keyof typeof Routes];
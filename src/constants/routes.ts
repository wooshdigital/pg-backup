// ─── Root Tab Routes ──────────────────────────────────────────────────────────

export enum RootRoutes {
  Home = 'Home',
  Trips = 'Trips',
  Settings = 'Settings',
}

// ─── Trip Stack Routes ────────────────────────────────────────────────────────

export enum TripRoutes {
  TripsList = 'TripsList',
  TripDetail = 'TripDetail',
  AddExpense = 'AddExpense',
  ExpenseDetail = 'ExpenseDetail',
  AddParticipant = 'AddParticipant',
}

// ─── All Routes (union for convenience) ──────────────────────────────────────

export const Routes = {
  ...RootRoutes,
  ...TripRoutes,
} as const;

export type RouteNames = (typeof Routes)[keyof typeof Routes];
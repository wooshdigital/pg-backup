// ─── Root Navigator Routes ────────────────────────────────────────────────────

export enum RootRoutes {
  HOME = 'Home',
  TRIPS = 'Trips',
  SETTINGS = 'Settings',
}

// ─── Trip Stack Routes ────────────────────────────────────────────────────────

export enum TripRoutes {
  TRIPS_LIST = 'TripsList',
  TRIP_DETAIL = 'TripDetail',
  TRIP_CREATE = 'TripCreate',
  TRIP_EDIT = 'TripEdit',
  EXPENSE_DETAIL = 'ExpenseDetail',
  EXPENSE_CREATE = 'ExpenseCreate',
  EXPENSE_EDIT = 'ExpenseEdit',
  PARTICIPANTS = 'Participants',
  SETTLEMENTS = 'Settlements',
}

// ─── Settings Stack Routes ────────────────────────────────────────────────────

export enum SettingsRoutes {
  SETTINGS_HOME = 'SettingsHome',
  CURRENCY = 'Currency',
  APPEARANCE = 'Appearance',
  ABOUT = 'About',
}

// ─── Route Params ─────────────────────────────────────────────────────────────

export type RootTabParamList = {
  [RootRoutes.HOME]: undefined;
  [RootRoutes.TRIPS]: undefined;
  [RootRoutes.SETTINGS]: undefined;
};

export type TripStackParamList = {
  [TripRoutes.TRIPS_LIST]: undefined;
  [TripRoutes.TRIP_DETAIL]: { tripId: string };
  [TripRoutes.TRIP_CREATE]: undefined;
  [TripRoutes.TRIP_EDIT]: { tripId: string };
  [TripRoutes.EXPENSE_DETAIL]: { expenseId: string; tripId: string };
  [TripRoutes.EXPENSE_CREATE]: { tripId: string };
  [TripRoutes.EXPENSE_EDIT]: { expenseId: string; tripId: string };
  [TripRoutes.PARTICIPANTS]: { tripId: string };
  [TripRoutes.SETTLEMENTS]: { tripId: string };
};

export type SettingsStackParamList = {
  [SettingsRoutes.SETTINGS_HOME]: undefined;
  [SettingsRoutes.CURRENCY]: undefined;
  [SettingsRoutes.APPEARANCE]: undefined;
  [SettingsRoutes.ABOUT]: undefined;
};
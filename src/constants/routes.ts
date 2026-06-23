// ─── Root Tab Routes ─────────────────────────────────────────────────────────

export enum RootRoute {
  HOME = 'Home',
  TRIPS = 'Trips',
  SETTINGS = 'Settings',
}

// ─── Trip Stack Routes ────────────────────────────────────────────────────────

export enum TripRoute {
  TRIPS_LIST = 'TripsList',
  TRIP_DETAIL = 'TripDetail',
  TRIP_CREATE = 'TripCreate',
  TRIP_EDIT = 'TripEdit',
}

// ─── Expense Stack Routes ─────────────────────────────────────────────────────

export enum ExpenseRoute {
  EXPENSE_CREATE = 'ExpenseCreate',
  EXPENSE_DETAIL = 'ExpenseDetail',
  EXPENSE_EDIT = 'ExpenseEdit',
}

// ─── Settings Stack Routes ────────────────────────────────────────────────────

export enum SettingsRoute {
  SETTINGS_HOME = 'SettingsHome',
  SETTINGS_PROFILE = 'SettingsProfile',
  SETTINGS_CURRENCY = 'SettingsCurrency',
  SETTINGS_THEME = 'SettingsTheme',
  SETTINGS_ABOUT = 'SettingsAbout',
}
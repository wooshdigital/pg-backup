// ─── Root Tab Routes ───────────────────────────────────────────────────────────

export enum RootTab {
  Home = 'Home',
  Trips = 'Trips',
  Settings = 'Settings',
}

// ─── Trip Stack Routes ─────────────────────────────────────────────────────────

export enum TripStack {
  TripsList = 'TripsList',
  TripDetail = 'TripDetail',
  TripCreate = 'TripCreate',
  TripEdit = 'TripEdit',
  ExpenseDetail = 'ExpenseDetail',
  ExpenseCreate = 'ExpenseCreate',
  ExpenseEdit = 'ExpenseEdit',
  ParticipantDetail = 'ParticipantDetail',
  Settlements = 'Settlements',
}

// ─── Settings Stack Routes ─────────────────────────────────────────────────────

export enum SettingsStack {
  SettingsMain = 'SettingsMain',
  CurrencyPicker = 'CurrencyPicker',
  ThemePicker = 'ThemePicker',
  About = 'About',
}

// ─── Modal Routes ──────────────────────────────────────────────────────────────

export enum ModalRoute {
  AddParticipant = 'AddParticipant',
  SplitDetail = 'SplitDetail',
}

// ─── Navigation Param Lists ────────────────────────────────────────────────────

export type RootTabParamList = {
  [RootTab.Home]: undefined;
  [RootTab.Trips]: undefined;
  [RootTab.Settings]: undefined;
};

export type TripStackParamList = {
  [TripStack.TripsList]: undefined;
  [TripStack.TripDetail]: { tripId: string };
  [TripStack.TripCreate]: undefined;
  [TripStack.TripEdit]: { tripId: string };
  [TripStack.ExpenseDetail]: { tripId: string; expenseId: string };
  [TripStack.ExpenseCreate]: { tripId: string };
  [TripStack.ExpenseEdit]: { tripId: string; expenseId: string };
  [TripStack.ParticipantDetail]: { tripId: string; participantId: string };
  [TripStack.Settlements]: { tripId: string };
};

export type SettingsStackParamList = {
  [SettingsStack.SettingsMain]: undefined;
  [SettingsStack.CurrencyPicker]: undefined;
  [SettingsStack.ThemePicker]: undefined;
  [SettingsStack.About]: undefined;
};
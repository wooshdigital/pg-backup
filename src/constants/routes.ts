// ─── Root Routes ──────────────────────────────────────────────────────────────

export enum RootRoute {
  Main = 'Main',
}

// ─── Bottom Tab Routes ────────────────────────────────────────────────────────

export enum TabRoute {
  Home = 'Home',
  Trips = 'Trips',
  Settings = 'Settings',
}

// ─── Trip Stack Routes ────────────────────────────────────────────────────────

export enum TripRoute {
  TripsList = 'TripsList',
  TripDetail = 'TripDetail',
  TripCreate = 'TripCreate',
  TripEdit = 'TripEdit',
  ExpenseDetail = 'ExpenseDetail',
  ExpenseCreate = 'ExpenseCreate',
  ExpenseEdit = 'ExpenseEdit',
  ParticipantDetail = 'ParticipantDetail',
  ParticipantAdd = 'ParticipantAdd',
  Balances = 'Balances',
  Settlement = 'Settlement',
}

// ─── Home Stack Routes ────────────────────────────────────────────────────────

export enum HomeRoute {
  HomeMain = 'HomeMain',
  Notifications = 'Notifications',
}

// ─── Settings Stack Routes ────────────────────────────────────────────────────

export enum SettingsRoute {
  SettingsMain = 'SettingsMain',
  Profile = 'Profile',
  Appearance = 'Appearance',
  Currency = 'Currency',
  About = 'About',
}

// ─── Navigation Param Lists ───────────────────────────────────────────────────

export type RootTabParamList = {
  [TabRoute.Home]: undefined;
  [TabRoute.Trips]: undefined;
  [TabRoute.Settings]: undefined;
};

export type TripStackParamList = {
  [TripRoute.TripsList]: undefined;
  [TripRoute.TripDetail]: { tripId: string };
  [TripRoute.TripCreate]: undefined;
  [TripRoute.TripEdit]: { tripId: string };
  [TripRoute.ExpenseDetail]: { tripId: string; expenseId: string };
  [TripRoute.ExpenseCreate]: { tripId: string };
  [TripRoute.ExpenseEdit]: { tripId: string; expenseId: string };
  [TripRoute.ParticipantDetail]: { tripId: string; participantId: string };
  [TripRoute.ParticipantAdd]: { tripId: string };
  [TripRoute.Balances]: { tripId: string };
  [TripRoute.Settlement]: { tripId: string };
};

export type HomeStackParamList = {
  [HomeRoute.HomeMain]: undefined;
  [HomeRoute.Notifications]: undefined;
};

export type SettingsStackParamList = {
  [SettingsRoute.SettingsMain]: undefined;
  [SettingsRoute.Profile]: undefined;
  [SettingsRoute.Appearance]: undefined;
  [SettingsRoute.Currency]: undefined;
  [SettingsRoute.About]: undefined;
};
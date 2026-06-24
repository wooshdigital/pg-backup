// ─── Root Tab Routes ─────────────────────────────────────────────────────────

export enum RootRoute {
  Home = 'Home',
  Trips = 'Trips',
  Settings = 'Settings',
}

// ─── Trip Stack Routes ────────────────────────────────────────────────────────

export enum TripRoute {
  TripsList = 'TripsList',
  TripDetail = 'TripDetail',
  AddExpense = 'AddExpense',
  ExpenseDetail = 'ExpenseDetail',
  AddParticipant = 'AddParticipant',
  Settlements = 'Settlements',
  EditTrip = 'EditTrip',
  CreateTrip = 'CreateTrip',
}

// ─── Settings Stack Routes ────────────────────────────────────────────────────

export enum SettingsRoute {
  SettingsMain = 'SettingsMain',
  CurrencyPicker = 'CurrencyPicker',
  ThemeSettings = 'ThemeSettings',
  ProfileSettings = 'ProfileSettings',
  About = 'About',
}

// ─── Modal Routes ─────────────────────────────────────────────────────────────

export enum ModalRoute {
  ConfirmDialog = 'ConfirmDialog',
  ImagePicker = 'ImagePicker',
  DatePicker = 'DatePicker',
  ParticipantPicker = 'ParticipantPicker',
}
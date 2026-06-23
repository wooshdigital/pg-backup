// ─── Currency ────────────────────────────────────────────────────────────────

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF' | 'CNY' | 'INR' | string;

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
  decimalPlaces: number;
}

// ─── Money ───────────────────────────────────────────────────────────────────

export interface Money {
  amount: number; // stored in smallest unit (cents)
  currency: CurrencyCode;
}

// ─── Participant ──────────────────────────────────────────────────────────────

export interface Participant {
  id: string;
  name: string;
  email?: string;
  avatarUri?: string;
  createdAt: string; // ISO 8601
}

// ─── Split ───────────────────────────────────────────────────────────────────

export type SplitMethod = 'equal' | 'exact' | 'percentage' | 'shares';

export interface SplitShare {
  participantId: string;
  /** Amount owed in smallest currency unit */
  amount: number;
  /** Used when splitMethod is 'percentage' */
  percentage?: number;
  /** Used when splitMethod is 'shares' */
  shares?: number;
  /** Whether this participant has settled their share */
  settled: boolean;
}

export interface Split {
  id: string;
  expenseId: string;
  method: SplitMethod;
  shares: SplitShare[];
}

// ─── Expense ─────────────────────────────────────────────────────────────────

export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'accommodation'
  | 'entertainment'
  | 'shopping'
  | 'health'
  | 'utilities'
  | 'other';

export interface Expense {
  id: string;
  tripId: string;
  title: string;
  description?: string;
  amount: number; // in smallest currency unit
  currency: CurrencyCode;
  category: ExpenseCategory;
  paidBy: string; // participantId
  paidAt: string; // ISO 8601
  split: Split;
  receiptUri?: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// ─── Trip ────────────────────────────────────────────────────────────────────

export type TripStatus = 'planning' | 'active' | 'completed' | 'archived';

export interface Trip {
  id: string;
  name: string;
  description?: string;
  destination?: string;
  coverImageUri?: string;
  currency: CurrencyCode;
  status: TripStatus;
  participants: Participant[];
  expenses: Expense[];
  startDate?: string; // ISO 8601
  endDate?: string; // ISO 8601
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  createdBy: string; // participantId
}

// ─── Navigation Params ───────────────────────────────────────────────────────

export type RootTabParamList = {
  Home: undefined;
  Trips: undefined;
  Settings: undefined;
};

export type TripStackParamList = {
  TripsList: undefined;
  TripDetail: { tripId: string };
  TripCreate: undefined;
  ExpenseCreate: { tripId: string };
  ExpenseDetail: { tripId: string; expenseId: string };
};

// ─── Theme ───────────────────────────────────────────────────────────────────

export type ColorScheme = 'light' | 'dark';

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  borderLight: string;
  text: string;
  textSecondary: string;
  textDisabled: string;
  textInverse: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  shadow: string;
}

export interface Theme {
  colors: ThemeColors;
  colorScheme: ColorScheme;
}
// ─── Currency ────────────────────────────────────────────────────────────────

export type CurrencyCode =
  | 'USD'
  | 'EUR'
  | 'GBP'
  | 'JPY'
  | 'CAD'
  | 'AUD'
  | 'CHF'
  | 'CNY'
  | 'INR'
  | 'MXN'
  | 'BRL'
  | 'KRW'
  | 'SGD'
  | 'HKD'
  | 'SEK'
  | 'NOK'
  | 'DKK'
  | 'NZD'
  | 'ZAR'
  | 'THB';

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
  decimalPlaces: number;
}

// ─── Participant ─────────────────────────────────────────────────────────────

export interface Participant {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  /** ISO 8601 date string */
  createdAt: string;
  updatedAt: string;
}

// ─── Split ───────────────────────────────────────────────────────────────────

export type SplitMethod = 'equal' | 'exact' | 'percentage' | 'shares';

export interface SplitShare {
  participantId: string;
  /** Amount in the expense's currency (minor units / cents) */
  amount: number;
  /** Used when splitMethod is 'percentage' */
  percentage?: number;
  /** Used when splitMethod is 'shares' */
  shares?: number;
}

export interface Split {
  id: string;
  expenseId: string;
  method: SplitMethod;
  shares: SplitShare[];
  /** ISO 8601 date string */
  createdAt: string;
  updatedAt: string;
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
  /** Amount in minor units (e.g. cents for USD) */
  amount: number;
  currency: CurrencyCode;
  category: ExpenseCategory;
  /** ID of the participant who paid */
  paidBy: string;
  /** IDs of participants who owe */
  participants: string[];
  split: Split;
  /** ISO 8601 date string */
  date: string;
  /** ISO 8601 date string */
  createdAt: string;
  updatedAt: string;
  /** Optional receipt image URI */
  receiptUri?: string;
}

// ─── Trip ────────────────────────────────────────────────────────────────────

export type TripStatus = 'planning' | 'active' | 'completed' | 'archived';

export interface Trip {
  id: string;
  name: string;
  description?: string;
  destination?: string;
  /** ISO 8601 date string */
  startDate?: string;
  /** ISO 8601 date string */
  endDate?: string;
  coverImageUri?: string;
  currency: CurrencyCode;
  status: TripStatus;
  participants: Participant[];
  expenses: Expense[];
  /** ISO 8601 date string */
  createdAt: string;
  updatedAt: string;
}

// ─── Balance / Settlement ─────────────────────────────────────────────────────

export interface Balance {
  participantId: string;
  /** Positive = owed money, Negative = owes money */
  amount: number;
  currency: CurrencyCode;
}

export interface Settlement {
  id: string;
  tripId: string;
  fromParticipantId: string;
  toParticipantId: string;
  amount: number;
  currency: CurrencyCode;
  settled: boolean;
  /** ISO 8601 date string */
  settledAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Storage ─────────────────────────────────────────────────────────────────

export interface AppStorage {
  trips: Trip[];
  lastUpdated: string;
  version: number;
}

// ─── Navigation ──────────────────────────────────────────────────────────────

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
  ExpenseDetail: { expenseId: string; tripId: string };
};
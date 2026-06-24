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
  | 'KRW';

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
  decimalPlaces: number;
}

// ─── Participant ──────────────────────────────────────────────────────────────

export interface Participant {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  /** ISO 8601 date string */
  createdAt: string;
}

// ─── Split ────────────────────────────────────────────────────────────────────

export type SplitMethod = 'equal' | 'exact' | 'percentage' | 'shares';

export interface SplitShare {
  participantId: string;
  /** Amount owed in smallest currency unit (e.g. cents) */
  amountOwed: number;
  /** Percentage of the total (0–100), used when method is 'percentage' */
  percentage?: number;
  /** Number of shares, used when method is 'shares' */
  shares?: number;
  settled: boolean;
}

export interface Split {
  id: string;
  expenseId: string;
  method: SplitMethod;
  shares: SplitShare[];
}

// ─── Expense ──────────────────────────────────────────────────────────────────

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
  /** Amount in smallest currency unit (e.g. cents) */
  amount: number;
  currencyCode: CurrencyCode;
  category: ExpenseCategory;
  /** ID of the participant who paid */
  paidById: string;
  split: Split;
  receiptUrl?: string;
  /** ISO 8601 date string */
  date: string;
  /** ISO 8601 date string */
  createdAt: string;
  /** ISO 8601 date string */
  updatedAt: string;
}

// ─── Trip ─────────────────────────────────────────────────────────────────────

export type TripStatus = 'planning' | 'active' | 'completed' | 'archived';

export interface Trip {
  id: string;
  name: string;
  description?: string;
  destination?: string;
  coverImageUrl?: string;
  /** ISO 8601 date string */
  startDate?: string;
  /** ISO 8601 date string */
  endDate?: string;
  status: TripStatus;
  baseCurrencyCode: CurrencyCode;
  participants: Participant[];
  expenses: Expense[];
  /** ISO 8601 date string */
  createdAt: string;
  /** ISO 8601 date string */
  updatedAt: string;
}

// ─── Balance ─────────────────────────────────────────────────────────────────

export interface Balance {
  participantId: string;
  /** Positive = owed money, negative = owes money */
  netAmount: number;
  currencyCode: CurrencyCode;
}

export interface Settlement {
  fromParticipantId: string;
  toParticipantId: string;
  amount: number;
  currencyCode: CurrencyCode;
}

// ─── Navigation Param Lists ───────────────────────────────────────────────────

export type RootTabParamList = {
  Home: undefined;
  Trips: undefined;
  Settings: undefined;
};

export type TripStackParamList = {
  TripsList: undefined;
  TripDetail: { tripId: string };
  AddExpense: { tripId: string };
  ExpenseDetail: { expenseId: string; tripId: string };
};
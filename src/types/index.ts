// ─── Currency ───────────────────────────────────────────────────────────────

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
  | 'NOK'
  | 'SEK'
  | 'DKK'
  | 'NZD'
  | 'ZAR'
  | 'THB';

export interface Currency {
  code: CurrencyCode;
  name: string;
  symbol: string;
  decimalPlaces: number;
}

// ─── Participant ─────────────────────────────────────────────────────────────

export interface Participant {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  /** ISO 8601 timestamp */
  createdAt: string;
}

// ─── Split ───────────────────────────────────────────────────────────────────

export type SplitMethod = 'equal' | 'exact' | 'percentage' | 'shares';

export interface SplitShare {
  participantId: string;
  /** Amount owed in the trip's base currency */
  amount: number;
  /** Used when splitMethod === 'percentage' */
  percentage?: number;
  /** Used when splitMethod === 'shares' */
  shares?: number;
  /** Whether this participant has settled their share */
  isPaid: boolean;
}

export interface Split {
  id: string;
  expenseId: string;
  method: SplitMethod;
  shares: SplitShare[];
}

// ─── Expense ─────────────────────────────────────────────────────────────────

export type ExpenseCategory =
  | 'accommodation'
  | 'food'
  | 'transport'
  | 'activities'
  | 'shopping'
  | 'health'
  | 'other';

export interface Expense {
  id: string;
  tripId: string;
  title: string;
  description?: string;
  amount: number;
  currency: CurrencyCode;
  /** Converted amount in trip's base currency */
  amountInBaseCurrency: number;
  category: ExpenseCategory;
  /** Participant ID of the person who paid */
  paidById: string;
  split: Split;
  receiptUrl?: string;
  /** ISO 8601 date string (e.g. "2026-06-23") */
  date: string;
  /** ISO 8601 timestamp */
  createdAt: string;
  /** ISO 8601 timestamp */
  updatedAt: string;
}

// ─── Trip ────────────────────────────────────────────────────────────────────

export type TripStatus = 'planning' | 'active' | 'completed' | 'archived';

export interface Trip {
  id: string;
  name: string;
  description?: string;
  destination: string;
  coverImageUrl?: string;
  baseCurrency: CurrencyCode;
  status: TripStatus;
  participants: Participant[];
  expenses: Expense[];
  /** ISO 8601 date string (e.g. "2026-06-23") */
  startDate?: string;
  /** ISO 8601 date string */
  endDate?: string;
  /** ISO 8601 timestamp */
  createdAt: string;
  /** ISO 8601 timestamp */
  updatedAt: string;
}

// ─── Balance / Settlement ────────────────────────────────────────────────────

export interface Balance {
  participantId: string;
  amount: number; // positive = owed money, negative = owes money
  currency: CurrencyCode;
}

export interface Settlement {
  fromParticipantId: string;
  toParticipantId: string;
  amount: number;
  currency: CurrencyCode;
}

// ─── App State ───────────────────────────────────────────────────────────────

export interface AppState {
  trips: Trip[];
  currentUserId: string | null;
  lastSyncedAt: string | null;
}
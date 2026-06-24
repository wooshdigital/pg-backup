// ─── Currency ────────────────────────────────────────────────────────────────

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF' | 'CNY' | string;

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
  avatarUrl?: string;
  createdAt: string; // ISO 8601
}

// ─── Split ────────────────────────────────────────────────────────────────────

export type SplitMethod = 'equal' | 'exact' | 'percentage' | 'shares';

export interface SplitShare {
  participantId: string;
  /** Exact amount in smallest currency unit */
  amount: number;
  /** Percentage (0–100) used when splitMethod = 'percentage' */
  percentage?: number;
  /** Number of shares when splitMethod = 'shares' */
  shares?: number;
}

export interface Split {
  id: string;
  expenseId: string;
  method: SplitMethod;
  shares: SplitShare[];
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
  amount: Money;
  category: ExpenseCategory;
  paidBy: string; // participantId
  splitId: string;
  receiptUrl?: string;
  date: string; // ISO 8601
  createdAt: string;
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
  currency: CurrencyCode;
  status: TripStatus;
  startDate?: string; // ISO 8601
  endDate?: string; // ISO 8601
  participants: Participant[];
  expenseIds: string[];
  createdBy: string; // participantId
  createdAt: string;
  updatedAt: string;
}

// ─── Settlement ───────────────────────────────────────────────────────────────

export interface Settlement {
  id: string;
  tripId: string;
  fromParticipantId: string;
  toParticipantId: string;
  amount: Money;
  settled: boolean;
  settledAt?: string;
  createdAt: string;
}

// ─── App State ────────────────────────────────────────────────────────────────

export interface AppState {
  trips: Trip[];
  expenses: Record<string, Expense>;
  splits: Record<string, Split>;
  participants: Record<string, Participant>;
  settlements: Settlement[];
}
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
  | 'NOK'
  | 'SEK'
  | 'DKK'
  | 'NZD'
  | 'ZAR'
  | 'THB';

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
  decimals: number;
}

// ─── Participant ──────────────────────────────────────────────────────────────

export interface Participant {
  id: string;
  name: string;
  email?: string;
  avatarUrl?: string;
  /** Whether this participant is the local device user */
  isCurrentUser: boolean;
  createdAt: string; // ISO 8601
}

// ─── Split ────────────────────────────────────────────────────────────────────

export type SplitMethod = 'equal' | 'exact' | 'percentage' | 'shares';

export interface SplitShare {
  participantId: string;
  /** Raw value: amount (exact), percentage (percentage), or share count (shares) */
  value: number;
  /** Resolved amount in the trip's base currency */
  resolvedAmount: number;
}

export interface Split {
  id: string;
  expenseId: string;
  method: SplitMethod;
  shares: SplitShare[];
}

// ─── Expense ──────────────────────────────────────────────────────────────────

export type ExpenseCategory =
  | 'accommodation'
  | 'food'
  | 'transport'
  | 'activities'
  | 'shopping'
  | 'health'
  | 'utilities'
  | 'entertainment'
  | 'other';

export interface Expense {
  id: string;
  tripId: string;
  title: string;
  description?: string;
  amount: number;
  currency: CurrencyCode;
  /** Amount converted to the trip's base currency */
  amountInBaseCurrency: number;
  category: ExpenseCategory;
  /** Participant ID of the person who paid */
  paidById: string;
  /** All participants who owe for this expense */
  participantIds: string[];
  split: Split;
  receiptUrl?: string;
  date: string; // ISO 8601
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// ─── Balance ──────────────────────────────────────────────────────────────────

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

// ─── Trip ─────────────────────────────────────────────────────────────────────

export type TripStatus = 'planning' | 'active' | 'completed' | 'archived';

export interface Trip {
  id: string;
  name: string;
  description?: string;
  destination?: string;
  coverImageUrl?: string;
  baseCurrency: CurrencyCode;
  status: TripStatus;
  participants: Participant[];
  expenses: Expense[];
  balances: Balance[];
  suggestedSettlements: Settlement[];
  startDate?: string; // ISO 8601
  endDate?: string; // ISO 8601
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export type RootTabParamList = {
  Home: undefined;
  Trips: undefined;
  Settings: undefined;
};

export type TripStackParamList = {
  TripsList: undefined;
  TripDetail: { tripId: string };
  AddExpense: { tripId: string };
  ExpenseDetail: { tripId: string; expenseId: string };
  AddParticipant: { tripId: string };
  Settlements: { tripId: string };
};

// ─── Storage ──────────────────────────────────────────────────────────────────

export interface AppState {
  trips: Trip[];
  currentUserId: string | null;
  settings: AppSettings;
}

export interface AppSettings {
  defaultCurrency: CurrencyCode;
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
}
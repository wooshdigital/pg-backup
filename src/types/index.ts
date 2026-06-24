// ─── Currency ──────────────────────────────────────────────────────────────────

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
  | 'SEK'
  | 'NOK'
  | 'DKK';

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  name: string;
  decimalPlaces: number;
}

// ─── Participant ───────────────────────────────────────────────────────────────

export type ParticipantId = string;

export interface Participant {
  id: ParticipantId;
  name: string;
  email?: string;
  avatarUrl?: string;
  /** ISO 8601 */
  createdAt: string;
}

// ─── Split ─────────────────────────────────────────────────────────────────────

export type SplitMethod = 'equal' | 'exact' | 'percentage' | 'shares';

export interface SplitShare {
  participantId: ParticipantId;
  /** Resolved amount in the expense's currency (minor units, e.g. cents) */
  amount: number;
  /** Used when method is 'percentage' */
  percentage?: number;
  /** Used when method is 'shares' */
  shares?: number;
}

export interface Split {
  id: string;
  expenseId: string;
  method: SplitMethod;
  shares: SplitShare[];
}

// ─── Expense ───────────────────────────────────────────────────────────────────

export type ExpenseId = string;

export type ExpenseCategory =
  | 'accommodation'
  | 'food'
  | 'transport'
  | 'activities'
  | 'shopping'
  | 'health'
  | 'communication'
  | 'other';

export interface Expense {
  id: ExpenseId;
  tripId: string;
  title: string;
  /** Amount in minor units (e.g. cents) */
  amount: number;
  currency: CurrencyCode;
  category: ExpenseCategory;
  /** Participant who paid */
  paidBy: ParticipantId;
  /** Participants involved in the expense */
  participants: ParticipantId[];
  split: Split;
  note?: string;
  receiptUrl?: string;
  /** ISO 8601 */
  date: string;
  /** ISO 8601 */
  createdAt: string;
  /** ISO 8601 */
  updatedAt: string;
}

// ─── Trip ──────────────────────────────────────────────────────────────────────

export type TripId = string;

export type TripStatus = 'planning' | 'active' | 'completed' | 'archived';

export interface Trip {
  id: TripId;
  name: string;
  description?: string;
  destination?: string;
  coverImageUrl?: string;
  currency: CurrencyCode;
  participants: Participant[];
  expenses: Expense[];
  status: TripStatus;
  /** ISO 8601 */
  startDate?: string;
  /** ISO 8601 */
  endDate?: string;
  /** ISO 8601 */
  createdAt: string;
  /** ISO 8601 */
  updatedAt: string;
}

// ─── Settlement ────────────────────────────────────────────────────────────────

export interface Settlement {
  id: string;
  tripId: TripId;
  from: ParticipantId;
  to: ParticipantId;
  /** Amount in minor units */
  amount: number;
  currency: CurrencyCode;
  settled: boolean;
  /** ISO 8601 */
  settledAt?: string;
  /** ISO 8601 */
  createdAt: string;
}

// ─── Balance ───────────────────────────────────────────────────────────────────

export interface Balance {
  participantId: ParticipantId;
  /** Positive = owed money, Negative = owes money */
  net: number;
  currency: CurrencyCode;
}

// ─── App State ─────────────────────────────────────────────────────────────────

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  defaultCurrency: CurrencyCode;
  hapticFeedback: boolean;
}

export interface AppState {
  trips: Trip[];
  settings: AppSettings;
}
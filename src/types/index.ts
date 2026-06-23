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
  | 'BRL';

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
  /** Net balance across all expenses in a trip (positive = owed to them, negative = they owe) */
  balance: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// ─── Split ────────────────────────────────────────────────────────────────────

export type SplitMethod = 'equal' | 'exact' | 'percentage' | 'shares';

export interface SplitShare {
  participantId: string;
  /** Amount this participant owes for this expense */
  amount: number;
  /** Percentage of the total (for 'percentage' split method) */
  percentage?: number;
  /** Number of shares (for 'shares' split method) */
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
  amount: number;
  currencyCode: CurrencyCode;
  category: ExpenseCategory;
  /** ID of the participant who paid */
  paidByParticipantId: string;
  split: Split;
  receiptImageUrl?: string;
  date: string; // ISO 8601
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

// ─── Trip ─────────────────────────────────────────────────────────────────────

export type TripStatus = 'planning' | 'active' | 'completed' | 'archived';

export interface Trip {
  id: string;
  name: string;
  description?: string;
  destination?: string;
  coverImageUrl?: string;
  status: TripStatus;
  defaultCurrencyCode: CurrencyCode;
  participants: Participant[];
  expenses: Expense[];
  startDate?: string; // ISO 8601
  endDate?: string; // ISO 8601
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  /** ID of the participant who created / owns this trip */
  createdByParticipantId: string;
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
};

// ─── Theme ────────────────────────────────────────────────────────────────────

export type ThemeMode = 'light' | 'dark' | 'system';

export interface AppTheme {
  mode: ThemeMode;
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    secondaryLight: string;
    secondaryDark: string;
    background: string;
    surface: string;
    surfaceVariant: string;
    error: string;
    success: string;
    warning: string;
    info: string;
    text: string;
    textSecondary: string;
    textDisabled: string;
    textInverse: string;
    border: string;
    borderLight: string;
    shadow: string;
    overlay: string;
    card: string;
  };
  typography: {
    fontFamily: {
      regular: string;
      medium: string;
      bold: string;
    };
    fontSize: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      xxl: number;
      xxxl: number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
    fontWeight: {
      regular: '400';
      medium: '500';
      semibold: '600';
      bold: '700';
    };
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    xxl: number;
    xxxl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
}

// ─── Storage ──────────────────────────────────────────────────────────────────

export interface StorageSchema {
  trips: Trip[];
  participants: Participant[];
  themeMode: ThemeMode;
  onboardingCompleted: boolean;
}

export type StorageKey = keyof StorageSchema;
export interface Split {
  participantId: string;
  amount: number;
}

export interface Participant {
  id: string;
  tripId: string;
  name: string;
  email?: string;
  avatarColor?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  tripId: string;
  description: string;
  amount: number;
  currency: string;
  paidById: string;
  splits: Split[];
  splitType?: 'equal' | 'custom';
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Trip {
  id: string;
  name: string;
  description?: string;
  currency: string;
  participants: Participant[];
  expenses: Expense[];
  createdAt: string;
  updatedAt: string;
}

export type RootStackParamList = {
  Home: undefined;
  TripsList: undefined;
  Trips: undefined;
  CreateTrip: undefined;
  TripDetail: { tripId: string };
  Expenses: { tripId: string };
  AddExpense: { tripId: string; expenseId?: string };
  ExpenseDetail: { tripId: string; expenseId: string };
  Participants: { tripId: string };
  Settings: undefined;
};
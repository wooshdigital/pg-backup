export interface Participant {
  id: string;
  name: string;
  email?: string;
  avatarColor?: string;
}

export interface Split {
  participantId: string;
  amount: number;
}

export interface Expense {
  id: string;
  tripId: string;
  title: string;
  amount: number;
  currency: string;
  date: string; // ISO date string
  payerId: string;
  splitType: 'equal' | 'custom';
  splits: Split[];
  createdAt: string;
}

export interface Trip {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  currency: string;
  participants: Participant[];
  expenses: Expense[];
  createdAt: string;
}

export type RootStackParamList = {
  Home: undefined;
  TripsList: undefined;
  Trips: undefined;
  TripDetail: { tripId: string };
  AddExpense: { tripId: string };
  ExpenseDetail: { tripId: string; expenseId: string };
  CreateTrip: undefined;
  Settings: undefined;
  Participants: { tripId: string };
};
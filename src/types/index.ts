export interface Trip {
  id: string;
  name: string;
  currency: string;
  startDate: string;
  endDate: string;
  createdAt: string;
  participantIds: string[];
  expenseIds: string[];
}

export interface Participant {
  id: string;
  name: string;
}

export interface Expense {
  id: string;
  tripId: string;
  description: string;
  amount: number;
  currency: string;
  paidBy: string;
  splitAmong: string[];
  date: string;
  createdAt: string;
}

export type RootStackParamList = {
  Home: undefined;
  TripsList: undefined;
  CreateTrip: undefined;
  TripDetail: { tripId: string };
  Settings: undefined;
};
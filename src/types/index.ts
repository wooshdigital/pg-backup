export interface Trip {
  id: string;
  name: string;
  currency: string;
  startDate: string; // ISO date string
  endDate: string;   // ISO date string
  createdAt: string; // ISO date string
  participantIds: string[];
  expenseIds: string[];
}

export interface Participant {
  id: string;
  name: string;
  email?: string;
}

export interface Expense {
  id: string;
  tripId: string;
  description: string;
  amount: number;
  currency: string;
  paidBy: string;
  splitBetween: string[];
  date: string;
  createdAt: string;
}
export interface Split {
  participantId: string;
  amount: number;
}

export interface Participant {
  id: string;
  name: string;
  email?: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  paidBy: string;
  splits: Split[];
  createdAt: string;
  updatedAt?: string;
}

export interface Trip {
  id: string;
  name: string;
  description?: string;
  currency: string;
  startDate?: string;
  endDate?: string;
  participants: Participant[];
  expenses: Expense[];
  createdAt: string;
  updatedAt?: string;
}
export interface Participant {
  id: string;
  name: string;
  email?: string;
  avatarColor?: string;
}

export interface ExpenseSplit {
  participantId: string;
  amount: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  paidById: string;
  date: string;
  splits?: ExpenseSplit[];
}

export interface Trip {
  id: string;
  name: string;
  currency: string;
  participants?: Participant[];
  expenses?: Expense[];
  createdAt?: string;
}
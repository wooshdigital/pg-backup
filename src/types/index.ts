export interface Participant {
  id: string;
  name: string;
  email?: string;
  avatarColor?: string;
}

export interface SplitEntry {
  participantId: string;
  amount: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  paidBy: string;
  splits: SplitEntry[];
  splitType: 'equal' | 'custom';
  date: string;
  category: string;
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
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
  destination?: string;
  startDate?: string;
  endDate?: string;
  currency: string;
  participants: Participant[];
  expenses: Expense[];
  createdAt: string;
}
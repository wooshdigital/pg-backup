export interface Participant {
  id: string;
  name: string;
  avatarColor: string;
  tripId: string;
}

export interface Trip {
  id: string;
  name: string;
  description?: string;
  currency: string;
  createdAt: string;
  participants: Participant[];
}

export interface Expense {
  id: string;
  tripId: string;
  description: string;
  amount: number;
  currency: string;
  paidBy: string; // participantId
  splitBetween: string[]; // participantIds
  createdAt: string;
}
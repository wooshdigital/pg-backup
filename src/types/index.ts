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
  title: string;
  amount: number;
  currency: string;
  paidBy: string; // participantId
  participants: string[]; // participantIds
  createdAt: string;
}
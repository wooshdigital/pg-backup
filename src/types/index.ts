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

export interface Currency {
  code: string;
  symbol: string;
  name: string;
  flag: string;
}
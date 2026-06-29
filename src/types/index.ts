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
  startDate?: string;
  endDate?: string;
  currency: string;
  createdAt: string;
  participants: Participant[];
}

export type RootStackParamList = {
  Home: undefined;
  Trips: undefined;
  TripsList: undefined;
  TripDetail: { tripId: string; tripName: string };
  Settings: undefined;
};

export type TripDetailTabParamList = {
  Participants: { tripId: string };
  Expenses: { tripId: string };
};
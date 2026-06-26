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
  startDate?: string;
  endDate?: string;
  createdAt: string;
  participants: Participant[];
}

export type RootStackParamList = {
  Home: undefined;
  TripsList: undefined;
  TripDetail: { tripId: string; tripName: string };
  CreateTrip: undefined;
  Settings: undefined;
};

export type TripDetailTabParamList = {
  Participants: { tripId: string };
  Expenses: { tripId: string };
};
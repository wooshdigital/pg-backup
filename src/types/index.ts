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

export type RootStackParamList = {
  Trips: undefined;
  TripDetail: { tripId: string; tripName: string };
};

export type TripDetailTabParamList = {
  Participants: { tripId: string };
  Expenses: { tripId: string };
};
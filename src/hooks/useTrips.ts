import { useCallback } from 'react';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { useTripContext } from '../context/TripContext';
import { Trip } from '../types';

interface CreateTripInput {
  name: string;
  currency: string;
  startDate: string;
  endDate: string;
}

interface UseTripsResult {
  trips: Trip[];
  loaded: boolean;
  createTrip: (input: CreateTripInput) => Trip;
  deleteTrip: (id: string) => void;
}

export function useTrips(): UseTripsResult {
  const { trips, loaded, addTrip, deleteTrip } = useTripContext();

  const createTrip = useCallback(
    (input: CreateTripInput): Trip => {
      const trip: Trip = {
        id: uuidv4(),
        name: input.name,
        currency: input.currency,
        startDate: input.startDate,
        endDate: input.endDate,
        createdAt: new Date().toISOString(),
        participantIds: [],
        expenseIds: [],
      };
      addTrip(trip);
      return trip;
    },
    [addTrip],
  );

  return { trips, loaded, createTrip, deleteTrip };
}
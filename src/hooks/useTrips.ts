import { useCallback } from 'react';
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
  isLoaded: boolean;
  createTrip: (input: CreateTripInput) => Trip;
  deleteTrip: (id: string) => void;
  getTripById: (id: string) => Trip | undefined;
}

/**
 * Convenience hook that returns the trips array and action creators.
 * All state lives in TripContext (backed by AsyncStorage).
 */
export function useTrips(): UseTripsResult {
  const { trips, isLoaded, addTrip, deleteTrip } = useTripContext();

  const createTrip = useCallback(
    (input: CreateTripInput): Trip => {
      const trip: Trip = {
        id: uuidv4(),
        name: input.name.trim(),
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

  const getTripById = useCallback(
    (id: string): Trip | undefined => trips.find((t) => t.id === id),
    [trips],
  );

  return {
    trips,
    isLoaded,
    createTrip,
    deleteTrip,
    getTripById,
  };
}
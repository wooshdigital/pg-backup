import { useCallback } from 'react';
import { useTripContext } from '../context/TripContext';
import { Trip } from '../types';
import { generateId } from '../utils/id';

export function useTrips() {
  const { state, dispatch } = useTripContext();

  const addTrip = useCallback(
    (data: Omit<Trip, 'id' | 'createdAt' | 'participants'>) => {
      const trip: Trip = {
        ...data,
        id: generateId(),
        createdAt: new Date().toISOString(),
        participants: [],
      };
      dispatch({ type: 'TRIP_ADD', payload: trip });
      return trip;
    },
    [dispatch]
  );

  const updateTrip = useCallback(
    (trip: Trip) => {
      dispatch({ type: 'TRIP_UPDATE', payload: trip });
    },
    [dispatch]
  );

  const deleteTrip = useCallback(
    (id: string) => {
      dispatch({ type: 'TRIP_DELETE', payload: { id } });
    },
    [dispatch]
  );

  const getTripById = useCallback(
    (id: string): Trip | undefined => {
      return state.trips.find((t) => t.id === id);
    },
    [state.trips]
  );

  return {
    trips: state.trips,
    isLoading: state.isLoading,
    addTrip,
    updateTrip,
    deleteTrip,
    getTripById,
  };
}
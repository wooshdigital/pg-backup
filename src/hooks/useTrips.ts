import { useCallback } from 'react';
import { useTripContext } from '../context/TripContext';
import { Trip } from '../types';

export interface UseTripsReturn {
  trips: Trip[];
  loading: boolean;
  createTrip: (data: Omit<Trip, 'id' | 'createdAt' | 'participants'>) => void;
  updateTrip: (id: string, data: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  getTripById: (id: string) => Trip | undefined;
}

export function useTrips(): UseTripsReturn {
  const { state, dispatch } = useTripContext();

  const createTrip = useCallback(
    (data: Omit<Trip, 'id' | 'createdAt' | 'participants'>) => {
      dispatch({ type: 'TRIP_CREATE', payload: data });
    },
    [dispatch]
  );

  const updateTrip = useCallback(
    (id: string, data: Partial<Trip>) => {
      dispatch({ type: 'TRIP_UPDATE', payload: { id, ...data } });
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
    (id: string) => state.trips.find((t) => t.id === id),
    [state.trips]
  );

  return {
    trips: state.trips,
    loading: state.loading,
    createTrip,
    updateTrip,
    deleteTrip,
    getTripById,
  };
}
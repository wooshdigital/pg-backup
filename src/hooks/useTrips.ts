import { useMemo } from 'react';
import { useTripContext } from '../context/TripContext';
import { Trip } from '../types';

interface UseTripsReturn {
  trips: Trip[];
  loading: boolean;
  addTrip: (data: Omit<Trip, 'id' | 'createdAt' | 'participants'>) => void;
  updateTrip: (id: string, data: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;
  getTripById: (id: string) => Trip | undefined;
}

export function useTrips(): UseTripsReturn {
  const { state, dispatch } = useTripContext();

  const trips = useMemo(() => state.trips, [state.trips]);

  function addTrip(data: Omit<Trip, 'id' | 'createdAt' | 'participants'>) {
    dispatch({ type: 'TRIP_ADD', payload: data });
  }

  function updateTrip(id: string, data: Partial<Trip>) {
    dispatch({ type: 'TRIP_UPDATE', payload: { id, ...data } });
  }

  function deleteTrip(id: string) {
    dispatch({ type: 'TRIP_DELETE', payload: { id } });
  }

  function getTripById(id: string): Trip | undefined {
    return state.trips.find((t) => t.id === id);
  }

  return {
    trips,
    loading: state.loading,
    addTrip,
    updateTrip,
    deleteTrip,
    getTripById,
  };
}
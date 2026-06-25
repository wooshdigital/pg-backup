import { useContext, useCallback } from 'react';
import { TripContext } from '../context/TripContext';
import { Trip } from '../types';
import { generateId } from '../utils/id';

export interface CreateTripInput {
  name: string;
  currency: string;
  startDate: string;
  endDate: string;
}

export function useTrips() {
  const context = useContext(TripContext);

  if (!context) {
    throw new Error('useTrips must be used within a TripProvider');
  }

  const { state, dispatch } = context;

  const addTrip = useCallback(
    (input: CreateTripInput): Trip => {
      const newTrip: Trip = {
        id: generateId(),
        name: input.name.trim(),
        currency: input.currency,
        startDate: input.startDate,
        endDate: input.endDate,
        createdAt: new Date().toISOString(),
        participantIds: [],
        expenseIds: [],
      };

      dispatch({ type: 'ADD_TRIP', payload: newTrip });
      return newTrip;
    },
    [dispatch],
  );

  const deleteTrip = useCallback(
    (id: string) => {
      dispatch({ type: 'DELETE_TRIP', payload: id });
    },
    [dispatch],
  );

  return {
    trips: state.trips,
    loading: state.loading,
    addTrip,
    deleteTrip,
  };
}
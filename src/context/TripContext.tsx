import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { Trip, Expense, Participant } from '../types';
import { loadTrips, saveTrips } from '../utils/storage';

interface TripState {
  trips: Trip[];
  loading: boolean;
}

type TripAction =
  | { type: 'SET_TRIPS'; payload: Trip[] }
  | { type: 'TRIP_ADD'; payload: Trip }
  | { type: 'TRIP_UPDATE'; payload: Trip }
  | { type: 'TRIP_DELETE'; payload: string }
  | { type: 'TRIP_ADD_EXPENSE'; payload: { tripId: string; expense: Expense } }
  | { type: 'TRIP_UPDATE_EXPENSE'; payload: { tripId: string; expense: Expense } }
  | { type: 'TRIP_DELETE_EXPENSE'; payload: { tripId: string; expenseId: string } }
  | { type: 'TRIP_ADD_PARTICIPANT'; payload: { tripId: string; participant: Participant } }
  | { type: 'TRIP_UPDATE_PARTICIPANT'; payload: { tripId: string; participant: Participant } }
  | { type: 'TRIP_DELETE_PARTICIPANT'; payload: { tripId: string; participantId: string } };

function tripReducer(state: TripState, action: TripAction): TripState {
  switch (action.type) {
    case 'SET_TRIPS':
      return { ...state, trips: action.payload, loading: false };

    case 'TRIP_ADD':
      return { ...state, trips: [...state.trips, action.payload] };

    case 'TRIP_UPDATE':
      return {
        ...state,
        trips: state.trips.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };

    case 'TRIP_DELETE':
      return {
        ...state,
        trips: state.trips.filter((t) => t.id !== action.payload),
      };

    case 'TRIP_ADD_EXPENSE':
      return {
        ...state,
        trips: state.trips.map((t) =>
          t.id === action.payload.tripId
            ? {
                ...t,
                expenses: [...(t.expenses ?? []), action.payload.expense],
                updatedAt: new Date().toISOString(),
              }
            : t
        ),
      };

    case 'TRIP_UPDATE_EXPENSE':
      return {
        ...state,
        trips: state.trips.map((t) =>
          t.id === action.payload.tripId
            ? {
                ...t,
                expenses: (t.expenses ?? []).map((e) =>
                  e.id === action.payload.expense.id ? action.payload.expense : e
                ),
                updatedAt: new Date().toISOString(),
              }
            : t
        ),
      };

    case 'TRIP_DELETE_EXPENSE':
      return {
        ...state,
        trips: state.trips.map((t) =>
          t.id === action.payload.tripId
            ? {
                ...t,
                expenses: (t.expenses ?? []).filter(
                  (e) => e.id !== action.payload.expenseId
                ),
                updatedAt: new Date().toISOString(),
              }
            : t
        ),
      };

    case 'TRIP_ADD_PARTICIPANT':
      return {
        ...state,
        trips: state.trips.map((t) =>
          t.id === action.payload.tripId
            ? {
                ...t,
                participants: [...(t.participants ?? []), action.payload.participant],
                updatedAt: new Date().toISOString(),
              }
            : t
        ),
      };

    case 'TRIP_UPDATE_PARTICIPANT':
      return {
        ...state,
        trips: state.trips.map((t) =>
          t.id === action.payload.tripId
            ? {
                ...t,
                participants: (t.participants ?? []).map((p) =>
                  p.id === action.payload.participant.id
                    ? action.payload.participant
                    : p
                ),
                updatedAt: new Date().toISOString(),
              }
            : t
        ),
      };

    case 'TRIP_DELETE_PARTICIPANT':
      return {
        ...state,
        trips: state.trips.map((t) =>
          t.id === action.payload.tripId
            ? {
                ...t,
                participants: (t.participants ?? []).filter(
                  (p) => p.id !== action.payload.participantId
                ),
                updatedAt: new Date().toISOString(),
              }
            : t
        ),
      };

    default:
      return state;
  }
}

interface TripContextValue {
  state: TripState;
  dispatch: React.Dispatch<TripAction>;
}

export const TripContext = createContext<TripContextValue>({
  state: { trips: [], loading: true },
  dispatch: () => {},
});

export function TripProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(tripReducer, {
    trips: [],
    loading: true,
  });

  // Load from storage on mount
  useEffect(() => {
    loadTrips().then((trips) => {
      dispatch({ type: 'SET_TRIPS', payload: trips ?? [] });
    });
  }, []);

  // Persist whenever trips change
  useEffect(() => {
    if (!state.loading) {
      saveTrips(state.trips);
    }
  }, [state.trips, state.loading]);

  return (
    <TripContext.Provider value={{ state, dispatch }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTripContext() {
  return useContext(TripContext);
}
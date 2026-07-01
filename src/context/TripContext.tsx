import React, { createContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Trip, Expense, Participant } from '../types';

interface TripState {
  trips: Trip[];
  loading: boolean;
}

type TripAction =
  | { type: 'SET_TRIPS'; payload: Trip[] }
  | { type: 'TRIP_CREATE'; payload: Trip }
  | { type: 'TRIP_UPDATE'; payload: Trip }
  | { type: 'TRIP_DELETE'; payload: { tripId: string } }
  | { type: 'TRIP_ADD_PARTICIPANT'; payload: { tripId: string; participant: Participant } }
  | { type: 'TRIP_REMOVE_PARTICIPANT'; payload: { tripId: string; participantId: string } }
  | { type: 'TRIP_ADD_EXPENSE'; payload: { tripId: string; expense: Expense } }
  | { type: 'TRIP_UPDATE_EXPENSE'; payload: { tripId: string; expense: Expense } }
  | { type: 'TRIP_DELETE_EXPENSE'; payload: { tripId: string; expenseId: string } }
  | { type: 'SET_LOADING'; payload: boolean };

interface TripContextValue {
  state: TripState;
  dispatch: React.Dispatch<TripAction>;
}

const initialState: TripState = {
  trips: [],
  loading: true,
};

function tripReducer(state: TripState, action: TripAction): TripState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_TRIPS':
      return { ...state, trips: action.payload, loading: false };

    case 'TRIP_CREATE':
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
        trips: state.trips.filter((t) => t.id !== action.payload.tripId),
      };

    case 'TRIP_ADD_PARTICIPANT':
      return {
        ...state,
        trips: state.trips.map((t) =>
          t.id === action.payload.tripId
            ? {
                ...t,
                participants: [
                  ...(t.participants ?? []),
                  action.payload.participant,
                ],
              }
            : t
        ),
      };

    case 'TRIP_REMOVE_PARTICIPANT':
      return {
        ...state,
        trips: state.trips.map((t) =>
          t.id === action.payload.tripId
            ? {
                ...t,
                participants: (t.participants ?? []).filter(
                  (p) => p.id !== action.payload.participantId
                ),
              }
            : t
        ),
      };

    case 'TRIP_ADD_EXPENSE':
      return {
        ...state,
        trips: state.trips.map((t) =>
          t.id === action.payload.tripId
            ? {
                ...t,
                expenses: [...(t.expenses ?? []), action.payload.expense],
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
                  e.id === action.payload.expense.id
                    ? { ...e, ...action.payload.expense }
                    : e
                ),
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
              }
            : t
        ),
      };

    default:
      return state;
  }
}

export const TripContext = createContext<TripContextValue>({
  state: initialState,
  dispatch: () => {},
});

const STORAGE_KEY = '@splitwise_trips';

export const TripProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(tripReducer, initialState);

  // Load from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const trips = JSON.parse(raw);
          dispatch({ type: 'SET_TRIPS', payload: trips });
        } else {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      } catch {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    })();
  }, []);

  // Persist to storage on state change
  useEffect(() => {
    if (!state.loading) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.trips)).catch(
        () => {}
      );
    }
  }, [state.trips, state.loading]);

  return (
    <TripContext.Provider value={{ state, dispatch }}>
      {children}
    </TripContext.Provider>
  );
};
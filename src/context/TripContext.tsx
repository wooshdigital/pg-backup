import React, { createContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Trip, Expense, Participant } from '../types';

interface TripState {
  trips: Trip[];
  isLoading: boolean;
}

type TripAction =
  | { type: 'SET_TRIPS'; payload: Trip[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'TRIP_CREATE'; payload: Trip }
  | { type: 'TRIP_DELETE'; payload: { tripId: string } }
  | { type: 'TRIP_UPDATE'; payload: Trip }
  | { type: 'TRIP_ADD_PARTICIPANT'; payload: { tripId: string; participant: Participant } }
  | { type: 'TRIP_REMOVE_PARTICIPANT'; payload: { tripId: string; participantId: string } }
  | { type: 'TRIP_ADD_EXPENSE'; payload: { tripId: string; expense: Expense } }
  | { type: 'TRIP_UPDATE_EXPENSE'; payload: { tripId: string; expense: Expense } }
  | { type: 'TRIP_DELETE_EXPENSE'; payload: { tripId: string; expenseId: string } };

interface TripContextValue {
  state: TripState;
  dispatch: React.Dispatch<TripAction>;
}

const initialState: TripState = {
  trips: [],
  isLoading: true,
};

function tripReducer(state: TripState, action: TripAction): TripState {
  switch (action.type) {
    case 'SET_TRIPS':
      return { ...state, trips: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'TRIP_CREATE':
      return {
        ...state,
        trips: [...state.trips, action.payload],
      };

    case 'TRIP_DELETE':
      return {
        ...state,
        trips: state.trips.filter(t => t.id !== action.payload.tripId),
      };

    case 'TRIP_UPDATE':
      return {
        ...state,
        trips: state.trips.map(t =>
          t.id === action.payload.id ? action.payload : t
        ),
      };

    case 'TRIP_ADD_PARTICIPANT':
      return {
        ...state,
        trips: state.trips.map(t =>
          t.id === action.payload.tripId
            ? { ...t, participants: [...(t.participants ?? []), action.payload.participant] }
            : t
        ),
      };

    case 'TRIP_REMOVE_PARTICIPANT':
      return {
        ...state,
        trips: state.trips.map(t =>
          t.id === action.payload.tripId
            ? {
                ...t,
                participants: (t.participants ?? []).filter(
                  p => p.id !== action.payload.participantId
                ),
              }
            : t
        ),
      };

    case 'TRIP_ADD_EXPENSE':
      return {
        ...state,
        trips: state.trips.map(t =>
          t.id === action.payload.tripId
            ? { ...t, expenses: [...(t.expenses ?? []), action.payload.expense] }
            : t
        ),
      };

    case 'TRIP_UPDATE_EXPENSE':
      return {
        ...state,
        trips: state.trips.map(t =>
          t.id === action.payload.tripId
            ? {
                ...t,
                expenses: (t.expenses ?? []).map(e =>
                  e.id === action.payload.expense.id ? action.payload.expense : e
                ),
              }
            : t
        ),
      };

    case 'TRIP_DELETE_EXPENSE':
      return {
        ...state,
        trips: state.trips.map(t =>
          t.id === action.payload.tripId
            ? {
                ...t,
                expenses: (t.expenses ?? []).filter(
                  e => e.id !== action.payload.expenseId
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
  dispatch: () => undefined,
});

const STORAGE_KEY = '@trips_data';

export const TripProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(tripReducer, initialState);

  // Load trips from storage on mount
  useEffect(() => {
    const loadTrips = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const trips = JSON.parse(stored);
          dispatch({ type: 'SET_TRIPS', payload: trips });
        }
      } catch (error) {
        console.error('Failed to load trips:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    loadTrips();
  }, []);

  // Persist trips to storage whenever they change
  useEffect(() => {
    if (!state.isLoading) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.trips)).catch(
        error => console.error('Failed to save trips:', error)
      );
    }
  }, [state.trips, state.isLoading]);

  return (
    <TripContext.Provider value={{ state, dispatch }}>
      {children}
    </TripContext.Provider>
  );
};
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Trip, Participant, Expense } from '../types';
import { generateId } from '../utils/id';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@trips';

type TripAction =
  | { type: 'SET_TRIPS'; payload: Trip[] }
  | { type: 'ADD_TRIP'; payload: Trip }
  | { type: 'UPDATE_TRIP'; payload: Trip }
  | { type: 'DELETE_TRIP'; payload: string }
  | { type: 'ADD_PARTICIPANT'; payload: { tripId: string; participant: Participant } }
  | { type: 'UPDATE_PARTICIPANT'; payload: { tripId: string; participant: Participant } }
  | { type: 'DELETE_PARTICIPANT'; payload: { tripId: string; participantId: string } }
  | { type: 'TRIP_ADD_EXPENSE'; payload: { tripId: string; expense: Expense } }
  | { type: 'TRIP_UPDATE_EXPENSE'; payload: { tripId: string; expense: Expense } }
  | { type: 'TRIP_DELETE_EXPENSE'; payload: { tripId: string; expenseId: string } };

interface TripState {
  trips: Trip[];
  loading: boolean;
}

interface TripContextValue {
  state: TripState;
  dispatch: React.Dispatch<TripAction>;
  getTrip: (id: string) => Trip | undefined;
}

const TripContext = createContext<TripContextValue | undefined>(undefined);

function tripReducer(state: TripState, action: TripAction): TripState {
  switch (action.type) {
    case 'SET_TRIPS':
      return { ...state, trips: action.payload, loading: false };

    case 'ADD_TRIP':
      return { ...state, trips: [...state.trips, action.payload] };

    case 'UPDATE_TRIP':
      return {
        ...state,
        trips: state.trips.map((t) => (t.id === action.payload.id ? action.payload : t)),
      };

    case 'DELETE_TRIP':
      return { ...state, trips: state.trips.filter((t) => t.id !== action.payload) };

    case 'ADD_PARTICIPANT':
      return {
        ...state,
        trips: state.trips.map((t) =>
          t.id === action.payload.tripId
            ? { ...t, participants: [...t.participants, action.payload.participant] }
            : t
        ),
      };

    case 'UPDATE_PARTICIPANT':
      return {
        ...state,
        trips: state.trips.map((t) =>
          t.id === action.payload.tripId
            ? {
                ...t,
                participants: t.participants.map((p) =>
                  p.id === action.payload.participant.id ? action.payload.participant : p
                ),
              }
            : t
        ),
      };

    case 'DELETE_PARTICIPANT':
      return {
        ...state,
        trips: state.trips.map((t) =>
          t.id === action.payload.tripId
            ? {
                ...t,
                participants: t.participants.filter((p) => p.id !== action.payload.participantId),
              }
            : t
        ),
      };

    case 'TRIP_ADD_EXPENSE':
      return {
        ...state,
        trips: state.trips.map((t) =>
          t.id === action.payload.tripId
            ? { ...t, expenses: [...(t.expenses || []), action.payload.expense] }
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
                expenses: (t.expenses || []).map((e) =>
                  e.id === action.payload.expense.id ? action.payload.expense : e
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
                expenses: (t.expenses || []).filter((e) => e.id !== action.payload.expenseId),
              }
            : t
        ),
      };

    default:
      return state;
  }
}

const initialState: TripState = {
  trips: [],
  loading: true,
};

export function TripProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tripReducer, initialState);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          const trips: Trip[] = JSON.parse(raw);
          // Ensure expenses array exists on each trip
          const normalized = trips.map((t) => ({ ...t, expenses: t.expenses || [] }));
          dispatch({ type: 'SET_TRIPS', payload: normalized });
        } catch {
          dispatch({ type: 'SET_TRIPS', payload: [] });
        }
      } else {
        dispatch({ type: 'SET_TRIPS', payload: [] });
      }
    });
  }, []);

  useEffect(() => {
    if (!state.loading) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.trips));
    }
  }, [state.trips, state.loading]);

  const getTrip = (id: string) => state.trips.find((t) => t.id === id);

  return (
    <TripContext.Provider value={{ state, dispatch, getTrip }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTripContext() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTripContext must be used within TripProvider');
  return ctx;
}
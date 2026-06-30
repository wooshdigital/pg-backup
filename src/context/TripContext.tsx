import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Trip, Expense } from '../types';
import { saveTrips, loadTrips } from '../utils/storage';

// ─── State ───────────────────────────────────────────────────────────────────

interface TripState {
  trips: Trip[];
  loading: boolean;
}

const initialState: TripState = {
  trips: [],
  loading: true,
};

// ─── Actions ─────────────────────────────────────────────────────────────────

type TripAction =
  | { type: 'LOAD_TRIPS'; payload: Trip[] }
  | { type: 'ADD_TRIP'; payload: Trip }
  | { type: 'UPDATE_TRIP'; payload: Trip }
  | { type: 'DELETE_TRIP'; payload: string }
  | { type: 'ADD_PARTICIPANT'; payload: { tripId: string; participant: import('../types').Participant } }
  | { type: 'REMOVE_PARTICIPANT'; payload: { tripId: string; participantId: string } }
  | { type: 'TRIP_ADD_EXPENSE'; payload: { tripId: string; expense: Expense } }
  | { type: 'TRIP_UPDATE_EXPENSE'; payload: { tripId: string; expense: Expense } }
  | { type: 'TRIP_DELETE_EXPENSE'; payload: { tripId: string; expenseId: string } };

// ─── Reducer ─────────────────────────────────────────────────────────────────

function tripReducer(state: TripState, action: TripAction): TripState {
  switch (action.type) {
    case 'LOAD_TRIPS':
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

    case 'REMOVE_PARTICIPANT':
      return {
        ...state,
        trips: state.trips.map((t) =>
          t.id === action.payload.tripId
            ? {
                ...t,
                participants: t.participants.filter(
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
                expenses: (t.expenses || []).filter(
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

// ─── Context ─────────────────────────────────────────────────────────────────

interface TripContextValue {
  state: TripState;
  dispatch: React.Dispatch<TripAction>;
}

const TripContext = createContext<TripContextValue | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

export function TripProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tripReducer, initialState);

  // Load persisted trips on mount
  useEffect(() => {
    (async () => {
      try {
        const saved = await loadTrips();
        dispatch({ type: 'LOAD_TRIPS', payload: saved || [] });
      } catch {
        dispatch({ type: 'LOAD_TRIPS', payload: [] });
      }
    })();
  }, []);

  // Persist whenever trips change
  useEffect(() => {
    if (!state.loading) {
      saveTrips(state.trips).catch(() => {});
    }
  }, [state.trips, state.loading]);

  return <TripContext.Provider value={{ state, dispatch }}>{children}</TripContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTripContext(): TripContextValue {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTripContext must be used within TripProvider');
  return ctx;
}

export default TripContext;
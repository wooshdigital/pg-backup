import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip, Participant } from '../types';
import { getRandomAvatarColor } from '../utils/avatarColors';
import { generateId } from '../utils/id';

const STORAGE_KEY = '@trips';

// ─── State ────────────────────────────────────────────────────────────────────

export interface TripState {
  trips: Trip[];
  loading: boolean;
}

const initialState: TripState = {
  trips: [],
  loading: true,
};

// ─── Actions ──────────────────────────────────────────────────────────────────

export type TripAction =
  | { type: 'TRIPS_LOADED'; payload: Trip[] }
  | { type: 'TRIP_CREATE'; payload: Omit<Trip, 'id' | 'createdAt' | 'participants'> }
  | { type: 'TRIP_UPDATE'; payload: { id: string } & Partial<Trip> }
  | { type: 'TRIP_DELETE'; payload: { id: string } }
  | { type: 'TRIP_ADD_PARTICIPANT'; payload: { tripId: string; name: string } }
  | { type: 'TRIP_REMOVE_PARTICIPANT'; payload: { tripId: string; participantId: string } };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function tripReducer(state: TripState, action: TripAction): TripState {
  switch (action.type) {
    case 'TRIPS_LOADED':
      return { ...state, trips: action.payload, loading: false };

    case 'TRIP_CREATE': {
      const newTrip: Trip = {
        ...action.payload,
        id: generateId(),
        createdAt: new Date().toISOString(),
        participants: [],
      };
      return { ...state, trips: [...state.trips, newTrip] };
    }

    case 'TRIP_UPDATE': {
      const { id, ...updates } = action.payload;
      return {
        ...state,
        trips: state.trips.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      };
    }

    case 'TRIP_DELETE':
      return {
        ...state,
        trips: state.trips.filter((t) => t.id !== action.payload.id),
      };

    case 'TRIP_ADD_PARTICIPANT': {
      const { tripId, name } = action.payload;
      const newParticipant: Participant = {
        id: generateId(),
        name: name.trim(),
        avatarColor: getRandomAvatarColor(),
        tripId,
      };
      return {
        ...state,
        trips: state.trips.map((t) =>
          t.id === tripId
            ? { ...t, participants: [...(t.participants ?? []), newParticipant] }
            : t
        ),
      };
    }

    case 'TRIP_REMOVE_PARTICIPANT': {
      const { tripId, participantId } = action.payload;
      return {
        ...state,
        trips: state.trips.map((t) =>
          t.id === tripId
            ? {
                ...t,
                participants: (t.participants ?? []).filter((p) => p.id !== participantId),
              }
            : t
        ),
      };
    }

    default:
      return state;
  }
}

// ─── Context ──────────────────────────────────────────────────────────────────

interface TripContextValue {
  state: TripState;
  dispatch: React.Dispatch<TripAction>;
}

const TripContext = createContext<TripContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface TripProviderProps {
  children: ReactNode;
}

export function TripProvider({ children }: TripProviderProps) {
  const [state, dispatch] = useReducer(tripReducer, initialState);

  // Load from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const trips: Trip[] = stored ? JSON.parse(stored) : [];
        // Ensure each trip has a participants array (migration safety)
        const normalized = trips.map((t) => ({ ...t, participants: t.participants ?? [] }));
        dispatch({ type: 'TRIPS_LOADED', payload: normalized });
      } catch {
        dispatch({ type: 'TRIPS_LOADED', payload: [] });
      }
    })();
  }, []);

  // Persist to storage whenever trips change
  useEffect(() => {
    if (!state.loading) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.trips)).catch(() => {});
    }
  }, [state.trips, state.loading]);

  return <TripContext.Provider value={{ state, dispatch }}>{children}</TripContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTripContext(): TripContextValue {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTripContext must be used within a TripProvider');
  return ctx;
}
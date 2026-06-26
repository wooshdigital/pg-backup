import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip, Participant } from '../types';

const STORAGE_KEY = '@trips_v1';

// ─── State ────────────────────────────────────────────────────────────────────

interface TripState {
  trips: Trip[];
  isLoading: boolean;
}

const initialState: TripState = {
  trips: [],
  isLoading: true,
};

// ─── Actions ──────────────────────────────────────────────────────────────────

type TripAction =
  | { type: 'TRIPS_LOADED'; payload: Trip[] }
  | { type: 'TRIP_ADD'; payload: Trip }
  | { type: 'TRIP_UPDATE'; payload: Trip }
  | { type: 'TRIP_DELETE'; payload: { id: string } }
  | { type: 'TRIP_ADD_PARTICIPANT'; payload: { tripId: string; participant: Participant } }
  | { type: 'TRIP_REMOVE_PARTICIPANT'; payload: { tripId: string; participantId: string } };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function tripReducer(state: TripState, action: TripAction): TripState {
  switch (action.type) {
    case 'TRIPS_LOADED':
      return {
        ...state,
        trips: action.payload,
        isLoading: false,
      };

    case 'TRIP_ADD':
      return {
        ...state,
        trips: [action.payload, ...state.trips],
      };

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
        trips: state.trips.filter((t) => t.id !== action.payload.id),
      };

    case 'TRIP_ADD_PARTICIPANT':
      return {
        ...state,
        trips: state.trips.map((t) => {
          if (t.id !== action.payload.tripId) return t;
          return {
            ...t,
            participants: [...(t.participants ?? []), action.payload.participant],
          };
        }),
      };

    case 'TRIP_REMOVE_PARTICIPANT':
      return {
        ...state,
        trips: state.trips.map((t) => {
          if (t.id !== action.payload.tripId) return t;
          return {
            ...t,
            participants: (t.participants ?? []).filter(
              (p) => p.id !== action.payload.participantId
            ),
          };
        }),
      };

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
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const trips: Trip[] = raw ? JSON.parse(raw) : [];
        // Ensure participants array exists on every trip
        const normalized = trips.map((t) => ({
          ...t,
          participants: t.participants ?? [],
        }));
        dispatch({ type: 'TRIPS_LOADED', payload: normalized });
      } catch {
        dispatch({ type: 'TRIPS_LOADED', payload: [] });
      }
    })();
  }, []);

  // Persist to storage whenever trips change
  useEffect(() => {
    if (!state.isLoading) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.trips)).catch(
        () => {}
      );
    }
  }, [state.trips, state.isLoading]);

  return (
    <TripContext.Provider value={{ state, dispatch }}>
      {children}
    </TripContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTripContext(): TripContextValue {
  const ctx = useContext(TripContext);
  if (!ctx) {
    throw new Error('useTripContext must be used inside TripProvider');
  }
  return ctx;
}
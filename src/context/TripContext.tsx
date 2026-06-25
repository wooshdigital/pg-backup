import React, {
  createContext,
  useReducer,
  useEffect,
  useContext,
  ReactNode,
  Dispatch,
} from 'react';
import { Trip } from '../types';
import { saveTrips, loadTrips } from '../utils/storage';

// ─── State ───────────────────────────────────────────────────────────────────

export interface TripState {
  trips: Trip[];
  loading: boolean;
}

const initialState: TripState = {
  trips: [],
  loading: true,
};

// ─── Actions ─────────────────────────────────────────────────────────────────

export type TripAction =
  | { type: 'ADD_TRIP'; payload: Trip }
  | { type: 'DELETE_TRIP'; payload: string }
  | { type: 'LOAD_TRIPS'; payload: Trip[] };

// ─── Reducer ─────────────────────────────────────────────────────────────────

function tripReducer(state: TripState, action: TripAction): TripState {
  switch (action.type) {
    case 'LOAD_TRIPS':
      return { ...state, trips: action.payload, loading: false };

    case 'ADD_TRIP':
      return { ...state, trips: [action.payload, ...state.trips] };

    case 'DELETE_TRIP':
      return {
        ...state,
        trips: state.trips.filter((t) => t.id !== action.payload),
      };

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

export interface TripContextValue {
  state: TripState;
  dispatch: Dispatch<TripAction>;
}

export const TripContext = createContext<TripContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface TripProviderProps {
  children: ReactNode;
}

export const TripProvider: React.FC<TripProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(tripReducer, initialState);

  // Load trips from AsyncStorage on mount
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const trips = await loadTrips();
        if (!cancelled) {
          dispatch({ type: 'LOAD_TRIPS', payload: trips });
        }
      } catch (error) {
        console.error('[TripContext] Failed to load trips:', error);
        if (!cancelled) {
          dispatch({ type: 'LOAD_TRIPS', payload: [] });
        }
      }
    };

    init();
    return () => { cancelled = true; };
  }, []);

  // Persist trips to AsyncStorage whenever they change (skip initial load)
  useEffect(() => {
    if (state.loading) return;
    saveTrips(state.trips).catch((err) => {
      console.error('[TripContext] Failed to persist trips:', err);
    });
  }, [state.trips, state.loading]);

  return (
    <TripContext.Provider value={{ state, dispatch }}>
      {children}
    </TripContext.Provider>
  );
};

// ─── Convenience hook ────────────────────────────────────────────────────────

export const useTripContext = (): TripContextValue => {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTripContext must be used within a TripProvider');
  }
  return context;
};
import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { Trip } from '../types';
import { saveTrips, loadTrips } from '../utils/storage';

// ---------------------------------------------------------------------------
// Action types
// ---------------------------------------------------------------------------
type Action =
  | { type: 'LOAD_TRIPS'; payload: Trip[] }
  | { type: 'ADD_TRIP'; payload: Trip }
  | { type: 'DELETE_TRIP'; payload: string };

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
interface TripState {
  trips: Trip[];
  loaded: boolean;
}

const initialState: TripState = {
  trips: [],
  loaded: false,
};

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------
function tripReducer(state: TripState, action: Action): TripState {
  switch (action.type) {
    case 'LOAD_TRIPS':
      return { ...state, trips: action.payload, loaded: true };
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

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------
interface TripContextValue {
  trips: Trip[];
  loaded: boolean;
  addTrip: (trip: Trip) => void;
  deleteTrip: (id: string) => void;
}

const TripContext = createContext<TripContextValue | undefined>(undefined);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function TripProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tripReducer, initialState);

  // Load persisted trips on mount
  useEffect(() => {
    loadTrips().then((trips) => {
      dispatch({ type: 'LOAD_TRIPS', payload: trips });
    });
  }, []);

  // Persist trips whenever they change (skip initial unloaded state)
  useEffect(() => {
    if (!state.loaded) return;
    saveTrips(state.trips);
  }, [state.trips, state.loaded]);

  const addTrip = useCallback((trip: Trip) => {
    dispatch({ type: 'ADD_TRIP', payload: trip });
  }, []);

  const deleteTrip = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TRIP', payload: id });
  }, []);

  return (
    <TripContext.Provider value={{ trips: state.trips, loaded: state.loaded, addTrip, deleteTrip }}>
      {children}
    </TripContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useTripContext(): TripContextValue {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTripContext must be used inside TripProvider');
  return ctx;
}
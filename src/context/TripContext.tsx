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

// ─── Action Types ────────────────────────────────────────────────────────────

type Action =
  | { type: 'LOAD_TRIPS'; payload: Trip[] }
  | { type: 'ADD_TRIP'; payload: Trip }
  | { type: 'DELETE_TRIP'; payload: { id: string } };

// ─── State ───────────────────────────────────────────────────────────────────

interface TripState {
  trips: Trip[];
  isLoaded: boolean;
}

const initialState: TripState = {
  trips: [],
  isLoaded: false,
};

// ─── Reducer ─────────────────────────────────────────────────────────────────

function tripReducer(state: TripState, action: Action): TripState {
  switch (action.type) {
    case 'LOAD_TRIPS':
      return { ...state, trips: action.payload, isLoaded: true };

    case 'ADD_TRIP':
      return { ...state, trips: [action.payload, ...state.trips] };

    case 'DELETE_TRIP':
      return {
        ...state,
        trips: state.trips.filter((t) => t.id !== action.payload.id),
      };

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface TripContextValue {
  trips: Trip[];
  isLoaded: boolean;
  addTrip: (trip: Trip) => void;
  deleteTrip: (id: string) => void;
  dispatch: React.Dispatch<Action>;
}

const TripContext = createContext<TripContextValue | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

interface TripProviderProps {
  children: ReactNode;
}

export function TripProvider({ children }: TripProviderProps) {
  const [state, dispatch] = useReducer(tripReducer, initialState);

  // Load trips from AsyncStorage on mount
  useEffect(() => {
    loadTrips().then((trips) => {
      dispatch({ type: 'LOAD_TRIPS', payload: trips });
    });
  }, []);

  // Persist trips to AsyncStorage whenever they change (after initial load)
  useEffect(() => {
    if (!state.isLoaded) return;
    saveTrips(state.trips);
  }, [state.trips, state.isLoaded]);

  const addTrip = useCallback((trip: Trip) => {
    dispatch({ type: 'ADD_TRIP', payload: trip });
  }, []);

  const deleteTrip = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TRIP', payload: { id } });
  }, []);

  return (
    <TripContext.Provider
      value={{
        trips: state.trips,
        isLoaded: state.isLoaded,
        addTrip,
        deleteTrip,
        dispatch,
      }}
    >
      {children}
    </TripContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTripContext(): TripContextValue {
  const ctx = useContext(TripContext);
  if (!ctx) {
    throw new Error('useTripContext must be used within a TripProvider');
  }
  return ctx;
}

export { TripContext };
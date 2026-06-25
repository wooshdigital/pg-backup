import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
} from 'react';
import { Trip } from '../types';
import { loadTrips, saveTrips } from '../utils/storage';
import { generateId } from '../utils/id';

// ─── Action Types ────────────────────────────────────────────────────────────

type Action =
  | { type: 'LOAD_TRIPS'; payload: Trip[] }
  | { type: 'ADD_TRIP'; payload: Trip }
  | { type: 'DELETE_TRIP'; payload: string };

// ─── State ───────────────────────────────────────────────────────────────────

interface TripState {
  trips: Trip[];
  loaded: boolean;
}

const initialState: TripState = {
  trips: [],
  loaded: false,
};

// ─── Reducer ─────────────────────────────────────────────────────────────────

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

// ─── Context ─────────────────────────────────────────────────────────────────

interface TripContextValue {
  trips: Trip[];
  loaded: boolean;
  addTrip: (params: Omit<Trip, 'id' | 'createdAt' | 'participantIds' | 'expenseIds'>) => void;
  deleteTrip: (id: string) => void;
}

const TripContext = createContext<TripContextValue | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(tripReducer, initialState);

  // Load trips from storage on mount
  useEffect(() => {
    loadTrips().then((trips) => {
      dispatch({ type: 'LOAD_TRIPS', payload: trips });
    });
  }, []);

  // Persist trips to storage whenever they change (after initial load)
  useEffect(() => {
    if (state.loaded) {
      saveTrips(state.trips);
    }
  }, [state.trips, state.loaded]);

  const addTrip = useCallback(
    (params: Omit<Trip, 'id' | 'createdAt' | 'participantIds' | 'expenseIds'>) => {
      const newTrip: Trip = {
        ...params,
        id: generateId(),
        createdAt: new Date().toISOString(),
        participantIds: [],
        expenseIds: [],
      };
      dispatch({ type: 'ADD_TRIP', payload: newTrip });
    },
    []
  );

  const deleteTrip = useCallback((id: string) => {
    dispatch({ type: 'DELETE_TRIP', payload: id });
  }, []);

  return (
    <TripContext.Provider value={{ trips: state.trips, loaded: state.loaded, addTrip, deleteTrip }}>
      {children}
    </TripContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useTripContext = (): TripContextValue => {
  const ctx = useContext(TripContext);
  if (!ctx) {
    throw new Error('useTripContext must be used within a TripProvider');
  }
  return ctx;
};
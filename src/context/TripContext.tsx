import React, { createContext, useContext, useReducer, ReactNode } from 'react';

// Types
export interface Participant {
  id: string;
  name: string;
  email?: string;
}

export interface Split {
  participantId: string;
  amount: number;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  currency: string;
  paidById: string;
  splits: Split[];
  splitType?: 'equal' | 'custom';
  date: string;
  category?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Trip {
  id: string;
  name: string;
  description?: string;
  currency: string;
  participants: Participant[];
  expenses: Expense[];
  createdAt: string;
  updatedAt?: string;
}

export interface TripState {
  trips: Trip[];
  loading: boolean;
  error: string | null;
}

// Actions
export type TripAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_TRIPS'; payload: Trip[] }
  | { type: 'TRIP_ADD'; payload: Trip }
  | { type: 'TRIP_UPDATE'; payload: Trip }
  | { type: 'TRIP_REMOVE'; payload: string }
  | { type: 'TRIP_ADD_PARTICIPANT'; payload: { tripId: string; participant: Participant } }
  | { type: 'TRIP_REMOVE_PARTICIPANT'; payload: { tripId: string; participantId: string } }
  | { type: 'TRIP_ADD_EXPENSE'; payload: { tripId: string; expense: Expense } }
  | { type: 'TRIP_UPDATE_EXPENSE'; payload: { tripId: string; expense: Expense } }
  | { type: 'TRIP_REMOVE_EXPENSE'; payload: { tripId: string; expenseId: string } };

// Initial state
const initialState: TripState = {
  trips: [],
  loading: false,
  error: null,
};

// Reducer
function tripReducer(state: TripState, action: TripAction): TripState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_TRIPS':
      return { ...state, trips: action.payload };

    case 'TRIP_ADD':
      return { ...state, trips: [...state.trips, action.payload] };

    case 'TRIP_UPDATE':
      return {
        ...state,
        trips: state.trips.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload } : t
        ),
      };

    case 'TRIP_REMOVE':
      return {
        ...state,
        trips: state.trips.filter((t) => t.id !== action.payload),
      };

    case 'TRIP_ADD_PARTICIPANT':
      return {
        ...state,
        trips: state.trips.map((t) =>
          t.id === action.payload.tripId
            ? {
                ...t,
                participants: [...t.participants, action.payload.participant],
                updatedAt: new Date().toISOString(),
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
                participants: t.participants.filter(
                  (p) => p.id !== action.payload.participantId
                ),
                updatedAt: new Date().toISOString(),
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
                expenses: [...(t.expenses || []), action.payload.expense],
                updatedAt: new Date().toISOString(),
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
                expenses: (t.expenses || []).map((e) =>
                  e.id === action.payload.expense.id
                    ? {
                        ...e,
                        ...action.payload.expense,
                        createdAt: e.createdAt, // preserve original createdAt
                        updatedAt: new Date().toISOString(),
                      }
                    : e
                ),
                updatedAt: new Date().toISOString(),
              }
            : t
        ),
      };

    case 'TRIP_REMOVE_EXPENSE':
      return {
        ...state,
        trips: state.trips.map((t) =>
          t.id === action.payload.tripId
            ? {
                ...t,
                expenses: (t.expenses || []).filter(
                  (e) => e.id !== action.payload.expenseId
                ),
                updatedAt: new Date().toISOString(),
              }
            : t
        ),
      };

    default:
      return state;
  }
}

// Context
interface TripContextValue {
  state: TripState;
  dispatch: React.Dispatch<TripAction>;
}

const TripContext = createContext<TripContextValue | undefined>(undefined);

// Provider
interface TripProviderProps {
  children: ReactNode;
  initialTrips?: Trip[];
}

export const TripProvider: React.FC<TripProviderProps> = ({ children, initialTrips }) => {
  const [state, dispatch] = useReducer(tripReducer, {
    ...initialState,
    trips: initialTrips || [],
  });

  return (
    <TripContext.Provider value={{ state, dispatch }}>
      {children}
    </TripContext.Provider>
  );
};

// Hook
export function useTrip(): TripContextValue {
  const context = useContext(TripContext);
  if (!context) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
}

export default TripContext;
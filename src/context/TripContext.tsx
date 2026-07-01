import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  ReactNode,
} from 'react';
import { Trip, Expense, Participant } from '../types';

// ─── State ────────────────────────────────────────────────────────────────────

interface TripState {
  trips: Trip[];
  activeTripId: string | null;
}

// ─── Actions ──────────────────────────────────────────────────────────────────

type TripAction =
  | { type: 'TRIP_CREATE'; payload: Trip }
  | { type: 'TRIP_DELETE'; payload: { tripId: string } }
  | { type: 'TRIP_SET_ACTIVE'; payload: { tripId: string } }
  | { type: 'TRIP_ADD_PARTICIPANT'; payload: { tripId: string; participant: Participant } }
  | { type: 'TRIP_REMOVE_PARTICIPANT'; payload: { tripId: string; participantId: string } }
  | { type: 'TRIP_ADD_EXPENSE'; payload: { tripId: string; expense: Expense } }
  | { type: 'TRIP_UPDATE_EXPENSE'; payload: { tripId: string; expense: Expense } }
  | { type: 'TRIP_DELETE_EXPENSE'; payload: { tripId: string; expenseId: string } };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function tripReducer(state: TripState, action: TripAction): TripState {
  switch (action.type) {
    case 'TRIP_CREATE':
      return {
        ...state,
        trips: [...state.trips, action.payload],
        activeTripId: action.payload.id,
      };

    case 'TRIP_DELETE':
      return {
        ...state,
        trips: state.trips.filter((t) => t.id !== action.payload.tripId),
        activeTripId:
          state.activeTripId === action.payload.tripId
            ? null
            : state.activeTripId,
      };

    case 'TRIP_SET_ACTIVE':
      return { ...state, activeTripId: action.payload.tripId };

    case 'TRIP_ADD_PARTICIPANT':
      return {
        ...state,
        trips: state.trips.map((t) =>
          t.id === action.payload.tripId
            ? {
                ...t,
                participants: [...(t.participants ?? []), action.payload.participant],
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
                participants: (t.participants ?? []).filter(
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
            ? {
                ...t,
                expenses: [...(t.expenses ?? []), action.payload.expense],
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
                expenses: (t.expenses ?? []).map((e) =>
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
                expenses: (t.expenses ?? []).filter(
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

// ─── Context ──────────────────────────────────────────────────────────────────

interface TripContextValue {
  trips: Trip[];
  trip: Trip | null;
  activeTripId: string | null;
  dispatch: React.Dispatch<TripAction>;
  setActiveTrip: (tripId: string) => void;
}

const TripContext = createContext<TripContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface TripProviderProps {
  children: ReactNode;
  initialState?: Partial<TripState>;
}

export function TripProvider({ children, initialState }: TripProviderProps) {
  const [state, dispatch] = useReducer(tripReducer, {
    trips: [],
    activeTripId: null,
    ...initialState,
  });

  const setActiveTrip = useCallback(
    (tripId: string) => {
      dispatch({ type: 'TRIP_SET_ACTIVE', payload: { tripId } });
    },
    [dispatch]
  );

  const trip = state.trips.find((t) => t.id === state.activeTripId) ?? null;

  return (
    <TripContext.Provider
      value={{ trips: state.trips, trip, activeTripId: state.activeTripId, dispatch, setActiveTrip }}
    >
      {children}
    </TripContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTrip() {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTrip must be used inside TripProvider');
  return ctx;
}
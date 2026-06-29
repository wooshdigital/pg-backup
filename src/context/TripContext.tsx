import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from 'react';
import { Alert } from 'react-native';
import { Trip, Participant } from '../types';
import { generateId } from '../utils/id';
import { getRandomAvatarColor } from '../utils/avatarColors';
import { loadTrips, saveTrips } from '../utils/storage';

// ─── State ────────────────────────────────────────────────────────────────────

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
  | { type: 'TRIPS_LOADED'; payload: Trip[] }
  | { type: 'TRIP_ADD'; payload: Omit<Trip, 'id' | 'createdAt' | 'participants'> }
  | { type: 'TRIP_UPDATE'; payload: Partial<Trip> & { id: string } }
  | { type: 'TRIP_DELETE'; payload: { id: string } }
  | { type: 'TRIP_ADD_PARTICIPANT'; payload: { tripId: string; name: string } }
  | { type: 'TRIP_REMOVE_PARTICIPANT'; payload: { tripId: string; participantId: string } };

// ─── Reducer ─────────────────────────────────────────────────────────────────

function tripReducer(state: TripState, action: TripAction): TripState {
  switch (action.type) {
    case 'TRIPS_LOADED': {
      return {
        ...state,
        trips: action.payload.map((t) => ({
          ...t,
          participants: t.participants ?? [],
        })),
        loading: false,
      };
    }

    case 'TRIP_ADD': {
      const newTrip: Trip = {
        id: generateId(),
        createdAt: new Date().toISOString(),
        participants: [],
        ...action.payload,
      };
      return { ...state, trips: [newTrip, ...state.trips] };
    }

    case 'TRIP_UPDATE': {
      return {
        ...state,
        trips: state.trips.map((t) =>
          t.id === action.payload.id ? { ...t, ...action.payload } : t
        ),
      };
    }

    case 'TRIP_DELETE': {
      return {
        ...state,
        trips: state.trips.filter((t) => t.id !== action.payload.id),
      };
    }

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
                participants: (t.participants ?? []).filter(
                  (p) => p.id !== participantId
                ),
              }
            : t
        ),
      };
    }

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface TripContextValue {
  state: TripState;
  dispatch: React.Dispatch<TripAction>;
  addParticipant: (tripId: string, name: string) => void;
  removeParticipant: (tripId: string, participantId: string, expenseParticipantIds?: string[]) => void;
}

const TripContext = createContext<TripContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

interface TripProviderProps {
  children: ReactNode;
}

export function TripProvider({ children }: TripProviderProps) {
  const [state, dispatch] = useReducer(tripReducer, initialState);

  // Load persisted trips on mount
  useEffect(() => {
    (async () => {
      const persisted = await loadTrips();
      dispatch({ type: 'TRIPS_LOADED', payload: persisted });
    })();
  }, []);

  // Persist whenever trips change
  useEffect(() => {
    if (!state.loading) {
      saveTrips(state.trips);
    }
  }, [state.trips, state.loading]);

  // ── Action creators ───────────────────────────────────────────────────────

  function addParticipant(tripId: string, name: string) {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Invalid name', 'Participant name cannot be empty.');
      return;
    }
    dispatch({ type: 'TRIP_ADD_PARTICIPANT', payload: { tripId, name: trimmed } });
  }

  function removeParticipant(
    tripId: string,
    participantId: string,
    expenseParticipantIds: string[] = []
  ) {
    if (expenseParticipantIds.includes(participantId)) {
      Alert.alert(
        'Cannot Remove',
        'This participant is already attached to an expense and cannot be removed.'
      );
      return;
    }
    dispatch({
      type: 'TRIP_REMOVE_PARTICIPANT',
      payload: { tripId, participantId },
    });
  }

  return (
    <TripContext.Provider value={{ state, dispatch, addParticipant, removeParticipant }}>
      {children}
    </TripContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTripContext(): TripContextValue {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTripContext must be used within a TripProvider');
  return ctx;
}

export { TripContext };
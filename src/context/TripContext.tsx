import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip, Participant } from '../types';
import { getRandomAvatarColor } from '../utils/avatarColors';
import { generateId } from '../utils/id';

const STORAGE_KEY = '@trips_data';

// ─── State ────────────────────────────────────────────────────────────────────

interface TripState {
  trips: Trip[];
  loading: boolean;
}

const initialState: TripState = {
  trips: [],
  loading: true,
};

// ─── Actions ──────────────────────────────────────────────────────────────────

type TripAction =
  | { type: 'TRIPS_LOADED'; payload: Trip[] }
  | { type: 'TRIP_ADD'; payload: Trip }
  | { type: 'TRIP_UPDATE'; payload: Trip }
  | { type: 'TRIP_DELETE'; payload: string }
  | {
      type: 'TRIP_ADD_PARTICIPANT';
      payload: { tripId: string; participant: Participant };
    }
  | {
      type: 'TRIP_REMOVE_PARTICIPANT';
      payload: { tripId: string; participantId: string };
    };

// ─── Reducer ──────────────────────────────────────────────────────────────────

function tripReducer(state: TripState, action: TripAction): TripState {
  switch (action.type) {
    case 'TRIPS_LOADED':
      return { ...state, trips: action.payload, loading: false };

    case 'TRIP_ADD':
      return { ...state, trips: [...state.trips, action.payload] };

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
        trips: state.trips.filter((t) => t.id !== action.payload),
      };

    case 'TRIP_ADD_PARTICIPANT':
      return {
        ...state,
        trips: state.trips.map((trip) => {
          if (trip.id !== action.payload.tripId) return trip;
          return {
            ...trip,
            participants: [
              ...(trip.participants ?? []),
              action.payload.participant,
            ],
          };
        }),
      };

    case 'TRIP_REMOVE_PARTICIPANT':
      return {
        ...state,
        trips: state.trips.map((trip) => {
          if (trip.id !== action.payload.tripId) return trip;
          return {
            ...trip,
            participants: (trip.participants ?? []).filter(
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
  addTrip: (data: Omit<Trip, 'id' | 'createdAt' | 'participants'>) => void;
  updateTrip: (trip: Trip) => void;
  deleteTrip: (id: string) => void;
  addParticipant: (tripId: string, name: string) => void;
  removeParticipant: (tripId: string, participantId: string) => void;
}

const TripContext = createContext<TripContextValue | undefined>(undefined);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function TripProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tripReducer, initialState);

  // Load from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const parsed: Trip[] = raw ? JSON.parse(raw) : [];
        // Ensure all trips have participants array
        const normalised = parsed.map((t) => ({
          ...t,
          participants: t.participants ?? [],
        }));
        dispatch({ type: 'TRIPS_LOADED', payload: normalised });
      } catch {
        dispatch({ type: 'TRIPS_LOADED', payload: [] });
      }
    })();
  }, []);

  // Persist to storage whenever trips change
  useEffect(() => {
    if (!state.loading) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.trips)).catch(
        () => {}
      );
    }
  }, [state.trips, state.loading]);

  // ── Action creators ──────────────────────────────────────────────────────

  function addTrip(data: Omit<Trip, 'id' | 'createdAt' | 'participants'>) {
    const trip: Trip = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      participants: [],
    };
    dispatch({ type: 'TRIP_ADD', payload: trip });
  }

  function updateTrip(trip: Trip) {
    dispatch({ type: 'TRIP_UPDATE', payload: trip });
  }

  function deleteTrip(id: string) {
    dispatch({ type: 'TRIP_DELETE', payload: id });
  }

  function addParticipant(tripId: string, name: string) {
    const trimmed = name.trim();
    if (!trimmed) return;

    const trip = state.trips.find((t) => t.id === tripId);
    if (!trip) return;

    // Check for duplicate name (case-insensitive)
    const duplicate = (trip.participants ?? []).some(
      (p) => p.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) {
      Alert.alert('Duplicate Participant', `"${trimmed}" is already in this trip.`);
      return;
    }

    const participant: Participant = {
      id: generateId(),
      name: trimmed,
      avatarColor: getRandomAvatarColor(),
      tripId,
    };
    dispatch({ type: 'TRIP_ADD_PARTICIPANT', payload: { tripId, participant } });
  }

  function removeParticipant(tripId: string, participantId: string) {
    // TODO: In Phase 4, check if participant is attached to any expense before removing.
    // For now we allow removal freely (no expenses yet).
    const trip = state.trips.find((t) => t.id === tripId);
    if (!trip) return;

    // Placeholder expense check – trip.expenses would be checked here in Phase 4.
    // const attachedToExpense = (trip.expenses ?? []).some(e =>
    //   e.paidBy === participantId || (e.splits ?? []).some(s => s.participantId === participantId)
    // );
    // if (attachedToExpense) {
    //   Alert.alert('Cannot Remove', 'This participant is attached to one or more expenses.');
    //   return;
    // }

    dispatch({
      type: 'TRIP_REMOVE_PARTICIPANT',
      payload: { tripId, participantId },
    });
  }

  const value: TripContextValue = {
    state,
    dispatch,
    addTrip,
    updateTrip,
    deleteTrip,
    addParticipant,
    removeParticipant,
  };

  return <TripContext.Provider value={value}>{children}</TripContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTripContext(): TripContextValue {
  const ctx = useContext(TripContext);
  if (!ctx) {
    throw new Error('useTripContext must be used within a TripProvider');
  }
  return ctx;
}

export default TripContext;
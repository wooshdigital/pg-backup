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

const STORAGE_KEY = '@trips';

// ─── State ───────────────────────────────────────────────────────────────────

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
  | { type: 'TRIP_ADD'; payload: Trip }
  | { type: 'TRIP_UPDATE'; payload: Trip }
  | { type: 'TRIP_DELETE'; payload: { id: string } }
  | { type: 'TRIP_ADD_PARTICIPANT'; payload: { tripId: string; participant: Participant } }
  | { type: 'TRIP_REMOVE_PARTICIPANT'; payload: { tripId: string; participantId: string } };

// ─── Reducer ─────────────────────────────────────────────────────────────────

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

// ─── Context ─────────────────────────────────────────────────────────────────

interface TripContextValue {
  state: TripState;
  addTrip: (data: Omit<Trip, 'id' | 'createdAt' | 'participants'>) => void;
  updateTrip: (trip: Trip) => void;
  deleteTrip: (id: string) => void;
  addParticipant: (tripId: string, name: string) => void;
  removeParticipant: (tripId: string, participantId: string) => void;
}

const TripContext = createContext<TripContextValue | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

export function TripProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tripReducer, initialState);

  // Load from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const trips: Trip[] = raw ? JSON.parse(raw) : [];
        // Ensure participants array exists on all trips (migration)
        const migrated = trips.map((t) => ({
          ...t,
          participants: t.participants ?? [],
        }));
        dispatch({ type: 'TRIPS_LOADED', payload: migrated });
      } catch {
        dispatch({ type: 'TRIPS_LOADED', payload: [] });
      }
    })();
  }, []);

  // Persist trips whenever they change
  useEffect(() => {
    if (!state.loading) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.trips)).catch(
        () => {}
      );
    }
  }, [state.trips, state.loading]);

  // ─── Action Creators ───────────────────────────────────────────────────────

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
    dispatch({ type: 'TRIP_DELETE', payload: { id } });
  }

  function addParticipant(tripId: string, name: string) {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const participant: Participant = {
      id: generateId(),
      name: trimmedName,
      avatarColor: getRandomAvatarColor(),
      tripId,
    };
    dispatch({ type: 'TRIP_ADD_PARTICIPANT', payload: { tripId, participant } });
  }

  function removeParticipant(tripId: string, participantId: string) {
    // Validate: check if participant is attached to any expense
    // At this phase expenses don't exist yet, so we allow removal freely.
    // Future phases: look up expenses by participantId here and show Alert.
    const trip = state.trips.find((t) => t.id === tripId);
    if (!trip) return;

    // Placeholder expense check (will be populated in Phase 4)
    const hasExpenses = false; // TODO: replace with real expense lookup in Phase 4
    if (hasExpenses) {
      Alert.alert(
        'Cannot Remove Participant',
        'This participant is attached to one or more expenses. Remove the expenses first.'
      );
      return;
    }

    dispatch({
      type: 'TRIP_REMOVE_PARTICIPANT',
      payload: { tripId, participantId },
    });
  }

  return (
    <TripContext.Provider
      value={{ state, addTrip, updateTrip, deleteTrip, addParticipant, removeParticipant }}
    >
      {children}
    </TripContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useTripContext(): TripContextValue {
  const ctx = useContext(TripContext);
  if (!ctx) {
    throw new Error('useTripContext must be used within a TripProvider');
  }
  return ctx;
}

export default TripContext;
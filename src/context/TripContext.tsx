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
import { generateId } from '../utils/id';
import { getRandomAvatarColor } from '../utils/avatarColors';

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
  | { type: 'TRIP_DELETE'; payload: string }
  | { type: 'TRIP_ADD_PARTICIPANT'; payload: { tripId: string; name: string } }
  | { type: 'TRIP_REMOVE_PARTICIPANT'; payload: { tripId: string; participantId: string } };

// ─── Reducer ─────────────────────────────────────────────────────────────────

function tripReducer(state: TripState, action: TripAction): TripState {
  switch (action.type) {
    case 'TRIPS_LOADED':
      return { ...state, trips: action.payload, loading: false };

    case 'TRIP_ADD':
      return { ...state, trips: [action.payload, ...state.trips] };

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
        trips: state.trips.map((trip) =>
          trip.id === tripId
            ? { ...trip, participants: [...(trip.participants || []), newParticipant] }
            : trip
        ),
      };
    }

    case 'TRIP_REMOVE_PARTICIPANT': {
      const { tripId, participantId } = action.payload;
      return {
        ...state,
        trips: state.trips.map((trip) =>
          trip.id === tripId
            ? {
                ...trip,
                participants: (trip.participants || []).filter(
                  (p) => p.id !== participantId
                ),
              }
            : trip
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
  addTrip: (data: Omit<Trip, 'id' | 'createdAt' | 'participants'>) => void;
  updateTrip: (trip: Trip) => void;
  deleteTrip: (id: string) => void;
  addParticipant: (tripId: string, name: string) => void;
  removeParticipant: (tripId: string, participantId: string, hasExpenses?: boolean) => void;
}

const TripContext = createContext<TripContextValue | undefined>(undefined);

// ─── Provider ────────────────────────────────────────────────────────────────

export function TripProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tripReducer, initialState);

  // Load from AsyncStorage on mount
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const parsed: Trip[] = JSON.parse(raw);
          // Ensure all trips have participants array
          const normalized = parsed.map((t) => ({
            ...t,
            participants: t.participants || [],
          }));
          dispatch({ type: 'TRIPS_LOADED', payload: normalized });
        } else {
          dispatch({ type: 'TRIPS_LOADED', payload: [] });
        }
      })
      .catch(() => {
        dispatch({ type: 'TRIPS_LOADED', payload: [] });
      });
  }, []);

  // Persist to AsyncStorage on change
  useEffect(() => {
    if (!state.loading) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.trips)).catch(
        () => {}
      );
    }
  }, [state.trips, state.loading]);

  const addTrip = (data: Omit<Trip, 'id' | 'createdAt' | 'participants'>) => {
    const newTrip: Trip = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      participants: [],
    };
    dispatch({ type: 'TRIP_ADD', payload: newTrip });
  };

  const updateTrip = (trip: Trip) => {
    dispatch({ type: 'TRIP_UPDATE', payload: trip });
  };

  const deleteTrip = (id: string) => {
    dispatch({ type: 'TRIP_DELETE', payload: id });
  };

  const addParticipant = (tripId: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    dispatch({ type: 'TRIP_ADD_PARTICIPANT', payload: { tripId, name: trimmed } });
  };

  const removeParticipant = (
    tripId: string,
    participantId: string,
    hasExpenses = false
  ) => {
    if (hasExpenses) {
      Alert.alert(
        'Cannot Remove Participant',
        'This participant is attached to one or more expenses. Remove their expenses first.',
        [{ text: 'OK' }]
      );
      return;
    }
    dispatch({ type: 'TRIP_REMOVE_PARTICIPANT', payload: { tripId, participantId } });
  };

  return (
    <TripContext.Provider
      value={{ state, dispatch, addTrip, updateTrip, deleteTrip, addParticipant, removeParticipant }}
    >
      {children}
    </TripContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTripContext(): TripContextValue {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTripContext must be used within TripProvider');
  return ctx;
}

export default TripContext;
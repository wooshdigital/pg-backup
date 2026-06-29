import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Trip, Participant } from '../types';
import { getRandomAvatarColor } from '../utils/avatarColors';
import { generateId } from '../utils/id';

const STORAGE_KEY = '@trips';

export type TripAction =
  | { type: 'TRIPS_LOADED'; payload: Trip[] }
  | { type: 'TRIP_ADD'; payload: Trip }
  | { type: 'TRIP_UPDATE'; payload: Trip }
  | { type: 'TRIP_DELETE'; payload: string }
  | { type: 'TRIP_ADD_PARTICIPANT'; payload: { tripId: string; participant: Participant } }
  | { type: 'TRIP_REMOVE_PARTICIPANT'; payload: { tripId: string; participantId: string } };

interface TripState {
  trips: Trip[];
  loaded: boolean;
}

interface TripContextValue {
  state: TripState;
  dispatch: React.Dispatch<TripAction>;
  addTrip: (trip: Omit<Trip, 'id' | 'createdAt' | 'participants'>) => void;
  updateTrip: (trip: Trip) => void;
  deleteTrip: (tripId: string) => void;
  addParticipant: (tripId: string, name: string) => void;
  removeParticipant: (tripId: string, participantId: string) => void;
}

function tripReducer(state: TripState, action: TripAction): TripState {
  switch (action.type) {
    case 'TRIPS_LOADED':
      return { ...state, trips: action.payload, loaded: true };

    case 'TRIP_ADD':
      return { ...state, trips: [...state.trips, action.payload] };

    case 'TRIP_UPDATE':
      return {
        ...state,
        trips: state.trips.map((t) => (t.id === action.payload.id ? action.payload : t)),
      };

    case 'TRIP_DELETE':
      return {
        ...state,
        trips: state.trips.filter((t) => t.id !== action.payload),
      };

    case 'TRIP_ADD_PARTICIPANT': {
      const { tripId, participant } = action.payload;
      return {
        ...state,
        trips: state.trips.map((t) =>
          t.id === tripId
            ? { ...t, participants: [...(t.participants || []), participant] }
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
                participants: (t.participants || []).filter((p) => p.id !== participantId),
              }
            : t
        ),
      };
    }

    default:
      return state;
  }
}

const TripContext = createContext<TripContextValue | undefined>(undefined);

export function TripProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tripReducer, { trips: [], loaded: false });

  // Load trips from storage on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed: Trip[] = JSON.parse(raw);
          // Ensure participants array exists on all trips
          const normalized = parsed.map((t) => ({
            ...t,
            participants: t.participants || [],
          }));
          dispatch({ type: 'TRIPS_LOADED', payload: normalized });
        } else {
          dispatch({ type: 'TRIPS_LOADED', payload: [] });
        }
      } catch (e) {
        console.error('Failed to load trips', e);
        dispatch({ type: 'TRIPS_LOADED', payload: [] });
      }
    })();
  }, []);

  // Persist trips whenever they change
  useEffect(() => {
    if (!state.loaded) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state.trips)).catch((e) =>
      console.error('Failed to save trips', e)
    );
  }, [state.trips, state.loaded]);

  const addTrip = (tripData: Omit<Trip, 'id' | 'createdAt' | 'participants'>) => {
    const trip: Trip = {
      ...tripData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      participants: [],
    };
    dispatch({ type: 'TRIP_ADD', payload: trip });
  };

  const updateTrip = (trip: Trip) => {
    dispatch({ type: 'TRIP_UPDATE', payload: trip });
  };

  const deleteTrip = (tripId: string) => {
    dispatch({ type: 'TRIP_DELETE', payload: tripId });
  };

  const addParticipant = (tripId: string, name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      Alert.alert('Invalid Name', 'Please enter a valid participant name.');
      return;
    }

    const participant: Participant = {
      id: generateId(),
      name: trimmedName,
      avatarColor: getRandomAvatarColor(),
      tripId,
    };

    dispatch({ type: 'TRIP_ADD_PARTICIPANT', payload: { tripId, participant } });
  };

  const removeParticipant = (tripId: string, participantId: string) => {
    // Validation: check if participant is attached to any expense
    // For now, expenses are not yet implemented (Phase 4), so we allow removal.
    // When expenses are added, check here and show alert if attached.
    const trip = state.trips.find((t) => t.id === tripId);
    if (!trip) return;

    // Placeholder check for future expense validation:
    // const isAttached = checkParticipantInExpenses(trip, participantId);
    // if (isAttached) {
    //   Alert.alert('Cannot Remove', 'This participant is attached to one or more expenses.');
    //   return;
    // }

    dispatch({ type: 'TRIP_REMOVE_PARTICIPANT', payload: { tripId, participantId } });
  };

  return (
    <TripContext.Provider value={{ state, dispatch, addTrip, updateTrip, deleteTrip, addParticipant, removeParticipant }}>
      {children}
    </TripContext.Provider>
  );
}

export function useTripContext(): TripContextValue {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTripContext must be used within TripProvider');
  return ctx;
}

export default TripContext;
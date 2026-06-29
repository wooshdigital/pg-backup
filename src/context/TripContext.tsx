import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Alert } from 'react-native';
import { Trip, Participant } from '../types';
import { generateId } from '../utils/id';
import { getRandomAvatarColor } from '../utils/avatarColors';
import { loadData, saveData } from '../utils/storage';

const STORAGE_KEY = 'trips';

// ── State ──────────────────────────────────────────────────────────────────────

interface TripState {
  trips: Trip[];
  loading: boolean;
}

const initialState: TripState = {
  trips: [],
  loading: true,
};

// ── Actions ────────────────────────────────────────────────────────────────────

type TripAction =
  | { type: 'LOAD_TRIPS'; payload: Trip[] }
  | { type: 'TRIP_ADD'; payload: Trip }
  | { type: 'TRIP_UPDATE'; payload: Trip }
  | { type: 'TRIP_DELETE'; payload: { id: string } }
  | { type: 'TRIP_ADD_PARTICIPANT'; payload: { tripId: string; participant: Participant } }
  | { type: 'TRIP_REMOVE_PARTICIPANT'; payload: { tripId: string; participantId: string } };

// ── Reducer ────────────────────────────────────────────────────────────────────

function tripReducer(state: TripState, action: TripAction): TripState {
  switch (action.type) {
    case 'LOAD_TRIPS':
      return { ...state, trips: action.payload, loading: false };

    case 'TRIP_ADD':
      return { ...state, trips: [action.payload, ...state.trips] };

    case 'TRIP_UPDATE':
      return {
        ...state,
        trips: state.trips.map(t => (t.id === action.payload.id ? action.payload : t)),
      };

    case 'TRIP_DELETE':
      return {
        ...state,
        trips: state.trips.filter(t => t.id !== action.payload.id),
      };

    case 'TRIP_ADD_PARTICIPANT': {
      const { tripId, participant } = action.payload;
      return {
        ...state,
        trips: state.trips.map(t =>
          t.id === tripId
            ? { ...t, participants: [...(t.participants ?? []), participant] }
            : t
        ),
      };
    }

    case 'TRIP_REMOVE_PARTICIPANT': {
      const { tripId, participantId } = action.payload;
      return {
        ...state,
        trips: state.trips.map(t =>
          t.id === tripId
            ? {
                ...t,
                participants: (t.participants ?? []).filter(p => p.id !== participantId),
              }
            : t
        ),
      };
    }

    default:
      return state;
  }
}

// ── Context ────────────────────────────────────────────────────────────────────

interface TripContextValue {
  state: TripState;
  dispatch: React.Dispatch<TripAction>;
  addTrip: (data: { name: string; description?: string; currency: string }) => void;
  updateTrip: (trip: Trip) => void;
  deleteTrip: (id: string) => void;
  addParticipant: (tripId: string, name: string) => void;
  removeParticipant: (tripId: string, participantId: string) => void;
}

const TripContext = createContext<TripContextValue | undefined>(undefined);

// ── Provider ───────────────────────────────────────────────────────────────────

export function TripProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(tripReducer, initialState);

  // Load persisted trips on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await loadData<Trip[]>(STORAGE_KEY);
        dispatch({ type: 'LOAD_TRIPS', payload: stored ?? [] });
      } catch {
        dispatch({ type: 'LOAD_TRIPS', payload: [] });
      }
    })();
  }, []);

  // Persist whenever trips change
  useEffect(() => {
    if (!state.loading) {
      saveData(STORAGE_KEY, state.trips).catch(() => {});
    }
  }, [state.trips, state.loading]);

  // ── Action creators ──────────────────────────────────────────────────────────

  function addTrip(data: { name: string; description?: string; currency: string }) {
    const trip: Trip = {
      id: generateId(),
      name: data.name,
      description: data.description,
      currency: data.currency,
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
    // Validate: participant not attached to any expense
    // (expenses not yet implemented – placeholder check)
    const trip = state.trips.find(t => t.id === tripId);
    if (!trip) return;

    // Future: check trip.expenses for participantId references
    // For now, always allow removal
    dispatch({ type: 'TRIP_REMOVE_PARTICIPANT', payload: { tripId, participantId } });
  }

  return (
    <TripContext.Provider
      value={{ state, dispatch, addTrip, updateTrip, deleteTrip, addParticipant, removeParticipant }}
    >
      {children}
    </TripContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useTripContext(): TripContextValue {
  const ctx = useContext(TripContext);
  if (!ctx) throw new Error('useTripContext must be used within TripProvider');
  return ctx;
}

export default TripContext;
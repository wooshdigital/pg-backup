import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { Trip, Participant, Expense } from '../types';
import { saveTrips, loadTrips } from '../utils/storage';

interface TripState {
  trips: Trip[];
  loading: boolean;
}

type TripAction =
  | { type: 'LOAD_TRIPS'; payload: Trip[] }
  | { type: 'ADD_TRIP'; payload: Trip }
  | { type: 'UPDATE_TRIP'; payload: Trip }
  | { type: 'DELETE_TRIP'; payload: string }
  | { type: 'ADD_PARTICIPANT'; payload: { tripId: string; participant: Participant } }
  | { type: 'UPDATE_PARTICIPANT'; payload: { tripId: string; participant: Participant } }
  | { type: 'DELETE_PARTICIPANT'; payload: { tripId: string; participantId: string } }
  | { type: 'TRIP_ADD_EXPENSE'; payload: { tripId: string; expense: Expense } }
  | { type: 'TRIP_UPDATE_EXPENSE'; payload: { tripId: string; expense: Expense } }
  | { type: 'TRIP_DELETE_EXPENSE'; payload: { tripId: string; expenseId: string } };

interface TripContextValue {
  state: TripState;
  dispatch: React.Dispatch<TripAction>;
  addTrip: (trip: Trip) => void;
  updateTrip: (trip: Trip) => void;
  deleteTrip: (tripId: string) => void;
  addParticipant: (tripId: string, participant: Participant) => void;
  updateParticipant: (tripId: string, participant: Participant) => void;
  deleteParticipant: (tripId: string, participantId: string) => void;
  addExpense: (tripId: string, expense: Expense) => void;
  updateExpense: (tripId: string, expense: Expense) => void;
  deleteExpense: (tripId: string, expenseId: string) => void;
  getTripById: (tripId: string) => Trip | undefined;
}

const initialState: TripState = {
  trips: [],
  loading: true,
};

function tripReducer(state: TripState, action: TripAction): TripState {
  switch (action.type) {
    case 'LOAD_TRIPS':
      return { ...state, trips: action.payload, loading: false };

    case 'ADD_TRIP':
      return { ...state, trips: [...state.trips, action.payload] };

    case 'UPDATE_TRIP':
      return {
        ...state,
        trips: state.trips.map(t => t.id === action.payload.id ? action.payload : t),
      };

    case 'DELETE_TRIP':
      return {
        ...state,
        trips: state.trips.filter(t => t.id !== action.payload),
      };

    case 'ADD_PARTICIPANT':
      return {
        ...state,
        trips: state.trips.map(t =>
          t.id === action.payload.tripId
            ? { ...t, participants: [...t.participants, action.payload.participant] }
            : t
        ),
      };

    case 'UPDATE_PARTICIPANT':
      return {
        ...state,
        trips: state.trips.map(t =>
          t.id === action.payload.tripId
            ? {
                ...t,
                participants: t.participants.map(p =>
                  p.id === action.payload.participant.id ? action.payload.participant : p
                ),
              }
            : t
        ),
      };

    case 'DELETE_PARTICIPANT':
      return {
        ...state,
        trips: state.trips.map(t =>
          t.id === action.payload.tripId
            ? {
                ...t,
                participants: t.participants.filter(p => p.id !== action.payload.participantId),
              }
            : t
        ),
      };

    case 'TRIP_ADD_EXPENSE':
      return {
        ...state,
        trips: state.trips.map(t =>
          t.id === action.payload.tripId
            ? { ...t, expenses: [...(t.expenses || []), action.payload.expense] }
            : t
        ),
      };

    case 'TRIP_UPDATE_EXPENSE':
      return {
        ...state,
        trips: state.trips.map(t =>
          t.id === action.payload.tripId
            ? {
                ...t,
                expenses: (t.expenses || []).map(e =>
                  e.id === action.payload.expense.id ? action.payload.expense : e
                ),
              }
            : t
        ),
      };

    case 'TRIP_DELETE_EXPENSE':
      return {
        ...state,
        trips: state.trips.map(t =>
          t.id === action.payload.tripId
            ? {
                ...t,
                expenses: (t.expenses || []).filter(e => e.id !== action.payload.expenseId),
              }
            : t
        ),
      };

    default:
      return state;
  }
}

const TripContext = createContext<TripContextValue | undefined>(undefined);

export function TripProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(tripReducer, initialState);

  useEffect(() => {
    async function load() {
      const trips = await loadTrips();
      dispatch({ type: 'LOAD_TRIPS', payload: trips });
    }
    load();
  }, []);

  useEffect(() => {
    if (!state.loading) {
      saveTrips(state.trips);
    }
  }, [state.trips, state.loading]);

  const addTrip = useCallback((trip: Trip) => {
    dispatch({ type: 'ADD_TRIP', payload: trip });
  }, []);

  const updateTrip = useCallback((trip: Trip) => {
    dispatch({ type: 'UPDATE_TRIP', payload: trip });
  }, []);

  const deleteTrip = useCallback((tripId: string) => {
    dispatch({ type: 'DELETE_TRIP', payload: tripId });
  }, []);

  const addParticipant = useCallback((tripId: string, participant: Participant) => {
    dispatch({ type: 'ADD_PARTICIPANT', payload: { tripId, participant } });
  }, []);

  const updateParticipant = useCallback((tripId: string, participant: Participant) => {
    dispatch({ type: 'UPDATE_PARTICIPANT', payload: { tripId, participant } });
  }, []);

  const deleteParticipant = useCallback((tripId: string, participantId: string) => {
    dispatch({ type: 'DELETE_PARTICIPANT', payload: { tripId, participantId } });
  }, []);

  const addExpense = useCallback((tripId: string, expense: Expense) => {
    dispatch({ type: 'TRIP_ADD_EXPENSE', payload: { tripId, expense } });
  }, []);

  const updateExpense = useCallback((tripId: string, expense: Expense) => {
    dispatch({ type: 'TRIP_UPDATE_EXPENSE', payload: { tripId, expense } });
  }, []);

  const deleteExpense = useCallback((tripId: string, expenseId: string) => {
    dispatch({ type: 'TRIP_DELETE_EXPENSE', payload: { tripId, expenseId } });
  }, []);

  const getTripById = useCallback((tripId: string) => {
    return state.trips.find(t => t.id === tripId);
  }, [state.trips]);

  return (
    <TripContext.Provider
      value={{
        state,
        dispatch,
        addTrip,
        updateTrip,
        deleteTrip,
        addParticipant,
        updateParticipant,
        deleteParticipant,
        addExpense,
        updateExpense,
        deleteExpense,
        getTripById,
      }}
    >
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
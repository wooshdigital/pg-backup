import { useMemo } from 'react';
import { useTripContext } from '../context/TripContext';
import { Participant } from '../types';

interface UseParticipantsReturn {
  participants: Participant[];
  addParticipant: (name: string) => void;
  removeParticipant: (participantId: string, expenseParticipantIds?: string[]) => void;
}

export function useParticipants(tripId: string): UseParticipantsReturn {
  const { state, addParticipant, removeParticipant } = useTripContext();

  const participants = useMemo<Participant[]>(() => {
    const trip = state.trips.find((t) => t.id === tripId);
    return trip?.participants ?? [];
  }, [state.trips, tripId]);

  return {
    participants,
    addParticipant: (name: string) => addParticipant(tripId, name),
    removeParticipant: (participantId: string, expenseParticipantIds?: string[]) =>
      removeParticipant(tripId, participantId, expenseParticipantIds),
  };
}
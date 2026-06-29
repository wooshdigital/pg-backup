import { useTripContext } from '../context/TripContext';
import { Participant } from '../types';

interface UseParticipantsReturn {
  participants: Participant[];
  addParticipant: (name: string) => void;
  removeParticipant: (participantId: string) => void;
}

export function useParticipants(tripId: string): UseParticipantsReturn {
  const { state, addParticipant: contextAdd, removeParticipant: contextRemove } = useTripContext();

  const trip = state.trips.find((t) => t.id === tripId);
  const participants: Participant[] = trip?.participants || [];

  const addParticipant = (name: string) => {
    contextAdd(tripId, name);
  };

  const removeParticipant = (participantId: string) => {
    contextRemove(tripId, participantId);
  };

  return { participants, addParticipant, removeParticipant };
}

export default useParticipants;
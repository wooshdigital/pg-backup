import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useTripContext } from '../context/TripContext';
import { Participant } from '../types';
import { getRandomAvatarColor } from '../utils/avatarColors';
import { generateId } from '../utils/id';

export function useParticipants(tripId: string) {
  const { state, dispatch } = useTripContext();

  const trip = state.trips.find((t) => t.id === tripId);
  const participants: Participant[] = trip?.participants ?? [];

  const addParticipant = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;

      const participant: Participant = {
        id: generateId(),
        name: trimmed,
        avatarColor: getRandomAvatarColor(),
        tripId,
      };

      dispatch({
        type: 'TRIP_ADD_PARTICIPANT',
        payload: { tripId, participant },
      });
    },
    [tripId, dispatch]
  );

  const removeParticipant = useCallback(
    (participantId: string) => {
      // Future: check if participant is attached to any expense
      // For now, always allow removal (Phase 4 will add expense validation)
      const hasExpenses = false; // placeholder for Phase 4

      if (hasExpenses) {
        Alert.alert(
          'Cannot Remove Participant',
          'This participant is attached to one or more expenses. Remove their expenses first.',
          [{ text: 'OK' }]
        );
        return;
      }

      dispatch({
        type: 'TRIP_REMOVE_PARTICIPANT',
        payload: { tripId, participantId },
      });
    },
    [tripId, dispatch]
  );

  return { participants, addParticipant, removeParticipant };
}
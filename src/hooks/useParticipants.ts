import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useTripContext } from '../context/TripContext';
import { Participant } from '../types';

export interface UseParticipantsReturn {
  participants: Participant[];
  addParticipant: (name: string) => void;
  removeParticipant: (participantId: string) => void;
}

/**
 * Returns participants for a given tripId and exposes action creators.
 * The `hasExpense` check is a stub that will be replaced in Phase 4 when
 * the expenses slice is introduced.
 */
export function useParticipants(tripId: string): UseParticipantsReturn {
  const { state, dispatch } = useTripContext();

  const trip = state.trips.find((t) => t.id === tripId);
  const participants: Participant[] = trip?.participants ?? [];

  const addParticipant = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) {
        Alert.alert('Invalid name', 'Participant name cannot be empty.');
        return;
      }
      dispatch({ type: 'TRIP_ADD_PARTICIPANT', payload: { tripId, name: trimmed } });
    },
    [dispatch, tripId]
  );

  const removeParticipant = useCallback(
    (participantId: string) => {
      // Phase 4 will inject real expense data here. For now the array is always empty.
      const expenseParticipantIds: string[] = [];

      if (expenseParticipantIds.includes(participantId)) {
        Alert.alert(
          'Cannot remove participant',
          'This participant is already attached to one or more expenses. Remove them from all expenses first.'
        );
        return;
      }

      Alert.alert(
        'Remove participant',
        'Are you sure you want to remove this participant from the trip?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Remove',
            style: 'destructive',
            onPress: () =>
              dispatch({
                type: 'TRIP_REMOVE_PARTICIPANT',
                payload: { tripId, participantId },
              }),
          },
        ]
      );
    },
    [dispatch, tripId]
  );

  return { participants, addParticipant, removeParticipant };
}
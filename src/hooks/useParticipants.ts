import { useContext } from 'react';
import { TripContext } from '../context/TripContext';
import { Participant } from '../types';

export function useParticipants(tripId: string) {
  const { state, dispatch } = useContext(TripContext);

  const trip = state.trips.find((t) => t.id === tripId);
  const participants: Participant[] = trip?.participants ?? [];

  const addParticipant = async (data: Omit<Participant, 'id' | 'tripId' | 'createdAt'>) => {
    const participant: Participant = {
      ...data,
      id: `participant_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      tripId,
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: 'TRIP_ADD_PARTICIPANT', payload: { tripId, participant } });
    return participant;
  };

  const updateParticipant = async (participant: Participant) => {
    dispatch({ type: 'TRIP_UPDATE_PARTICIPANT', payload: { tripId, participant } });
    return participant;
  };

  const deleteParticipant = async (participantId: string) => {
    dispatch({ type: 'TRIP_DELETE_PARTICIPANT', payload: { tripId, participantId } });
  };

  return { participants, addParticipant, updateParticipant, deleteParticipant };
}
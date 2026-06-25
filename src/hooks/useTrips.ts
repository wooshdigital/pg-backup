import { useTripContext } from '../context/TripContext';
import { Trip } from '../types';

interface UseTripsResult {
  trips: Trip[];
  loaded: boolean;
  addTrip: (params: Omit<Trip, 'id' | 'createdAt' | 'participantIds' | 'expenseIds'>) => void;
  deleteTrip: (id: string) => void;
  getTripById: (id: string) => Trip | undefined;
}

export const useTrips = (): UseTripsResult => {
  const { trips, loaded, addTrip, deleteTrip } = useTripContext();

  const getTripById = (id: string): Trip | undefined =>
    trips.find((t) => t.id === id);

  return { trips, loaded, addTrip, deleteTrip, getTripById };
};
import { useTripContext } from '../context/TripContext';
import { Trip } from '../types';

interface UseTripsReturn {
  trips: Trip[];
  loading: boolean;
  addTrip: (data: Omit<Trip, 'id' | 'createdAt' | 'participants'>) => void;
  updateTrip: (trip: Trip) => void;
  deleteTrip: (id: string) => void;
}

export function useTrips(): UseTripsReturn {
  const { state, addTrip, updateTrip, deleteTrip } = useTripContext();

  return {
    trips: state.trips,
    loading: state.loading,
    addTrip,
    updateTrip,
    deleteTrip,
  };
}

export default useTrips;
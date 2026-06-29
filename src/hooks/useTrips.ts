import { useTripContext } from '../context/TripContext';
import { Trip } from '../types';

interface UseTripsReturn {
  trips: Trip[];
  loaded: boolean;
  addTrip: (trip: Omit<Trip, 'id' | 'createdAt' | 'participants'>) => void;
  updateTrip: (trip: Trip) => void;
  deleteTrip: (tripId: string) => void;
}

export function useTrips(): UseTripsReturn {
  const { state, addTrip, updateTrip, deleteTrip } = useTripContext();

  return {
    trips: state.trips,
    loaded: state.loaded,
    addTrip,
    updateTrip,
    deleteTrip,
  };
}

export default useTrips;
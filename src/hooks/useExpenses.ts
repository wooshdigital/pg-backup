import { useCallback } from 'react';
import { useTrip } from '../context/TripContext';
import { Expense } from '../types';
import { generateId } from '../utils/id';

export function useExpenses(tripId: string) {
  const { trip, dispatch } = useTrip();

  const expenses: Expense[] = trip?.expenses ?? [];

  const addExpense = useCallback(
    (
      expenseData: Omit<Expense, 'id'>
    ) => {
      const expense: Expense = {
        ...expenseData,
        id: generateId(),
      };
      dispatch({ type: 'TRIP_ADD_EXPENSE', payload: { tripId, expense } });
    },
    [dispatch, tripId]
  );

  const updateExpense = useCallback(
    (expense: Expense) => {
      dispatch({ type: 'TRIP_UPDATE_EXPENSE', payload: { tripId, expense } });
    },
    [dispatch, tripId]
  );

  const deleteExpense = useCallback(
    (expenseId: string) => {
      dispatch({
        type: 'TRIP_DELETE_EXPENSE',
        payload: { tripId, expenseId },
      });
    },
    [dispatch, tripId]
  );

  return { expenses, addExpense, updateExpense, deleteExpense };
}
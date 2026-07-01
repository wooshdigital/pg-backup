import { useContext } from 'react';
import { TripContext } from '../context/TripContext';
import { Expense } from '../types';

export function useExpenses(tripId: string) {
  const { state, dispatch } = useContext(TripContext);

  const trip = state.trips.find((t) => t.id === tripId);
  const expenses: Expense[] = trip?.expenses ?? [];

  const addExpense = async (
    expenseData: Omit<Expense, 'id' | 'tripId' | 'createdAt' | 'updatedAt'>
  ) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `expense_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      tripId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    dispatch({ type: 'TRIP_ADD_EXPENSE', payload: { tripId, expense: newExpense } });
    return newExpense;
  };

  const updateExpense = async (expense: Expense) => {
    const updated = { ...expense, updatedAt: new Date().toISOString() };
    dispatch({ type: 'TRIP_UPDATE_EXPENSE', payload: { tripId, expense: updated } });
    return updated;
  };

  const deleteExpense = async (expenseId: string) => {
    dispatch({ type: 'TRIP_DELETE_EXPENSE', payload: { tripId, expenseId } });
  };

  return { expenses, addExpense, updateExpense, deleteExpense };
}
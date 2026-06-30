import { useMemo } from 'react';
import { Expense } from '../types';
import { useTripContext } from '../context/TripContext';

export interface ExpenseSection {
  title: string; // date string like "2026-06-30"
  data: Expense[];
}

export function useExpenses(tripId: string): {
  expenses: Expense[];
  sections: ExpenseSection[];
  totalAmount: number;
} {
  const { getTrip } = useTripContext();
  const trip = getTrip(tripId);
  const expenses = trip?.expenses || [];

  const { sections, totalAmount } = useMemo(() => {
    // Sort expenses by date descending, then by createdAt descending
    const sorted = [...expenses].sort((a, b) => {
      const dateDiff = b.date.localeCompare(a.date);
      if (dateDiff !== 0) return dateDiff;
      return b.createdAt.localeCompare(a.createdAt);
    });

    // Group by date
    const groupMap = new Map<string, Expense[]>();
    for (const expense of sorted) {
      const date = expense.date.slice(0, 10);
      if (!groupMap.has(date)) groupMap.set(date, []);
      groupMap.get(date)!.push(expense);
    }

    const sections: ExpenseSection[] = Array.from(groupMap.entries()).map(([title, data]) => ({
      title,
      data,
    }));

    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

    return { sections, totalAmount };
  }, [expenses]);

  return { expenses, sections, totalAmount };
}
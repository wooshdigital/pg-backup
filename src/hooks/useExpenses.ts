import { useMemo } from 'react';
import { useTripContext } from '../context/TripContext';
import { Expense } from '../types';

export interface ExpenseSection {
  title: string; // formatted date label e.g. "June 28, 2026"
  data: Expense[];
}

/**
 * Returns expenses for a given tripId, sorted descending by date,
 * and grouped into sections by date for SectionList consumption.
 */
export function useExpenses(tripId: string): {
  expenses: Expense[];
  sections: ExpenseSection[];
  total: number;
} {
  const { state } = useTripContext();

  const trip = state.trips.find((t) => t.id === tripId);
  const expenses: Expense[] = trip?.expenses || [];

  const sorted = useMemo(
    () =>
      [...expenses].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      ),
    [expenses]
  );

  const sections = useMemo<ExpenseSection[]>(() => {
    const map = new Map<string, Expense[]>();

    for (const expense of sorted) {
      const dateKey = expense.date.slice(0, 10); // YYYY-MM-DD
      if (!map.has(dateKey)) map.set(dateKey, []);
      map.get(dateKey)!.push(expense);
    }

    return Array.from(map.entries()).map(([dateKey, data]) => ({
      title: formatDateLabel(dateKey),
      data,
    }));
  }, [sorted]);

  const total = useMemo(
    () => expenses.reduce((sum, e) => sum + e.amount, 0),
    [expenses]
  );

  return { expenses: sorted, sections, total };
}

function formatDateLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}
import { useMemo } from 'react';
import { useTripContext } from '../context/TripContext';
import { Expense } from '../types';

export interface ExpenseSection {
  title: string; // date string formatted for display
  date: string;  // raw date string for sorting
  data: Expense[];
}

/**
 * Returns expenses for a given tripId, sorted descending by date,
 * and grouped into sections by date for use with SectionList.
 */
export function useExpenses(tripId: string): {
  expenses: Expense[];
  sections: ExpenseSection[];
  totalAmount: number;
} {
  const { getTripById } = useTripContext();

  return useMemo(() => {
    const trip = getTripById(tripId);
    const expenses: Expense[] = trip?.expenses || [];

    // Sort expenses by date descending, then by createdAt descending
    const sorted = [...expenses].sort((a, b) => {
      const dateCmp = b.date.localeCompare(a.date);
      if (dateCmp !== 0) return dateCmp;
      return b.createdAt.localeCompare(a.createdAt);
    });

    // Group by date
    const groups = new Map<string, Expense[]>();
    for (const expense of sorted) {
      const dateKey = expense.date.substring(0, 10); // YYYY-MM-DD
      if (!groups.has(dateKey)) {
        groups.set(dateKey, []);
      }
      groups.get(dateKey)!.push(expense);
    }

    const sections: ExpenseSection[] = Array.from(groups.entries()).map(([date, data]) => ({
      title: formatSectionDate(date),
      date,
      data,
    }));

    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

    return { expenses: sorted, sections, totalAmount };
  }, [getTripById, tripId]);
}

function formatSectionDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isToday = dateStr === today.toISOString().substring(0, 10);
  const isYesterday = dateStr === yesterday.toISOString().substring(0, 10);

  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
}
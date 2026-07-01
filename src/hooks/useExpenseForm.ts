import { useState, useCallback, useContext, useEffect } from 'react';
import { TripContext } from '../context/TripContext';
import {
  calculateEqualSplit,
  validateCustomSplits,
  adjustLastParticipant,
  roundCurrency,
} from '../utils/splitCalculator';
import type { SplitType } from '../components/expenses/SplitTypeToggle';
import type { Expense } from '../types';

export type ExpenseFormStep = 1 | 2 | 3;

export interface ExpenseFormValues {
  description: string;
  amount: string;
  currency: string;
  paidBy: string;
  selectedParticipants: string[];
  splitType: SplitType;
  customSplits: Record<string, string>;
  date: string;
  category: string;
}

interface UseExpenseFormOptions {
  tripId: string;
  expenseId?: string;
  onSuccess?: () => void;
}

const DEFAULT_VALUES: ExpenseFormValues = {
  description: '',
  amount: '',
  currency: 'USD',
  paidBy: '',
  selectedParticipants: [],
  splitType: 'equal',
  customSplits: {},
  date: new Date().toISOString().split('T')[0],
  category: 'general',
};

export function useExpenseForm({
  tripId,
  expenseId,
  onSuccess,
}: UseExpenseFormOptions) {
  const { state, dispatch } = useContext(TripContext);
  const trip = state.trips.find((t) => t.id === tripId);
  const participants = trip?.participants ?? [];

  const isEditing = Boolean(expenseId);

  const [step, setStep] = useState<ExpenseFormStep>(1);
  const [values, setValues] = useState<ExpenseFormValues>(() => {
    if (expenseId && trip) {
      const expense = trip.expenses?.find((e: Expense) => e.id === expenseId);
      if (expense) {
        const customSplits: Record<string, string> = {};
        if (expense.splits) {
          for (const split of expense.splits) {
            customSplits[split.participantId] = String(split.amount);
          }
        }
        return {
          description: expense.description ?? '',
          amount: String(expense.amount ?? ''),
          currency: expense.currency ?? 'USD',
          paidBy: expense.paidBy ?? '',
          selectedParticipants: expense.splits
            ? expense.splits.map((s: any) => s.participantId)
            : [],
          splitType: expense.splitType ?? 'equal',
          customSplits,
          date: expense.date
            ? expense.date.split('T')[0]
            : new Date().toISOString().split('T')[0],
          category: expense.category ?? 'general',
        };
      }
    }
    return {
      ...DEFAULT_VALUES,
      currency: trip?.currency ?? 'USD',
      paidBy: participants[0]?.id ?? '',
      selectedParticipants: participants.map((p) => p.id),
    };
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ExpenseFormValues, string>>>({});

  const setValue = useCallback(
    <K extends keyof ExpenseFormValues>(key: K, value: ExpenseFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    },
    []
  );

  const setCustomSplitAmount = useCallback(
    (participantId: string, value: string) => {
      setValues((prev) => ({
        ...prev,
        customSplits: {
          ...prev.customSplits,
          [participantId]: value,
        },
      }));
    },
    []
  );

  const applyAutoAdjust = useCallback(() => {
    const total = parseFloat(values.amount) || 0;
    const numericSplits: Record<string, number> = {};
    for (const [id, val] of Object.entries(values.customSplits)) {
      numericSplits[id] = parseFloat(val) || 0;
    }
    const adjusted = adjustLastParticipant(
      numericSplits,
      total,
      values.selectedParticipants
    );
    const stringified: Record<string, string> = {};
    for (const [id, val] of Object.entries(adjusted)) {
      stringified[id] = val.toFixed(2);
    }
    setValues((prev) => ({ ...prev, customSplits: stringified }));
  }, [values.amount, values.customSplits, values.selectedParticipants]);

  const getCustomSplitDiff = useCallback(() => {
    const total = parseFloat(values.amount) || 0;
    const numericSplits: Record<string, number> = {};
    for (const id of values.selectedParticipants) {
      numericSplits[id] = parseFloat(values.customSplits[id] ?? '0') || 0;
    }
    return validateCustomSplits(numericSplits, total);
  }, [values.amount, values.customSplits, values.selectedParticipants]);

  const validateStep = useCallback(
    (s: ExpenseFormStep): boolean => {
      const newErrors: Partial<Record<keyof ExpenseFormValues, string>> = {};

      if (s === 1) {
        if (!values.description.trim()) {
          newErrors.description = 'Description is required';
        }
        const amt = parseFloat(values.amount);
        if (!values.amount || isNaN(amt) || amt <= 0) {
          newErrors.amount = 'Enter a valid amount greater than 0';
        }
      }

      if (s === 2) {
        if (!values.paidBy) {
          newErrors.paidBy = 'Select who paid';
        }
      }

      if (s === 3) {
        if (values.selectedParticipants.length === 0) {
          newErrors.selectedParticipants = 'Select at least one participant';
        }
        if (values.splitType === 'custom') {
          const { valid } = getCustomSplitDiff();
          if (!valid) {
            newErrors.customSplits = 'Custom splits must equal the total amount';
          }
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [values, getCustomSplitDiff]
  );

  const nextStep = useCallback(() => {
    if (validateStep(step)) {
      setStep((s) => (s < 3 ? ((s + 1) as ExpenseFormStep) : s));
    }
  }, [step, validateStep]);

  const prevStep = useCallback(() => {
    setStep((s) => (s > 1 ? ((s - 1) as ExpenseFormStep) : s));
    setErrors({});
  }, []);

  const computeSplits = useCallback(() => {
    const total = parseFloat(values.amount) || 0;
    if (values.splitType === 'equal') {
      return calculateEqualSplit(total, values.selectedParticipants);
    }
    return values.selectedParticipants.map((id) => ({
      participantId: id,
      amount: roundCurrency(parseFloat(values.customSplits[id] ?? '0') || 0),
    }));
  }, [values]);

  const submit = useCallback(() => {
    if (!validateStep(3)) return;

    const splits = computeSplits();
    const total = parseFloat(values.amount) || 0;

    if (isEditing && expenseId) {
      dispatch({
        type: 'TRIP_UPDATE_EXPENSE',
        payload: {
          tripId,
          expense: {
            id: expenseId,
            description: values.description.trim(),
            amount: total,
            currency: values.currency,
            paidBy: values.paidBy,
            splits,
            splitType: values.splitType,
            date: values.date,
            category: values.category,
          },
        },
      });
    } else {
      dispatch({
        type: 'TRIP_ADD_EXPENSE',
        payload: {
          tripId,
          expense: {
            id: `expense_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            description: values.description.trim(),
            amount: total,
            currency: values.currency,
            paidBy: values.paidBy,
            splits,
            splitType: values.splitType,
            date: values.date,
            category: values.category,
          },
        },
      });
    }

    onSuccess?.();
  }, [validateStep, computeSplits, values, isEditing, expenseId, tripId, dispatch, onSuccess]);

  return {
    step,
    values,
    errors,
    isEditing,
    participants,
    trip,
    setValue,
    setCustomSplitAmount,
    applyAutoAdjust,
    getCustomSplitDiff,
    nextStep,
    prevStep,
    submit,
    validateStep,
  };
}
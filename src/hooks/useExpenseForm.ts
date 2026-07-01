import { useState, useCallback, useEffect } from 'react';
import { useTrip } from '../context/TripContext';
import { calculateEqualSplits, validateCustomSplits, adjustLastParticipant, roundCurrency } from '../utils/splitCalculator';
import type { SplitType } from '../components/expenses/SplitTypeToggle';

export interface ExpenseFormValues {
  description: string;
  amount: string;
  currency: string;
  paidById: string;
  selectedParticipantIds: string[];
  splitType: SplitType;
  customSplits: Record<string, string>; // participantId -> amount string
  date: string;
  category: string;
  notes: string;
}

const DEFAULT_VALUES: ExpenseFormValues = {
  description: '',
  amount: '',
  currency: 'USD',
  paidById: '',
  selectedParticipantIds: [],
  splitType: 'equal',
  customSplits: {},
  date: new Date().toISOString().split('T')[0],
  category: '',
  notes: '',
};

export interface UseExpenseFormOptions {
  tripId: string;
  expenseId?: string;
  onSuccess?: () => void;
}

export interface UseExpenseFormReturn {
  step: number;
  values: ExpenseFormValues;
  errors: Partial<Record<keyof ExpenseFormValues, string>>;
  isEditing: boolean;
  isValid: boolean;
  splitDifference: number;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateField: <K extends keyof ExpenseFormValues>(field: K, value: ExpenseFormValues[K]) => void;
  toggleParticipant: (participantId: string) => void;
  updateCustomSplit: (participantId: string, amount: string) => void;
  handleSplitTypeChange: (type: SplitType) => void;
  submit: () => void;
  canProceed: boolean;
}

export function useExpenseForm({ tripId, expenseId, onSuccess }: UseExpenseFormOptions): UseExpenseFormReturn {
  const { state, dispatch } = useTrip();
  const trip = state.trips.find((t) => t.id === tripId);
  const isEditing = Boolean(expenseId);

  const [step, setStep] = useState(1);
  const [values, setValues] = useState<ExpenseFormValues>(() => {
    if (expenseId && trip) {
      const expense = trip.expenses?.find((e: any) => e.id === expenseId);
      if (expense) {
        const customSplits: Record<string, string> = {};
        if (expense.splits) {
          expense.splits.forEach((s: any) => {
            customSplits[s.participantId] = s.amount.toString();
          });
        }
        return {
          description: expense.description || '',
          amount: expense.amount?.toString() || '',
          currency: expense.currency || 'USD',
          paidById: expense.paidById || '',
          selectedParticipantIds: expense.splits?.map((s: any) => s.participantId) || [],
          splitType: expense.splitType || 'equal',
          customSplits,
          date: expense.date || new Date().toISOString().split('T')[0],
          category: expense.category || '',
          notes: expense.notes || '',
        };
      }
    }
    return {
      ...DEFAULT_VALUES,
      currency: trip?.currency || 'USD',
      paidById: trip?.participants?.[0]?.id || '',
      selectedParticipantIds: trip?.participants?.map((p: any) => p.id) || [],
    };
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ExpenseFormValues, string>>>({});

  // Compute split difference for custom splits
  const numericAmount = parseFloat(values.amount) || 0;
  const assignedTotal = values.selectedParticipantIds.reduce((sum, id) => {
    return sum + (parseFloat(values.customSplits[id] || '0') || 0);
  }, 0);
  const splitDifference = roundCurrency(numericAmount - assignedTotal);

  const canProceedStep1 = Boolean(values.description.trim() && values.amount && parseFloat(values.amount) > 0);
  const canProceedStep2 = Boolean(values.paidById);
  const canProceedStep3 =
    values.selectedParticipantIds.length > 0 &&
    (values.splitType === 'equal' || Math.abs(splitDifference) < 0.001);

  const canProceed =
    step === 1 ? canProceedStep1 :
    step === 2 ? canProceedStep2 :
    canProceedStep3;

  const updateField = useCallback(<K extends keyof ExpenseFormValues>(
    field: K,
    value: ExpenseFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  }, []);

  const toggleParticipant = useCallback((participantId: string) => {
    setValues((prev) => {
      const ids = prev.selectedParticipantIds;
      const next = ids.includes(participantId)
        ? ids.filter((id) => id !== participantId)
        : [...ids, participantId];

      // Reset custom splits for removed participant; initialize for added one
      const customSplits = { ...prev.customSplits };
      if (ids.includes(participantId)) {
        delete customSplits[participantId];
      } else {
        customSplits[participantId] = '';
      }

      return { ...prev, selectedParticipantIds: next, customSplits };
    });
  }, []);

  const updateCustomSplit = useCallback((participantId: string, amount: string) => {
    setValues((prev) => ({
      ...prev,
      customSplits: { ...prev.customSplits, [participantId]: amount },
    }));
  }, []);

  const handleSplitTypeChange = useCallback((type: SplitType) => {
    setValues((prev) => {
      if (type === 'equal') {
        return { ...prev, splitType: type, customSplits: {} };
      }
      // Initialize custom splits with equal amounts when switching to custom
      const total = parseFloat(prev.amount) || 0;
      const equalSplits = calculateEqualSplits(prev.selectedParticipantIds, total);
      const customSplits: Record<string, string> = {};
      equalSplits.forEach((s) => {
        customSplits[s.participantId] = s.amount > 0 ? s.amount.toString() : '';
      });
      return { ...prev, splitType: type, customSplits };
    });
  }, []);

  const nextStep = useCallback(() => {
    setStep((s) => Math.min(s + 1, 3));
  }, []);

  const prevStep = useCallback(() => {
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  const isValid =
    canProceedStep1 &&
    canProceedStep2 &&
    canProceedStep3;

  const submit = useCallback(() => {
    if (!isValid) return;

    const total = parseFloat(values.amount);
    let splits;

    if (values.splitType === 'equal') {
      splits = calculateEqualSplits(values.selectedParticipantIds, total);
    } else {
      // Use adjusted last participant to handle rounding
      const rawSplits = values.selectedParticipantIds.map((id) => ({
        participantId: id,
        amount: parseFloat(values.customSplits[id] || '0') || 0,
      }));
      const adjusted = adjustLastParticipant(rawSplits, total);
      splits = adjusted;
    }

    const expenseData = {
      id: expenseId || `expense-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      description: values.description.trim(),
      amount: total,
      currency: values.currency,
      paidById: values.paidById,
      splits,
      splitType: values.splitType,
      date: values.date,
      category: values.category,
      notes: values.notes,
      createdAt: isEditing ? undefined : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isEditing) {
      dispatch({
        type: 'TRIP_UPDATE_EXPENSE',
        payload: { tripId, expense: expenseData },
      });
    } else {
      dispatch({
        type: 'TRIP_ADD_EXPENSE',
        payload: { tripId, expense: expenseData },
      });
    }

    onSuccess?.();
  }, [isValid, values, tripId, expenseId, isEditing, dispatch, onSuccess]);

  return {
    step,
    values,
    errors,
    isEditing,
    isValid,
    splitDifference,
    setStep,
    nextStep,
    prevStep,
    updateField,
    toggleParticipant,
    updateCustomSplit,
    handleSplitTypeChange,
    submit,
    canProceed,
  };
}
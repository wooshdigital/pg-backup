import { useState, useCallback, useEffect } from 'react';
import { useTrips } from './useTrips';
import { useExpenses } from './useExpenses';
import { useParticipants } from './useParticipants';
import {
  calculateEqualSplits,
  adjustLastParticipant,
  validateCustomSplits,
  roundCurrency,
  Split,
} from '../utils/splitCalculator';
import { Expense } from '../types';

export type SplitType = 'equal' | 'custom';

export interface ExpenseFormValues {
  description: string;
  amount: string;
  currency: string;
  paidById: string;
  selectedParticipantIds: string[];
  splitType: SplitType;
  customSplits: Split[];
  date: string;
  notes: string;
}

const defaultValues = (): ExpenseFormValues => ({
  description: '',
  amount: '',
  currency: 'USD',
  paidById: '',
  selectedParticipantIds: [],
  splitType: 'equal',
  customSplits: [],
  date: new Date().toISOString().split('T')[0],
  notes: '',
});

function expenseToFormValues(expense: Expense): ExpenseFormValues {
  const splitType: SplitType =
    expense.splitType === 'custom' ? 'custom' : 'equal';
  return {
    description: expense.description,
    amount: expense.amount.toString(),
    currency: expense.currency,
    paidById: expense.paidById,
    selectedParticipantIds: expense.splits.map((s) => s.participantId),
    splitType,
    customSplits: expense.splits.map((s) => ({
      participantId: s.participantId,
      amount: s.amount,
    })),
    date: expense.date
      ? new Date(expense.date).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0],
    notes: expense.notes || '',
  };
}

export function useExpenseForm(tripId: string, expenseId?: string) {
  const { participants } = useParticipants(tripId);
  const { expenses, addExpense, updateExpense } = useExpenses(tripId);

  const existingExpense = expenseId
    ? expenses.find((e) => e.id === expenseId)
    : undefined;

  const [step, setStep] = useState(1);
  const [values, setValues] = useState<ExpenseFormValues>(
    existingExpense ? expenseToFormValues(existingExpense) : defaultValues()
  );
  const [errors, setErrors] = useState<Partial<Record<keyof ExpenseFormValues, string>>>({});

  // Re-populate when existing expense loads (async)
  useEffect(() => {
    if (existingExpense) {
      setValues(expenseToFormValues(existingExpense));
    }
  }, [existingExpense?.id]);

  const setValue = useCallback(
    <K extends keyof ExpenseFormValues>(key: K, value: ExpenseFormValues[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    },
    []
  );

  // Sync customSplits when participants or splitType change
  const syncCustomSplits = useCallback(
    (participantIds: string[], total: number, currentSplits: Split[], splitType: SplitType) => {
      if (splitType !== 'custom') return currentSplits;

      // Build new splits preserving existing amounts
      const parsed = parseFloat(total.toString()) || 0;
      const newSplits: Split[] = participantIds.map((id) => {
        const existing = currentSplits.find((s) => s.participantId === id);
        return { participantId: id, amount: existing ? existing.amount : 0 };
      });
      return newSplits;
    },
    []
  );

  const handleParticipantToggle = useCallback(
    (participantId: string) => {
      setValues((prev) => {
        const isSelected = prev.selectedParticipantIds.includes(participantId);
        const updatedIds = isSelected
          ? prev.selectedParticipantIds.filter((id) => id !== participantId)
          : [...prev.selectedParticipantIds, participantId];

        const updatedSplits = syncCustomSplits(
          updatedIds,
          parseFloat(prev.amount) || 0,
          prev.customSplits,
          prev.splitType
        );

        return {
          ...prev,
          selectedParticipantIds: updatedIds,
          customSplits: updatedSplits,
        };
      });
    },
    [syncCustomSplits]
  );

  const handleSplitTypeChange = useCallback(
    (splitType: SplitType) => {
      setValues((prev) => {
        const parsed = parseFloat(prev.amount) || 0;
        let customSplits = prev.customSplits;

        if (splitType === 'custom') {
          // Initialize with equal amounts
          const equalSplits = calculateEqualSplits(
            participants.filter((p) =>
              prev.selectedParticipantIds.includes(p.id)
            ),
            parsed
          );
          customSplits = equalSplits;
        }

        return { ...prev, splitType, customSplits };
      });
    },
    [participants]
  );

  const handleCustomSplitChange = useCallback(
    (participantId: string, amountStr: string) => {
      setValues((prev) => {
        const updated = prev.customSplits.map((s) =>
          s.participantId === participantId
            ? { ...s, amount: parseFloat(amountStr) || 0 }
            : s
        );
        return { ...prev, customSplits: updated };
      });
    },
    []
  );

  const handleAutoAdjustLast = useCallback(() => {
    setValues((prev) => {
      const total = parseFloat(prev.amount) || 0;
      const adjusted = adjustLastParticipant(prev.customSplits, total);
      return { ...prev, customSplits: adjusted };
    });
  }, []);

  // Validation per step
  const validateStep = useCallback(
    (currentStep: number): boolean => {
      const newErrors: Partial<Record<keyof ExpenseFormValues, string>> = {};

      if (currentStep === 1) {
        if (!values.description.trim()) {
          newErrors.description = 'Description is required';
        }
        if (!values.amount || isNaN(parseFloat(values.amount)) || parseFloat(values.amount) <= 0) {
          newErrors.amount = 'A valid amount is required';
        }
      }

      if (currentStep === 2) {
        if (!values.paidById) {
          newErrors.paidById = 'Please select who paid';
        }
      }

      if (currentStep === 3) {
        if (values.selectedParticipantIds.length === 0) {
          newErrors.selectedParticipantIds = 'Select at least one participant';
        }
        if (values.splitType === 'custom') {
          const total = parseFloat(values.amount) || 0;
          const { valid } = validateCustomSplits(values.customSplits, total);
          if (!valid) {
            newErrors.customSplits = 'Custom splits must equal the total amount';
          }
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [values]
  );

  const goNext = useCallback(() => {
    if (validateStep(step)) {
      setStep((s) => Math.min(s + 1, 3));
    }
  }, [step, validateStep]);

  const goBack = useCallback(() => {
    setStep((s) => Math.max(s - 1, 1));
  }, []);

  const getSplitsForSubmit = useCallback((): Split[] => {
    const total = parseFloat(values.amount) || 0;
    const selectedParticipants = participants.filter((p) =>
      values.selectedParticipantIds.includes(p.id)
    );

    if (values.splitType === 'equal') {
      return calculateEqualSplits(selectedParticipants, total);
    }
    return values.customSplits;
  }, [values, participants]);

  const handleSubmit = useCallback(async (): Promise<boolean> => {
    if (!validateStep(3)) return false;

    const total = parseFloat(values.amount) || 0;
    const splits = getSplitsForSubmit();

    const expenseData = {
      description: values.description.trim(),
      amount: total,
      currency: values.currency,
      paidById: values.paidById,
      splits,
      splitType: values.splitType,
      date: values.date,
      notes: values.notes.trim(),
    };

    try {
      if (existingExpense) {
        await updateExpense({ ...existingExpense, ...expenseData });
      } else {
        await addExpense(expenseData);
      }
      return true;
    } catch (e) {
      return false;
    }
  }, [values, existingExpense, addExpense, updateExpense, validateStep, getSplitsForSubmit]);

  const splitDiff = (() => {
    if (values.splitType !== 'custom') return 0;
    const total = parseFloat(values.amount) || 0;
    const { diff } = validateCustomSplits(values.customSplits, total);
    return diff;
  })();

  return {
    step,
    values,
    errors,
    participants,
    existingExpense,
    splitDiff,
    setValue,
    handleParticipantToggle,
    handleSplitTypeChange,
    handleCustomSplitChange,
    handleAutoAdjustLast,
    goNext,
    goBack,
    validateStep,
    handleSubmit,
  };
}
import { useState, useCallback, useContext } from 'react';
import { TripContext } from '../context/TripContext';
import {
  calculateEqualSplits,
  validateCustomSplits,
  adjustLastParticipant,
  initializeCustomSplits,
  roundCurrency,
} from '../utils/splitCalculator';
import type { Split } from '../utils/splitCalculator';
import type { SplitType } from '../components/expenses/SplitTypeToggle';
import type { Expense } from '../types';

export interface ExpenseFormValues {
  description: string;
  amount: string;
  currency: string;
  paidBy: string;
  selectedParticipants: string[];
  splitType: SplitType;
  customSplits: Split[];
}

interface UseExpenseFormOptions {
  tripId: string;
  existingExpense?: Expense | null;
  defaultCurrency?: string;
  participantIds?: string[];
  onSuccess?: () => void;
}

function getInitialValues(
  existingExpense: Expense | null | undefined,
  defaultCurrency: string,
  participantIds: string[]
): ExpenseFormValues {
  if (existingExpense) {
    const hasCustomSplits = existingExpense.splits &&
      existingExpense.splits.length > 0 &&
      existingExpense.splits.some(s => {
        const equalAmount = roundCurrency(existingExpense.amount / existingExpense.splits.length);
        return Math.abs(s.amount - equalAmount) > 0.01;
      });

    return {
      description: existingExpense.description,
      amount: existingExpense.amount.toFixed(2),
      currency: existingExpense.currency || defaultCurrency,
      paidBy: existingExpense.paidBy,
      selectedParticipants: existingExpense.splits
        ? existingExpense.splits.map(s => s.participantId)
        : participantIds,
      splitType: hasCustomSplits ? 'custom' : 'equal',
      customSplits: existingExpense.splits || [],
    };
  }

  return {
    description: '',
    amount: '',
    currency: defaultCurrency,
    paidBy: participantIds[0] || '',
    selectedParticipants: [...participantIds],
    splitType: 'equal',
    customSplits: [],
  };
}

export function useExpenseForm({
  tripId,
  existingExpense,
  defaultCurrency = 'USD',
  participantIds = [],
  onSuccess,
}: UseExpenseFormOptions) {
  const { dispatch } = useContext(TripContext);

  const [step, setStep] = useState(1);
  const [values, setValues] = useState<ExpenseFormValues>(() =>
    getInitialValues(existingExpense, defaultCurrency, participantIds)
  );
  const [errors, setErrors] = useState<Partial<Record<keyof ExpenseFormValues, string>>>({});

  const isEditing = !!existingExpense;

  const updateValue = useCallback(<K extends keyof ExpenseFormValues>(
    key: K,
    value: ExpenseFormValues[K]
  ) => {
    setValues(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  }, []);

  const handleParticipantToggle = useCallback((participantId: string) => {
    setValues(prev => {
      const isSelected = prev.selectedParticipants.includes(participantId);
      const newSelected = isSelected
        ? prev.selectedParticipants.filter(id => id !== participantId)
        : [...prev.selectedParticipants, participantId];

      // Recalculate splits when participants change
      const total = parseFloat(prev.amount) || 0;
      const newSplits = prev.splitType === 'custom'
        ? initializeCustomSplits(newSelected, total, prev.customSplits)
        : calculateEqualSplits(newSelected, total);

      return {
        ...prev,
        selectedParticipants: newSelected,
        customSplits: newSplits,
      };
    });
  }, []);

  const handleSplitTypeChange = useCallback((splitType: SplitType) => {
    setValues(prev => {
      const total = parseFloat(prev.amount) || 0;
      const newSplits = splitType === 'custom'
        ? initializeCustomSplits(prev.selectedParticipants, total, prev.customSplits)
        : calculateEqualSplits(prev.selectedParticipants, total);

      return {
        ...prev,
        splitType,
        customSplits: newSplits,
      };
    });
  }, []);

  const handleCustomSplitChange = useCallback((participantId: string, amount: number) => {
    setValues(prev => {
      const newSplits = prev.customSplits.map(s =>
        s.participantId === participantId ? { ...s, amount } : s
      );
      return { ...prev, customSplits: newSplits };
    });
    setErrors(prev => ({ ...prev, customSplits: undefined }));
  }, []);

  const handleAutoAdjust = useCallback(() => {
    setValues(prev => {
      const total = parseFloat(prev.amount) || 0;
      const adjusted = adjustLastParticipant(prev.customSplits, total);
      return { ...prev, customSplits: adjusted };
    });
  }, []);

  const validateStep = useCallback((stepNumber: number): boolean => {
    const newErrors: Partial<Record<keyof ExpenseFormValues, string>> = {};

    if (stepNumber === 1) {
      if (!values.description.trim()) {
        newErrors.description = 'Description is required';
      }
      const amt = parseFloat(values.amount);
      if (!values.amount || isNaN(amt) || amt <= 0) {
        newErrors.amount = 'Enter a valid amount greater than 0';
      }
      if (!values.paidBy) {
        newErrors.paidBy = 'Select who paid';
      }
    }

    if (stepNumber === 2) {
      if (values.selectedParticipants.length === 0) {
        newErrors.selectedParticipants = 'Select at least one participant';
      }
    }

    if (stepNumber === 3 && values.splitType === 'custom') {
      const total = parseFloat(values.amount) || 0;
      const error = validateCustomSplits(values.customSplits, total);
      if (error) {
        newErrors.customSplits = error;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values]);

  const goToStep = useCallback((targetStep: number) => {
    if (targetStep > step && !validateStep(step)) return;
    setStep(targetStep);
  }, [step, validateStep]);

  const nextStep = useCallback(() => {
    if (validateStep(step)) {
      if (step < 3) {
        // When moving to step 3, initialize splits if needed
        if (step === 2) {
          setValues(prev => {
            const total = parseFloat(prev.amount) || 0;
            const hasValidSplits = prev.customSplits.length === prev.selectedParticipants.length &&
              prev.customSplits.every(s => prev.selectedParticipants.includes(s.participantId));

            if (!hasValidSplits) {
              return {
                ...prev,
                customSplits: prev.splitType === 'custom'
                  ? initializeCustomSplits(prev.selectedParticipants, total)
                  : calculateEqualSplits(prev.selectedParticipants, total),
              };
            }
            return prev;
          });
        }
        setStep(prev => prev + 1);
      }
    }
  }, [step, validateStep]);

  const prevStep = useCallback(() => {
    setStep(prev => Math.max(1, prev - 1));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!validateStep(step)) return;

    const total = parseFloat(values.amount) || 0;
    const splits = values.splitType === 'equal'
      ? calculateEqualSplits(values.selectedParticipants, total)
      : values.customSplits;

    const error = validateCustomSplits(splits, total);
    if (error) {
      setErrors(prev => ({ ...prev, customSplits: error }));
      return;
    }

    if (isEditing && existingExpense) {
      dispatch({
        type: 'TRIP_UPDATE_EXPENSE',
        payload: {
          tripId,
          expense: {
            ...existingExpense,
            description: values.description.trim(),
            amount: total,
            currency: values.currency,
            paidBy: values.paidBy,
            splits,
          },
        },
      });
    } else {
      dispatch({
        type: 'TRIP_ADD_EXPENSE',
        payload: {
          tripId,
          expense: {
            id: Date.now().toString(),
            description: values.description.trim(),
            amount: total,
            currency: values.currency,
            paidBy: values.paidBy,
            splits,
            createdAt: new Date().toISOString(),
          },
        },
      });
    }

    onSuccess?.();
  }, [step, values, isEditing, existingExpense, tripId, dispatch, validateStep, onSuccess]);

  return {
    step,
    values,
    errors,
    isEditing,
    updateValue,
    handleParticipantToggle,
    handleSplitTypeChange,
    handleCustomSplitChange,
    handleAutoAdjust,
    nextStep,
    prevStep,
    goToStep,
    handleSubmit,
  };
}
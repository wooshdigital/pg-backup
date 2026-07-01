import { useState, useCallback, useEffect } from 'react';
import { Expense, Participant } from '../types';
import {
  calculateEqualSplits,
  adjustLastParticipant,
  validateCustomSplits,
  roundCurrency,
  Split,
} from '../utils/splitCalculator';

export type SplitType = 'equal' | 'custom';

export interface ExpenseFormValues {
  description: string;
  amount: string;
  currency: string;
  paidById: string;
  selectedParticipantIds: string[];
  splitType: SplitType;
  customSplits: Split[];
}

export interface UseExpenseFormOptions {
  participants: Participant[];
  tripCurrency: string;
  existingExpense?: Expense | null;
  onSubmit: (values: ExpenseFormValues, splits: Split[]) => void;
}

export function useExpenseForm({
  participants,
  tripCurrency,
  existingExpense,
  onSubmit,
}: UseExpenseFormOptions) {
  const [step, setStep] = useState(1);

  const getInitialValues = (): ExpenseFormValues => {
    if (existingExpense) {
      const existingSplits: Split[] = existingExpense.splits
        ? existingExpense.splits.map((s: any) => ({
            participantId: s.participantId,
            amount: s.amount,
          }))
        : [];
      const selectedIds = existingSplits.map((s) => s.participantId);
      // Detect if it's a custom split (not perfectly equal)
      const equalAmounts = calculateEqualSplits(selectedIds, existingExpense.amount);
      const isCustom = existingSplits.some((s, i) => {
        const eq = equalAmounts.find((e) => e.participantId === s.participantId);
        return eq && Math.abs(eq.amount - s.amount) > 0.001;
      });
      return {
        description: existingExpense.description,
        amount: String(existingExpense.amount),
        currency: existingExpense.currency || tripCurrency,
        paidById: existingExpense.paidById,
        selectedParticipantIds: selectedIds,
        splitType: isCustom ? 'custom' : 'equal',
        customSplits: existingSplits,
      };
    }
    return {
      description: '',
      amount: '',
      currency: tripCurrency,
      paidById: participants.length > 0 ? participants[0].id : '',
      selectedParticipantIds: participants.map((p) => p.id),
      splitType: 'equal',
      customSplits: [],
    };
  };

  const [values, setValues] = useState<ExpenseFormValues>(getInitialValues);

  // Reset form when existingExpense changes (e.g. navigation)
  useEffect(() => {
    setValues(getInitialValues());
    setStep(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingExpense?.id]);

  // Sync customSplits when participants/amount/splitType changes
  useEffect(() => {
    if (values.splitType === 'equal') return;
    const amount = parseFloat(values.amount) || 0;
    if (amount <= 0) return;
    // Build customSplits preserving existing values for selected participants
    const newSplits = values.selectedParticipantIds.map((id) => {
      const existing = values.customSplits.find((s) => s.participantId === id);
      return existing || { participantId: id, amount: 0 };
    });
    setValues((prev) => ({ ...prev, customSplits: newSplits }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.selectedParticipantIds, values.splitType]);

  const setField = useCallback(<K extends keyof ExpenseFormValues>(
    key: K,
    value: ExpenseFormValues[K]
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleParticipant = useCallback((id: string) => {
    setValues((prev) => {
      const selected = prev.selectedParticipantIds.includes(id)
        ? prev.selectedParticipantIds.filter((pid) => pid !== id)
        : [...prev.selectedParticipantIds, id];
      return { ...prev, selectedParticipantIds: selected };
    });
  }, []);

  const setCustomSplitAmount = useCallback((participantId: string, amount: number) => {
    setValues((prev) => {
      const splits = prev.customSplits.map((s) =>
        s.participantId === participantId ? { ...s, amount } : s
      );
      return { ...prev, customSplits: splits };
    });
  }, []);

  const autoAdjustLastParticipant = useCallback(() => {
    const amount = parseFloat(values.amount) || 0;
    if (amount <= 0 || values.customSplits.length === 0) return;
    const adjusted = adjustLastParticipant(values.customSplits, amount);
    setValues((prev) => ({ ...prev, customSplits: adjusted }));
  }, [values.amount, values.customSplits]);

  const computedSplits = useCallback((): Split[] => {
    const amount = parseFloat(values.amount) || 0;
    if (values.splitType === 'equal') {
      return calculateEqualSplits(values.selectedParticipantIds, amount);
    }
    return values.customSplits;
  }, [values]);

  const splitValidation = useCallback(() => {
    if (values.splitType === 'equal') return { valid: true, diff: 0 };
    const amount = parseFloat(values.amount) || 0;
    return validateCustomSplits(values.customSplits, amount);
  }, [values]);

  const canProceed = useCallback(
    (currentStep: number): boolean => {
      if (currentStep === 1) {
        return values.description.trim().length > 0 && parseFloat(values.amount) > 0;
      }
      if (currentStep === 2) {
        return !!values.paidById;
      }
      if (currentStep === 3) {
        if (values.selectedParticipantIds.length === 0) return false;
        const { valid } = splitValidation();
        return values.splitType === 'equal' || valid;
      }
      return true;
    },
    [values, splitValidation]
  );

  const handleNext = useCallback(() => {
    if (step < 3 && canProceed(step)) {
      setStep((s) => s + 1);
    }
  }, [step, canProceed]);

  const handleBack = useCallback(() => {
    if (step > 1) setStep((s) => s - 1);
  }, [step]);

  const handleSubmit = useCallback(() => {
    if (!canProceed(3)) return;
    onSubmit(values, computedSplits());
  }, [values, computedSplits, canProceed, onSubmit]);

  return {
    step,
    values,
    setField,
    toggleParticipant,
    setCustomSplitAmount,
    autoAdjustLastParticipant,
    computedSplits,
    splitValidation,
    canProceed,
    handleNext,
    handleBack,
    handleSubmit,
  };
}
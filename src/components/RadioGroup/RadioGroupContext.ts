import { createContext, useContext } from 'react';

export interface RadioGroupContextValue {
  name: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  /** The currently focused radio value (for roving tabindex) */
  focusedValue?: string;
  setFocusedValue?: (value: string) => void;
}

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(
  null
);

export function useRadioGroup(): RadioGroupContextValue {
  const ctx = useContext(RadioGroupContext);
  if (!ctx) {
    throw new Error('useRadioGroup must be used within a RadioGroup');
  }
  return ctx;
}
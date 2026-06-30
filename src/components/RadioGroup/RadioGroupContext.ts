import { createContext, useContext } from 'react';

export interface RadioGroupContextValue {
  /** Shared name attribute for all radios in the group */
  name: string;
  /** Currently selected value */
  value?: string;
  /** Callback when a radio is selected */
  onChange?: (value: string) => void;
  /** Whether all radios in the group are disabled */
  disabled?: boolean;
  /** Whether the group is required */
  required?: boolean;
  /** The currently focused radio value (for roving tabindex) */
  focusedValue?: string;
  /** Callback to set the currently focused value */
  onFocus?: (value: string) => void;
}

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export function useRadioGroup(): RadioGroupContextValue {
  const context = useContext(RadioGroupContext);
  if (!context) {
    throw new Error('useRadioGroup must be used within a RadioGroup');
  }
  return context;
}
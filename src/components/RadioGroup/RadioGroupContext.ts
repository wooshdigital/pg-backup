import { createContext, useContext } from 'react';

export interface RadioGroupContextValue {
  /** Shared name attribute for all radio inputs in the group */
  name: string;
  /** Currently selected value */
  value?: string;
  /** Called when a radio is selected */
  onChange?: (value: string) => void;
  /** Whether the entire group is disabled */
  disabled?: boolean;
  /** The id of the focusable radio (roving tabindex) */
  focusedValue?: string;
  /** Set which radio should have tabIndex=0 */
  setFocusedValue?: (value: string) => void;
}

const RadioGroupContext = createContext<RadioGroupContextValue>({
  name: '',
});

export { RadioGroupContext };

export const useRadioGroup = (): RadioGroupContextValue => {
  return useContext(RadioGroupContext);
};
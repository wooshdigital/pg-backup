import { createContext, useContext } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface SelectContextValue {
  /** Whether the listbox is open */
  isOpen: boolean;
  /** Currently selected value(s) */
  selectedValues: string[];
  /** The option that is currently focused/highlighted (for aria-activedescendant) */
  activeDescendant: string | null;
  /** ID of the listbox element */
  listboxId: string;
  /** ID prefix for option elements */
  optionIdPrefix: string;
  /** Whether multiple selection is allowed */
  multiple: boolean;
  /** Called when user selects an option */
  onSelectOption: (value: string) => void;
  /** Called to open/close the listbox */
  onToggle: () => void;
  /** Called to close the listbox */
  onClose: () => void;
}

export const SelectContext = createContext<SelectContextValue | null>(null);

export function useSelectContext(): SelectContextValue {
  const ctx = useContext(SelectContext);
  if (!ctx) {
    throw new Error(
      'useSelectContext must be used within a Select component tree'
    );
  }
  return ctx;
}
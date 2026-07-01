import { createContext, useContext } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectContextValue {
  isOpen: boolean;
  selectedValues: string[];
  activeDescendant: string | undefined;
  multiple: boolean;
  listboxId: string;
  disabled: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
  onSelect: (value: string) => void;
  setActiveDescendant: (id: string | undefined) => void;
  options: SelectOption[];
}

export const SelectContext = createContext<SelectContextValue | null>(null);

export function useSelectContext(): SelectContextValue {
  const ctx = useContext(SelectContext);
  if (!ctx) {
    throw new Error('useSelectContext must be used within a Select component');
  }
  return ctx;
}
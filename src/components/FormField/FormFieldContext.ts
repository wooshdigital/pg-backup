import { createContext } from 'react';

export interface FormFieldContextValue {
  fieldId: string;
  labelId: string;
  helperId: string;
  errorId: string;
  hasError: boolean;
  disabled: boolean;
  required: boolean;
}

export const FormFieldContext = createContext<FormFieldContextValue | null>(null);
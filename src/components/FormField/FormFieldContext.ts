import { createContext } from 'react';

export interface FormFieldContextValue {
  inputId?: string;
  helperId?: string;
  errorId?: string;
  hasError?: boolean;
  required?: boolean;
}

export const FormFieldContext = createContext<FormFieldContextValue | null>(null);
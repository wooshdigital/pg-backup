import { createContext } from 'react';

export interface FormFieldContextValue {
  /** Shared id for the input element */
  inputId: string;
  /** Id of the helper text element */
  helperId?: string;
  /** Id of the error message element */
  errorId?: string;
  /** Whether the field is in an error state */
  hasError?: boolean;
  /** Whether the field is required */
  required?: boolean;
}

export const FormFieldContext = createContext<FormFieldContextValue | null>(null);
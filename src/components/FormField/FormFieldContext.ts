import { createContext } from 'react';

export interface FormFieldContextValue {
  /** The id of the associated input element */
  inputId?: string;
  /** The id of the helper text element */
  helperId?: string;
  /** The id of the error message element */
  errorId?: string;
  /** Whether the field is in an error state */
  hasError: boolean;
  /** Whether the field is required */
  required: boolean;
}

export const FormFieldContext = createContext<FormFieldContextValue | null>(null);
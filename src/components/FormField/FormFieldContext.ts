import { createContext } from 'react';

export interface FormFieldContextValue {
  /** The id to assign to the form control */
  inputId: string;
  /** The id of the helper text element */
  helperId?: string;
  /** The id of the error message element */
  errorId?: string;
  /** Whether the field has an error */
  hasError?: boolean;
  /** Whether the field is required */
  required?: boolean;
}

export const FormFieldContext = createContext<FormFieldContextValue | null>(null);
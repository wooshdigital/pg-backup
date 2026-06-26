import { createContext } from 'react';

export interface FormFieldContextValue {
  /** id wired to the form input */
  inputId: string;
  /** id of the helper text element */
  helperId?: string;
  /** id of the error message element */
  errorId?: string;
  /** Whether the field currently has a validation error */
  hasError?: boolean;
  /** Whether the field is required */
  required?: boolean;
}

export const FormFieldContext = createContext<FormFieldContextValue | null>(null);

export default FormFieldContext;
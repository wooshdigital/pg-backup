import { createContext } from 'react';

export interface FormFieldContextValue {
  /** ID to assign to the form control */
  inputId?: string;
  /** ID of the helper text element */
  helperId?: string;
  /** ID of the error message element */
  errorId?: string;
  /** Whether the field currently has an error */
  hasError?: boolean;
  /** Whether the field is required */
  required?: boolean;
}

export const FormFieldContext = createContext<FormFieldContextValue | null>(
  null
);

export default FormFieldContext;
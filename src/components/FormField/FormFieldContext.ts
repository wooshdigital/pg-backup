import { createContext } from 'react';

export interface FormFieldContextValue {
  /** The id that should be applied to the associated form control */
  inputId: string | undefined;
  /** ID of the HelperText element, for aria-describedby */
  helperId: string | undefined;
  /** ID of the ErrorMessage element, for aria-describedby */
  errorId: string | undefined;
  /** Whether the field is required */
  required: boolean;
  /** Whether the field is in an invalid/error state */
  invalid: boolean;
}

export const FormFieldContext = createContext<FormFieldContextValue>({
  inputId: undefined,
  helperId: undefined,
  errorId: undefined,
  required: false,
  invalid: false,
});
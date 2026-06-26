import React, { useId, useMemo } from 'react';
import { FormFieldContext, FormFieldContextValue } from './FormFieldContext';
import styles from './FormField.module.css';

export interface FormFieldProps {
  children: React.ReactNode;
  /** When provided, marks the field as having an error */
  error?: string;
  /** Whether the field is required */
  required?: boolean;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ children, error, required, className }) => {
  const id = useId();
  const inputId = `field-input-${id}`;
  const helperId = `field-helper-${id}`;
  const errorId = `field-error-${id}`;

  const ctx = useMemo<FormFieldContextValue>(
    () => ({
      inputId,
      helperId,
      errorId,
      hasError: Boolean(error),
      required,
    }),
    [inputId, helperId, errorId, error, required]
  );

  return (
    <FormFieldContext.Provider value={ctx}>
      <div className={[styles.formField, className].filter(Boolean).join(' ')}>
        {children}
      </div>
    </FormFieldContext.Provider>
  );
};

FormField.displayName = 'FormField';

export default FormField;
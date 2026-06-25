import React, { HTMLAttributes, ReactNode, useMemo } from 'react';
import { FormFieldContext, FormFieldContextValue } from './FormFieldContext';
import styles from './FormField.module.css';

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  /** Base ID used to namespace all child element IDs */
  id?: string;
  /** Whether the field has a validation error */
  hasError?: boolean;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

let idCounter = 0;
function generateId(prefix: string): string {
  return `${prefix}-${++idCounter}`;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  hasError = false,
  required = false,
  disabled = false,
  children,
  className,
  style,
  ...rest
}) => {
  const fieldId = useMemo(() => id || generateId('field'), [id]);

  const contextValue = useMemo<FormFieldContextValue>(
    () => ({
      fieldId,
      labelId: `${fieldId}-label`,
      helperId: `${fieldId}-helper`,
      errorId: `${fieldId}-error`,
      hasError,
      required,
      disabled,
    }),
    [fieldId, hasError, required, disabled]
  );

  return (
    <FormFieldContext.Provider value={contextValue}>
      <div
        className={[styles.formField, className].filter(Boolean).join(' ')}
        style={style}
        data-has-error={hasError || undefined}
        data-disabled={disabled || undefined}
        {...rest}
      >
        {children}
      </div>
    </FormFieldContext.Provider>
  );
};

export default FormField;
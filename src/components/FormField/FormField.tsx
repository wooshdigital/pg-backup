import React, { useMemo } from 'react';
import { FormFieldContext, FormFieldContextValue } from './FormFieldContext';
import styles from './FormField.module.css';

export interface FormFieldProps {
  /** Base ID used to namespace all child IDs */
  id?: string;
  /** Whether the field is in an error state */
  hasError?: boolean;
  /** Whether the field is required */
  required?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  children: React.ReactNode;
}

let autoIdCounter = 0;

export const FormField: React.FC<FormFieldProps> = ({
  id,
  hasError = false,
  required = false,
  disabled = false,
  className,
  style,
  children,
}) => {
  const baseId = useMemo(() => {
    return id ?? `form-field-${++autoIdCounter}`;
  }, [id]);

  const contextValue = useMemo<FormFieldContextValue>(
    () => ({
      fieldId: baseId,
      labelId: `${baseId}-label`,
      helperId: `${baseId}-helper`,
      errorId: `${baseId}-error`,
      hasError,
      disabled,
      required,
    }),
    [baseId, hasError, disabled, required]
  );

  const classes = [styles.formField, className].filter(Boolean).join(' ');

  return (
    <FormFieldContext.Provider value={contextValue}>
      <div className={classes} style={style} data-disabled={disabled || undefined} data-error={hasError || undefined}>
        {children}
      </div>
    </FormFieldContext.Provider>
  );
};

FormField.displayName = 'FormField';
import React, { useMemo } from 'react';
import { FormFieldContext, FormFieldContextValue } from './FormFieldContext';
import styles from './FormField.module.css';
import { generateId } from '../../utils/id';

export interface FormFieldProps {
  /** Override the base ID used for namespacing child IDs */
  id?: string;
  /** Whether the field has a validation error */
  hasError?: boolean;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Whether the field is required */
  required?: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  hasError = false,
  disabled = false,
  required = false,
  children,
  className,
  style,
}) => {
  const baseId = useMemo(() => id ?? generateId('form-field'), [id]);

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

  return (
    <FormFieldContext.Provider value={contextValue}>
      <div
        className={[styles.formField, className].filter(Boolean).join(' ')}
        style={style}
        data-disabled={disabled || undefined}
        data-error={hasError || undefined}
      >
        {children}
      </div>
    </FormFieldContext.Provider>
  );
};

FormField.displayName = 'FormField';
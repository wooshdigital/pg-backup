import React, { useMemo } from 'react';
import { FormFieldContext, FormFieldContextValue } from './FormFieldContext';
import styles from './FormField.module.css';

let idCounter = 0;
function generateId(prefix: string): string {
  return `${prefix}-${++idCounter}`;
}

export interface FormFieldProps {
  /** Override the auto-generated base ID */
  id?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  hasError?: boolean;
  disabled?: boolean;
  required?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  children,
  className,
  style,
  hasError = false,
  disabled = false,
  required = false,
}) => {
  const baseId = useMemo(() => id ?? generateId('field'), [id]);

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

export default FormField;
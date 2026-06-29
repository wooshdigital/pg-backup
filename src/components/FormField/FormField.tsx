import React, { useId, useMemo, useState, useCallback } from 'react';
import { FormFieldContext, FormFieldContextValue } from './FormFieldContext';
import styles from './FormField.module.css';

export interface FormFieldProps {
  children: React.ReactNode;
  className?: string;
  required?: boolean;
  style?: React.CSSProperties;
}

/**
 * FormField is a layout wrapper that provides context to child components
 * (Label, TextInput, Textarea, HelperText, ErrorMessage) so they can
 * auto-wire their ARIA relationships.
 */
export const FormField: React.FC<FormFieldProps> = ({
  children,
  className,
  required,
  style,
}) => {
  const baseId = useId();
  const inputId = `${baseId}-input`;
  const helperId = `${baseId}-helper`;
  const errorId = `${baseId}-error`;

  // Track whether ErrorMessage child is present (hasError)
  // We'll use a simple approach: scan children for ErrorMessage
  const [hasError, setHasError] = useState(false);

  const ctxValue = useMemo<FormFieldContextValue>(
    () => ({
      inputId,
      helperId,
      errorId,
      hasError,
      required,
    }),
    [inputId, helperId, errorId, hasError, required]
  );

  return (
    <FormFieldContext.Provider value={ctxValue}>
      <div className={[styles.field, className ?? ''].filter(Boolean).join(' ')} style={style}>
        {children}
      </div>
    </FormFieldContext.Provider>
  );
};

FormField.displayName = 'FormField';

export default FormField;
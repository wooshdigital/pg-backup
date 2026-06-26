import React, { useId, useMemo } from 'react';
import { FormFieldContext } from './FormFieldContext';

export interface FormFieldProps {
  children: React.ReactNode;
  /** Whether the field is invalid (drives aria-invalid on the input) */
  invalid?: boolean;
  /** Whether the field is required */
  required?: boolean;
  /** Extra class name */
  className?: string;
}

/**
 * Provides context for Label, TextInput/Textarea, HelperText, and ErrorMessage.
 * All children that consume FormFieldContext will be auto-wired.
 */
export const FormField: React.FC<FormFieldProps> = ({
  children,
  invalid = false,
  required = false,
  className,
}) => {
  const baseId = useId();
  const inputId = `${baseId}-input`;
  const helperId = `${baseId}-helper`;
  const errorId = `${baseId}-error`;

  const contextValue = useMemo(
    () => ({ inputId, helperId, errorId, required, invalid }),
    [inputId, helperId, errorId, required, invalid],
  );

  return (
    <FormFieldContext.Provider value={contextValue}>
      <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {children}
      </div>
    </FormFieldContext.Provider>
  );
};

export default FormField;
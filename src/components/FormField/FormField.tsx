import React from 'react';
import { FormFieldContext, FormFieldContextValue } from './FormFieldContext';

export interface FormFieldProps extends FormFieldContextValue {
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  children,
  className,
  inputId,
  helperId,
  errorId,
  hasError = false,
  required = false,
}) => {
  const ctx: FormFieldContextValue = { inputId, helperId, errorId, hasError, required };
  return (
    <FormFieldContext.Provider value={ctx}>
      <div className={className} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {children}
      </div>
    </FormFieldContext.Provider>
  );
};

FormField.displayName = 'FormField';

export default FormField;
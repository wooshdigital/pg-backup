import { useContext } from 'react';
import { FormFieldContext, FormFieldContextValue } from './FormFieldContext';

export function useFormField(): FormFieldContextValue {
  const context = useContext(FormFieldContext);
  if (!context) {
    throw new Error(
      'useFormField must be used within a <FormField> component. ' +
        'Make sure your component is wrapped with <FormField>.'
    );
  }
  return context;
}
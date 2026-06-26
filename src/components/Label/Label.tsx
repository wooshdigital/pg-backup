import React, { useContext } from 'react';
import { FormFieldContext } from '../FormField/FormFieldContext';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  /** Show a visual required indicator (*) */
  required?: boolean;
}

export const Label: React.FC<LabelProps> = ({
  children,
  htmlFor: htmlForProp,
  required: requiredProp,
  ...rest
}) => {
  const ctx = useContext(FormFieldContext);
  const htmlFor = htmlForProp ?? ctx?.inputId;
  const isRequired = requiredProp ?? ctx?.required;

  return (
    <label
      htmlFor={htmlFor}
      {...rest}
      style={{
        fontSize: '0.875rem',
        fontWeight: 500,
        color: '#374151',
        ...(rest.style ?? {}),
      }}
    >
      {children}
      {isRequired && (
        <span aria-hidden="true" style={{ color: '#dc2626', marginLeft: '2px' }}>
          *
        </span>
      )}
    </label>
  );
};

export default Label;
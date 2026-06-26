import React, { useContext } from 'react';
import { FormFieldContext } from '../FormField/FormFieldContext';

export interface HelperTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export const HelperText: React.FC<HelperTextProps> = ({
  children,
  id: idProp,
  ...rest
}) => {
  const ctx = useContext(FormFieldContext);
  const id = idProp ?? ctx?.helperId;

  return (
    <span
      id={id}
      {...rest}
      style={{
        fontSize: '0.8125rem',
        color: '#6b7280',
        ...(rest.style ?? {}),
      }}
    >
      {children}
    </span>
  );
};

export default HelperText;
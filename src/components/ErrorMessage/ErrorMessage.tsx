import React, { useContext } from 'react';
import { FormFieldContext } from '../FormField/FormFieldContext';

export interface ErrorMessageProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  children,
  id: idProp,
  role = 'alert',
  ...rest
}) => {
  const ctx = useContext(FormFieldContext);
  const id = idProp ?? ctx?.errorId;

  return (
    <span
      id={id}
      role={role}
      {...rest}
      style={{
        fontSize: '0.8125rem',
        color: '#dc2626',
        ...(rest.style ?? {}),
      }}
    >
      {children}
    </span>
  );
};

export default ErrorMessage;
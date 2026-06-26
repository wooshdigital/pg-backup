import React, { useContext } from 'react';
import { FormFieldContext } from '../FormField/FormFieldContext';
import styles from './ErrorMessage.module.css';

export interface ErrorMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  children,
  className,
  id: idProp,
  ...rest
}) => {
  const ctx = useContext(FormFieldContext);
  const id = idProp ?? ctx?.errorId;

  return (
    <p
      id={id}
      role="alert"
      aria-live="assertive"
      className={[styles.errorMessage, className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </p>
  );
};

ErrorMessage.displayName = 'ErrorMessage';

export default ErrorMessage;
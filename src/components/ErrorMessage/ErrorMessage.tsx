import React, { useContext } from 'react';
import { FormFieldContext } from '../FormField/FormFieldContext';
import styles from './ErrorMessage.module.css';

export interface ErrorMessageProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  children,
  id: idProp,
  className,
}) => {
  const fieldCtx = useContext(FormFieldContext);
  const id = idProp ?? fieldCtx?.errorId;

  return (
    <span
      id={id}
      role="alert"
      aria-live="assertive"
      className={[styles.errorMessage, className ?? ''].filter(Boolean).join(' ')}
    >
      {children}
    </span>
  );
};

ErrorMessage.displayName = 'ErrorMessage';

export default ErrorMessage;
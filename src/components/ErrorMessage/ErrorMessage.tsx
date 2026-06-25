import React, { HTMLAttributes } from 'react';
import { useFormField } from '../FormField/useFormField';
import styles from './ErrorMessage.module.css';

export interface ErrorMessageProps extends HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  /** Whether to show the error icon (default: true) */
  showIcon?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const ErrorIcon: React.FC = () => (
  <svg
    className={styles.icon}
    aria-hidden="true"
    focusable="false"
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="6" cy="6" r="5.5" stroke="currentColor" />
    <path d="M6 3.5V6.5" stroke="currentColor" strokeLinecap="round" />
    <circle cx="6" cy="8.5" r="0.5" fill="currentColor" />
  </svg>
);

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  children,
  showIcon = true,
  className,
  style,
  ...rest
}) => {
  const context = (() => {
    try {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useFormField();
    } catch {
      return null;
    }
  })();

  const id = context?.errorId;

  return (
    <span
      id={id}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={[styles.errorMessage, className].filter(Boolean).join(' ')}
      style={style}
      {...rest}
    >
      {showIcon && <ErrorIcon />}
      <span className={styles.errorText}>{children}</span>
    </span>
  );
};

export default ErrorMessage;
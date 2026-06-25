import React from 'react';
import { useFormField } from '../FormField/useFormField';
import styles from './ErrorMessage.module.css';

export interface ErrorMessageProps {
  /** Error message content */
  children: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Whether to show the error icon (defaults to true) */
  showIcon?: boolean;
}

const ErrorIcon: React.FC = () => (
  <svg
    className={styles.icon}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
    width="14"
    height="14"
  >
    <path
      fillRule="evenodd"
      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z"
      clipRule="evenodd"
    />
  </svg>
);

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  children,
  className,
  style,
  showIcon = true,
}) => {
  const { errorId } = useFormField();

  const classes = [styles.errorMessage, className].filter(Boolean).join(' ');

  return (
    <span
      id={errorId}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={classes}
      style={style}
    >
      {showIcon && <ErrorIcon />}
      <span className={styles.errorText}>{children}</span>
    </span>
  );
};

ErrorMessage.displayName = 'ErrorMessage';
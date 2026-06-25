import React from 'react';
import { useFormField } from '../FormField/useFormField';
import styles from './ErrorMessage.module.css';

export interface ErrorMessageProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Override the error icon. Pass null to suppress the icon. */
  icon?: React.ReactNode | null;
}

const DefaultErrorIcon: React.FC = () => (
  <svg
    className={styles.errorIcon}
    aria-hidden="true"
    focusable="false"
    width="14"
    height="14"
    viewBox="0 0 20 20"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M18 10A8 8 0 1 1 2 10a8 8 0 0 1 16 0zm-7-4a1 1 0 1 0-2 0v4a1 1 0 0 0 2 0V6zm-1 8a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
    />
  </svg>
);

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  children,
  className,
  style,
  icon,
}) => {
  const { errorId, hasError } = useFormField();

  if (!hasError) {
    return null;
  }

  const showIcon = icon !== null;
  const resolvedIcon = icon !== undefined && icon !== null ? icon : <DefaultErrorIcon />;

  return (
    <span
      id={errorId}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={[styles.errorMessage, className].filter(Boolean).join(' ')}
      style={style}
    >
      {showIcon && (
        <span className={styles.iconWrapper} aria-hidden="true">
          {resolvedIcon}
        </span>
      )}
      <span className={styles.errorText}>{children}</span>
    </span>
  );
};

export default ErrorMessage;
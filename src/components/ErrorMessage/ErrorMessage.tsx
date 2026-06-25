import React from 'react';
import { useFormField } from '../FormField/useFormField';
import styles from './ErrorMessage.module.css';

export interface ErrorMessageProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Override the error icon (pass null to suppress) */
  icon?: React.ReactNode | null;
}

const DefaultErrorIcon: React.FC = () => (
  <svg
    className={styles.errorIcon}
    aria-hidden="true"
    focusable="false"
    width="12"
    height="12"
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="6" cy="6" r="5.5" stroke="currentColor" />
    <line x1="6" y1="3.5" x2="6" y2="6.5" stroke="currentColor" strokeLinecap="round" />
    <circle cx="6" cy="8.5" r="0.5" fill="currentColor" />
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
  const iconToRender = icon !== undefined ? icon : <DefaultErrorIcon />;

  return (
    <span
      id={errorId}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
      className={[styles.errorMessage, className].filter(Boolean).join(' ')}
      style={style}
    >
      {showIcon && iconToRender && (
        <span className={styles.iconWrapper} aria-hidden="true">
          {iconToRender}
        </span>
      )}
      <span className={styles.errorText}>{children}</span>
    </span>
  );
};

ErrorMessage.displayName = 'ErrorMessage';
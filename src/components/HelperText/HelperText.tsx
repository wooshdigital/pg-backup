import React from 'react';
import { useFormField } from '../FormField/useFormField';
import styles from './HelperText.module.css';

export interface HelperTextProps {
  /** Helper text content */
  children: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

export const HelperText: React.FC<HelperTextProps> = ({
  children,
  className,
  style,
}) => {
  const { helperId, hasError } = useFormField();

  const classes = [styles.helperText, className].filter(Boolean).join(' ');

  return (
    <span
      id={helperId}
      role="note"
      className={classes}
      style={style}
      aria-hidden={hasError ? 'true' : undefined}
    >
      {children}
    </span>
  );
};

HelperText.displayName = 'HelperText';
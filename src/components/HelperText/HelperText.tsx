import React from 'react';
import { useFormField } from '../FormField/useFormField';
import styles from './HelperText.module.css';

export interface HelperTextProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const HelperText: React.FC<HelperTextProps> = ({
  children,
  className,
  style,
}) => {
  const { helperId, hasError } = useFormField();

  // When there's an error, hide the helper text visually and from AT
  // but keep it in the DOM to avoid layout shift
  return (
    <span
      id={helperId}
      role="note"
      className={[styles.helperText, className].filter(Boolean).join(' ')}
      style={style}
      aria-hidden={hasError ? 'true' : undefined}
    >
      {children}
    </span>
  );
};

HelperText.displayName = 'HelperText';
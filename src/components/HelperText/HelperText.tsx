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

  // Hide helper text when an error message is displayed to avoid redundant descriptions
  if (hasError) {
    return null;
  }

  return (
    <span
      id={helperId}
      role="note"
      className={[styles.helperText, className].filter(Boolean).join(' ')}
      style={style}
    >
      {children}
    </span>
  );
};

export default HelperText;
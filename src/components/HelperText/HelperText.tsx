import React, { HTMLAttributes } from 'react';
import { useFormField } from '../FormField/useFormField';
import styles from './HelperText.module.css';

export interface HelperTextProps extends HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const HelperText: React.FC<HelperTextProps> = ({
  children,
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

  const id = context?.helperId;
  const hasError = context?.hasError ?? false;

  return (
    <span
      id={id}
      role="note"
      aria-hidden={hasError ? 'true' : undefined}
      className={[styles.helperText, hasError ? styles.hidden : '', className]
        .filter(Boolean)
        .join(' ')}
      style={style}
      {...rest}
    >
      {children}
    </span>
  );
};

export default HelperText;
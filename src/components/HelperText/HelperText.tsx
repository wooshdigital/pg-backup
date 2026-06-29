import React, { useContext } from 'react';
import { FormFieldContext } from '../FormField/FormFieldContext';
import styles from './HelperText.module.css';

export interface HelperTextProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export const HelperText: React.FC<HelperTextProps> = ({
  children,
  id: idProp,
  className,
}) => {
  const fieldCtx = useContext(FormFieldContext);
  const id = idProp ?? fieldCtx?.helperId;

  return (
    <span
      id={id}
      className={[styles.helperText, className ?? ''].filter(Boolean).join(' ')}
    >
      {children}
    </span>
  );
};

HelperText.displayName = 'HelperText';

export default HelperText;
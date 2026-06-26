import React, { useContext } from 'react';
import { FormFieldContext } from '../FormField/FormFieldContext';
import styles from './HelperText.module.css';

export interface HelperTextProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

export const HelperText: React.FC<HelperTextProps> = ({ children, className, id: idProp, ...rest }) => {
  const ctx = useContext(FormFieldContext);
  const id = idProp ?? ctx?.helperId;

  return (
    <p id={id} className={[styles.helperText, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </p>
  );
};

HelperText.displayName = 'HelperText';

export default HelperText;
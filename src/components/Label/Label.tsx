import React, { useContext } from 'react';
import { FormFieldContext } from '../FormField/FormFieldContext';
import styles from './Label.module.css';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  /** Visually indicate the field is optional */
  optional?: boolean;
}

export const Label: React.FC<LabelProps> = ({ children, optional, className, htmlFor, ...rest }) => {
  const ctx = useContext(FormFieldContext);
  const resolvedFor = htmlFor ?? ctx?.inputId;

  return (
    <label
      htmlFor={resolvedFor}
      className={[styles.label, ctx?.required && styles.required, className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
      {optional && <span className={styles.optional}> (optional)</span>}
    </label>
  );
};

Label.displayName = 'Label';

export default Label;
import React, { useContext } from 'react';
import { FormFieldContext } from '../FormField/FormFieldContext';
import styles from './Label.module.css';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  /** Mark as required (renders an asterisk) */
  required?: boolean;
}

export const Label: React.FC<LabelProps> = ({
  children,
  htmlFor: htmlForProp,
  required: requiredProp,
  className,
  ...rest
}) => {
  const fieldCtx = useContext(FormFieldContext);
  const htmlFor = htmlForProp ?? fieldCtx?.inputId;
  const isRequired = requiredProp ?? fieldCtx?.required;

  return (
    <label
      {...rest}
      htmlFor={htmlFor}
      className={[styles.label, className ?? ''].filter(Boolean).join(' ')}
    >
      {children}
      {isRequired && (
        <span className={styles.required} aria-hidden="true">
          {' '}*
        </span>
      )}
    </label>
  );
};

Label.displayName = 'Label';

export default Label;
import React from 'react';
import { useFormField } from '../FormField/useFormField';
import styles from './Label.module.css';

export interface LabelProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Override the htmlFor target if not using FormField context */
  htmlFor?: string;
  /** Show a tooltip trigger button after the label text */
  tooltip?: React.ReactNode;
}

export const Label: React.FC<LabelProps> = ({
  children,
  className,
  style,
  htmlFor,
  tooltip,
}) => {
  const { fieldId, labelId, required, disabled } = useFormField();

  return (
    <label
      id={labelId}
      htmlFor={htmlFor ?? fieldId}
      className={[
        styles.label,
        disabled ? styles.disabled : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      <span className={styles.labelText}>{children}</span>
      {required && (
        <span className={styles.required} aria-hidden="true" title="Required">
          {' '}*
        </span>
      )}
      {tooltip && <span className={styles.tooltipTrigger}>{tooltip}</span>}
    </label>
  );
};

export default Label;
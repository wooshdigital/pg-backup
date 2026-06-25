import React from 'react';
import { useFormField } from '../FormField/useFormField';
import styles from './Label.module.css';

export interface LabelProps {
  /** The label text */
  children: React.ReactNode;
  /** Override htmlFor (defaults to FormField's fieldId) */
  htmlFor?: string;
  /** Additional CSS class names */
  className?: string;
  /** Inline styles */
  style?: React.CSSProperties;
  /** Show a tooltip trigger icon next to the label */
  tooltip?: React.ReactNode;
}

export const Label: React.FC<LabelProps> = ({
  children,
  htmlFor,
  className,
  style,
  tooltip,
}) => {
  const { fieldId, labelId, required, disabled } = useFormField();

  const classes = [
    styles.label,
    disabled ? styles.disabled : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <label
      id={labelId}
      htmlFor={htmlFor ?? fieldId}
      className={classes}
      style={style}
    >
      <span className={styles.labelText}>{children}</span>
      {required && (
        <span className={styles.required} aria-hidden="true" title="Required">
          *
        </span>
      )}
      {tooltip && <span className={styles.tooltip}>{tooltip}</span>}
    </label>
  );
};

Label.displayName = 'Label';
import React from 'react';
import { useFormField } from '../FormField/useFormField';
import styles from './Label.module.css';

export interface LabelProps {
  children: React.ReactNode;
  /** Override the htmlFor value (defaults to fieldId from context) */
  htmlFor?: string;
  className?: string;
  style?: React.CSSProperties;
  /** Show a tooltip trigger button next to the label */
  tooltipContent?: React.ReactNode;
  onTooltipClick?: () => void;
}

export const Label: React.FC<LabelProps> = ({
  children,
  htmlFor,
  className,
  style,
  tooltipContent,
  onTooltipClick,
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
        <span
          className={styles.required}
          aria-label="required"
          title="This field is required"
        >
          {' '}*
        </span>
      )}
      {tooltipContent && onTooltipClick && (
        <button
          type="button"
          className={styles.tooltipTrigger}
          onClick={onTooltipClick}
          aria-label={`More information about ${typeof children === 'string' ? children : 'this field'}`}
        >
          <span aria-hidden="true">?</span>
        </button>
      )}
    </label>
  );
};

Label.displayName = 'Label';
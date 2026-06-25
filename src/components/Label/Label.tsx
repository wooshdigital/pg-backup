import React, { LabelHTMLAttributes } from 'react';
import { useFormField } from '../FormField/useFormField';
import styles from './Label.module.css';

export interface LabelProps extends Omit<LabelHTMLAttributes<HTMLLabelElement>, 'htmlFor'> {
  /** Override the auto-wired htmlFor (rarely needed) */
  htmlFor?: string;
  /** Override to show required indicator regardless of FormField context */
  required?: boolean;
  /** Show disabled styling regardless of FormField context */
  disabled?: boolean;
  /** Tooltip content shown next to the label */
  tooltip?: string;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Label: React.FC<LabelProps> = ({
  htmlFor,
  required: requiredProp,
  disabled: disabledProp,
  tooltip,
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

  const fieldId = htmlFor ?? context?.fieldId;
  const labelId = context?.labelId;
  const required = requiredProp ?? context?.required ?? false;
  const disabled = disabledProp ?? context?.disabled ?? false;

  return (
    <label
      id={labelId}
      htmlFor={fieldId}
      className={[
        styles.label,
        disabled ? styles.disabled : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
      {...rest}
    >
      <span className={styles.labelText}>{children}</span>
      {required && (
        <span className={styles.required} aria-hidden="true" title="Required">
          {' '}*
        </span>
      )}
      {tooltip && (
        <button
          type="button"
          className={styles.tooltipTrigger}
          aria-label={`More information about ${typeof children === 'string' ? children : 'this field'}`}
          title={tooltip}
        >
          <span aria-hidden="true">ⓘ</span>
        </button>
      )}
    </label>
  );
};

export default Label;
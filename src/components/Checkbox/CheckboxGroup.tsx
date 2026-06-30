import React, { useId } from 'react';
import styles from './CheckboxGroup.module.css';

export interface CheckboxGroupProps {
  legend: React.ReactNode;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
  helperText?: string;
  layout?: 'vertical' | 'horizontal';
  className?: string;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  legend,
  children,
  required,
  error,
  helperText,
  layout = 'vertical',
  className,
}) => {
  const groupId = useId();
  const helperTextId = `${groupId}-helper`;

  return (
    <fieldset
      className={[styles.group, className ?? ''].filter(Boolean).join(' ')}
      aria-required={required ? true : undefined}
      aria-describedby={helperText || error ? helperTextId : undefined}
      aria-invalid={error ? true : undefined}
    >
      <legend
        className={[styles.legend, required ? styles.required : '']
          .filter(Boolean)
          .join(' ')}
      >
        {legend}
        {required && (
          <span aria-hidden="true" style={{ color: 'var(--color-error, #ef4444)' }}>
            {' '}*
          </span>
        )}
      </legend>
      <div
        className={[
          styles.list,
          layout === 'horizontal' ? styles.horizontal : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </div>
      {(helperText || error) && (
        <span
          id={helperTextId}
          className={[
            styles.helperText,
            error ? styles.errorText : '',
          ]
            .filter(Boolean)
            .join(' ')}
          role={error ? 'alert' : undefined}
        >
          {error ?? helperText}
        </span>
      )}
    </fieldset>
  );
};
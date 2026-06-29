import React from 'react';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export const Label: React.FC<LabelProps> = ({ children, required, ...rest }) => (
  <label
    style={{
      fontSize: '0.875rem',
      fontWeight: 500,
      color: 'var(--color-text, #111827)',
    }}
    {...rest}
  >
    {children}
    {required && (
      <span aria-hidden="true" style={{ color: 'var(--color-error, #ef4444)', marginLeft: 2 }}>
        *
      </span>
    )}
  </label>
);

Label.displayName = 'Label';

export default Label;
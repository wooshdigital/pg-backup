import React from 'react';

export interface HelperTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  id: string;
  children: React.ReactNode;
}

export const HelperText: React.FC<HelperTextProps> = ({ children, ...rest }) => (
  <span
    style={{
      fontSize: '0.8125rem',
      color: 'var(--color-text-subtle, #6b7280)',
      marginTop: 2,
    }}
    {...rest}
  >
    {children}
  </span>
);

HelperText.displayName = 'HelperText';

export default HelperText;
import React from 'react';

export interface ErrorMessageProps extends React.HTMLAttributes<HTMLSpanElement> {
  id: string;
  children: React.ReactNode;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ children, ...rest }) => (
  <span
    role="alert"
    aria-live="assertive"
    style={{
      fontSize: '0.8125rem',
      color: 'var(--color-error, #ef4444)',
      fontWeight: 500,
      marginTop: 2,
    }}
    {...rest}
  >
    {children}
  </span>
);

ErrorMessage.displayName = 'ErrorMessage';

export default ErrorMessage;
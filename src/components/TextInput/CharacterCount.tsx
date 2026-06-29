import React from 'react';
import styles from './CharacterCount.module.css';

export interface CharacterCountProps {
  /** Current length of the value */
  current: number;
  /** Maximum allowed length */
  max: number;
  /** Additional CSS class */
  className?: string;
  /** id so it can be referenced in aria-describedby */
  id?: string;
}

export const CharacterCount: React.FC<CharacterCountProps> = ({ current, max, className, id }) => {
  const remaining = max - current;
  const isWarning = remaining <= Math.ceil(max * 0.1); // last 10%
  const isError = remaining < 0;

  const countClasses = [
    styles.count,
    isError && styles.error,
    isWarning && !isError && styles.warning,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const message =
    remaining >= 0
      ? `${remaining} of ${max} character${remaining !== 1 ? 's' : ''} remaining`
      : `${Math.abs(remaining)} character${Math.abs(remaining) !== 1 ? 's' : ''} over the limit`;

  return (
    <span id={id} className={countClasses} aria-live="polite" aria-atomic="true" role="status">
      {message}
    </span>
  );
};

CharacterCount.displayName = 'CharacterCount';
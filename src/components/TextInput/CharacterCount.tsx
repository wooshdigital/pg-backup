import React from 'react';
import styles from './CharacterCount.module.css';

export interface CharacterCountProps {
  /** Current number of characters typed */
  current: number;
  /** Maximum allowed characters */
  max: number;
  /** id to associate with the input via aria-describedby */
  id?: string;
  /** Percentage threshold at which to show a warning colour (default 80) */
  warningThreshold?: number;
  /** Percentage threshold at which to show an error colour (default 100) */
  errorThreshold?: number;
  className?: string;
}

export const CharacterCount: React.FC<CharacterCountProps> = ({
  current,
  max,
  id,
  warningThreshold = 80,
  errorThreshold = 100,
  className,
}) => {
  const remaining = max - current;
  const percentUsed = (current / max) * 100;

  let stateClass = '';
  if (percentUsed >= errorThreshold || remaining < 0) {
    stateClass = styles.error;
  } else if (percentUsed >= warningThreshold) {
    stateClass = styles.warning;
  }

  const message =
    remaining < 0
      ? `${Math.abs(remaining)} character${Math.abs(remaining) !== 1 ? 's' : ''} over limit`
      : `${remaining} of ${max} character${max !== 1 ? 's' : ''} remaining`;

  return (
    <span
      id={id}
      className={[styles.count, stateClass, className ?? ''].filter(Boolean).join(' ')}
      aria-live="polite"
      aria-atomic="true"
    >
      {message}
    </span>
  );
};

CharacterCount.displayName = 'CharacterCount';

export default CharacterCount;
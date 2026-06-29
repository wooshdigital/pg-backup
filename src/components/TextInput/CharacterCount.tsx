import React from 'react';
import styles from './CharacterCount.module.css';

export interface CharacterCountProps {
  /** Current character count */
  current: number;
  /** Maximum allowed characters */
  max: number;
  /** Custom id for linking */
  id?: string;
  /** Override className */
  className?: string;
}

/**
 * CharacterCount renders an aria-live region that announces
 * remaining characters as the user types.
 */
export const CharacterCount: React.FC<CharacterCountProps> = ({
  current,
  max,
  id,
  className,
}) => {
  const remaining = max - current;
  const isOver = remaining < 0;
  const isWarning = !isOver && remaining <= Math.ceil(max * 0.1);

  const countClass = [
    styles.count,
    isOver ? styles.error : '',
    isWarning ? styles.warning : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  const label = isOver
    ? `${Math.abs(remaining)} characters over limit`
    : `${remaining} of ${max} characters remaining`;

  return (
    <span
      id={id}
      className={countClass}
      aria-live="polite"
      aria-atomic="true"
      role="status"
    >
      {label}
    </span>
  );
};

CharacterCount.displayName = 'CharacterCount';

export default CharacterCount;
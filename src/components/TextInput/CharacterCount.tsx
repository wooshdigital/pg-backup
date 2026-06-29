import React, { useEffect, useState } from 'react';
import styles from './CharacterCount.module.css';

export interface CharacterCountProps {
  /** Current length of the input value */
  current: number;
  /** Maximum allowed characters */
  max: number;
  /** Custom class name */
  className?: string;
  /**
   * Threshold (0–1) at which to show a warning color.
   * Defaults to 0.8 (80% used).
   */
  warningThreshold?: number;
}

export const CharacterCount: React.FC<CharacterCountProps> = ({
  current,
  max,
  className,
  warningThreshold = 0.8,
}) => {
  const remaining = max - current;
  const ratio = current / max;

  const isError = remaining < 0;
  const isWarning = !isError && ratio >= warningThreshold;

  const stateClass = isError
    ? styles['count--error']
    : isWarning
    ? styles['count--warning']
    : '';

  const classes = [styles.count, stateClass, className ?? '']
    .filter(Boolean)
    .join(' ');

  // Announce remaining count to screen readers
  const [announcement, setAnnouncement] = useState('');

  useEffect(() => {
    if (remaining < 0) {
      setAnnouncement(`${Math.abs(remaining)} characters over the limit`);
    } else {
      setAnnouncement(`${remaining} of ${max} characters remaining`);
    }
  }, [remaining, max]);

  return (
    <span className={classes} aria-hidden="true">
      <span
        role="status"
        aria-live="polite"
        aria-atomic="true"
        className={styles['sr-only']}
      >
        {announcement}
      </span>
      <span aria-hidden="true">
        {remaining < 0
          ? `${Math.abs(remaining)} over limit`
          : `${remaining} of ${max} remaining`}
      </span>
    </span>
  );
};

CharacterCount.displayName = 'CharacterCount';

export default CharacterCount;
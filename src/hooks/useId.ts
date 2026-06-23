import { useId as useReactId } from 'react';
import type { UseIdOptions } from '../types';

/**
 * A stable unique ID generation hook that wraps React's built-in `useId`.
 *
 * Features:
 * - Uses React 18's `useId` for SSR-safe, hydration-stable IDs
 * - Supports an optional prefix for readability/debugging
 * - Allows overriding with a static ID (e.g., when user provides their own)
 * - Generates multiple related IDs from a single base
 *
 * @example
 * // Basic usage
 * const id = useId({ prefix: 'button' });
 * // => 'button-:r0:'
 *
 * // With user-provided ID override
 * const id = useId({ prefix: 'input', id: 'my-custom-id' });
 * // => 'my-custom-id'
 *
 * // Generate multiple related IDs
 * const { id, labelId, descriptionId, errorId } = useId({ prefix: 'field' });
 */
export function useId(options: UseIdOptions = {}): string {
  const { prefix, id: staticId } = options;

  // React 18's useId generates a stable, SSR-safe unique ID
  // We must call it unconditionally (Rules of Hooks)
  const generatedId = useReactId();

  // If a static ID is provided, use it; otherwise use generated
  if (staticId) {
    return staticId;
  }

  // Apply prefix if provided
  if (prefix) {
    // Clean the React ID (remove colons for cleaner output)
    const cleanId = generatedId.replace(/:/g, '');
    return `${prefix}-${cleanId}`;
  }

  return generatedId;
}

/**
 * Generates a set of related IDs for a form field component.
 * Ensures all related elements have consistent, connected IDs.
 *
 * @example
 * const ids = useFieldIds({ prefix: 'email', id: props.id });
 * // ids.fieldId    => 'email-r0'
 * // ids.labelId    => 'email-r0-label'
 * // ids.descId     => 'email-r0-desc'
 * // ids.errorId    => 'email-r0-error'
 * // ids.warningId  => 'email-r0-warning'
 */
export function useFieldIds(options: UseIdOptions = {}): {
  fieldId: string;
  labelId: string;
  descId: string;
  errorId: string;
  warningId: string;
} {
  const baseId = useId(options);

  return {
    fieldId: baseId,
    labelId: `${baseId}-label`,
    descId: `${baseId}-desc`,
    errorId: `${baseId}-error`,
    warningId: `${baseId}-warning`,
  };
}
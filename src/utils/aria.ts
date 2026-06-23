import type { AriaLivePoliteness, ValidationState } from '../types';

/**
 * Builds an aria-describedby string from multiple IDs, filtering out undefined/null values.
 *
 * @example
 * buildAriaDescribedBy('field-helper', 'field-error', undefined)
 * // => 'field-helper field-error'
 */
export function buildAriaDescribedBy(
  ...ids: Array<string | undefined | null | false>
): string | undefined {
  const validIds = ids.filter((id): id is string => Boolean(id) && typeof id === 'string');
  return validIds.length > 0 ? validIds.join(' ') : undefined;
}

/**
 * Builds an aria-labelledby string from multiple IDs, filtering out undefined/null values.
 *
 * @example
 * buildAriaLabelledBy('form-label', 'field-label')
 * // => 'form-label field-label'
 */
export function buildAriaLabelledBy(
  ...ids: Array<string | undefined | null | false>
): string | undefined {
  const validIds = ids.filter((id): id is string => Boolean(id) && typeof id === 'string');
  return validIds.length > 0 ? validIds.join(' ') : undefined;
}

/**
 * Merges multiple aria prop objects together, combining space-separated values
 * for aria-describedby and aria-labelledby.
 *
 * @example
 * mergeAriaProps(
 *   { 'aria-describedby': 'id1', 'aria-label': 'First' },
 *   { 'aria-describedby': 'id2' }
 * )
 * // => { 'aria-describedby': 'id1 id2', 'aria-label': 'First' }
 */
export function mergeAriaProps(
  ...propSets: Array<Record<string, unknown> | undefined | null>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  const describedByIds: string[] = [];
  const labelledByIds: string[] = [];

  for (const props of propSets) {
    if (!props) continue;

    for (const [key, value] of Object.entries(props)) {
      if (key === 'aria-describedby' && typeof value === 'string') {
        describedByIds.push(...value.split(' ').filter(Boolean));
      } else if (key === 'aria-labelledby' && typeof value === 'string') {
        labelledByIds.push(...value.split(' ').filter(Boolean));
      } else {
        // Later props override earlier ones for non-merged properties
        result[key] = value;
      }
    }
  }

  if (describedByIds.length > 0) {
    result['aria-describedby'] = describedByIds.join(' ');
  }

  if (labelledByIds.length > 0) {
    result['aria-labelledby'] = labelledByIds.join(' ');
  }

  return result;
}

/**
 * Returns the appropriate aria-live politeness level based on content type.
 *
 * - 'assertive': For errors and critical alerts that interrupt immediately
 * - 'polite': For status updates, success messages, and non-critical info
 * - 'off': For content that should not be announced
 *
 * @example
 * getAriaLive('invalid')    // => 'assertive'
 * getAriaLive('valid')      // => 'polite'
 * getAriaLive('none')       // => 'off'
 */
export function getAriaLive(
  validationState: ValidationState | 'error' | 'success' | 'info',
): AriaLivePoliteness {
  switch (validationState) {
    case 'invalid':
    case 'error':
      return 'assertive';
    case 'valid':
    case 'success':
    case 'warning':
    case 'info':
      return 'polite';
    case 'none':
    default:
      return 'off';
  }
}

/**
 * Returns the appropriate aria-invalid value based on validation state.
 *
 * @example
 * getAriaInvalid('invalid')  // => true
 * getAriaInvalid('valid')    // => undefined
 * getAriaInvalid('none')     // => undefined
 */
export function getAriaInvalid(
  validationState: ValidationState | undefined,
): boolean | undefined {
  if (validationState === 'invalid') return true;
  return undefined;
}

/**
 * Returns an aria-roledescription for custom widgets.
 * Provides a human-readable description of the role for screen readers.
 *
 * @example
 * getRoleDescription('slider')        // => 'slider'
 * getRoleDescription('color-picker')  // => 'color picker'
 */
export function getRoleDescription(widgetType: string): string {
  // Convert kebab-case to human-readable
  return widgetType.replace(/-/g, ' ');
}

/**
 * Generates a unique ID with optional prefix for use in ARIA relationships.
 *
 * @example
 * generateAriaId('field')   // => 'field-a1b2c3'
 * generateAriaId()           // => 'aria-a1b2c3'
 */
export function generateAriaId(prefix = 'aria'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

/**
 * Checks if a string is a valid ARIA ID (non-empty, no spaces).
 */
export function isValidAriaId(id: unknown): id is string {
  return typeof id === 'string' && id.length > 0 && !/\s/.test(id);
}

/**
 * Creates an object of announcement text suitable for a screen reader live region.
 */
export interface AnnouncementOptions {
  message: string;
  politeness?: AriaLivePoliteness;
  clearAfterMs?: number;
}

/**
 * Builds props for a visually-hidden live region element.
 */
export function buildLiveRegionProps(
  options: AnnouncementOptions,
): {
  role: 'status' | 'alert';
  'aria-live': AriaLivePoliteness;
  'aria-atomic': boolean;
} {
  const { politeness = 'polite' } = options;
  return {
    role: politeness === 'assertive' ? 'alert' : 'status',
    'aria-live': politeness,
    'aria-atomic': true,
  };
}
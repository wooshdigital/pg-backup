/**
 * A lightweight utility for conditionally joining class names together.
 * Similar to the popular `clsx` library but with zero dependencies.
 *
 * Supports:
 * - Strings
 * - Numbers
 * - Arrays (nested)
 * - Objects (key is class name, value is condition)
 * - Falsy values (ignored)
 *
 * @example
 * cx('foo', 'bar')
 * // => 'foo bar'
 *
 * cx('foo', { bar: true, baz: false })
 * // => 'foo bar'
 *
 * cx('foo', ['bar', { baz: true }])
 * // => 'foo bar baz'
 *
 * cx(undefined, null, false, 0, '')
 * // => ''
 */
export type ClassValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ClassValue[]
  | { [key: string]: boolean | null | undefined };

function processValue(result: string[], value: ClassValue): void {
  if (!value && value !== 0) return;

  if (typeof value === 'string') {
    if (value.trim()) {
      result.push(value.trim());
    }
    return;
  }

  if (typeof value === 'number') {
    result.push(String(value));
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      processValue(result, item);
    }
    return;
  }

  if (typeof value === 'object') {
    for (const [key, condition] of Object.entries(value)) {
      if (condition) {
        result.push(key);
      }
    }
  }
}

/**
 * Conditionally joins class names together.
 * Alias: `cx`
 */
export function classNames(...values: ClassValue[]): string {
  const result: string[] = [];
  for (const value of values) {
    processValue(result, value);
  }
  return result.join(' ');
}

/**
 * Shorthand alias for `classNames`
 */
export const cx = classNames;

/**
 * Creates a variant-aware class name builder.
 * Useful for component variants that follow a consistent naming pattern.
 *
 * @example
 * const buttonCx = createVariantClassNames('btn');
 * buttonCx('primary', 'lg', { disabled: true })
 * // => 'btn btn--primary btn--lg btn--disabled'
 */
export function createVariantClassNames(
  base: string,
): (...args: ClassValue[]) => string {
  return (...args: ClassValue[]) => {
    return cx(base, ...args);
  };
}
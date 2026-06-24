/**
 * Joins class names or style keys, filtering out falsy values.
 * Useful for building conditional style arrays in React Native.
 */
export function classNames<T>(...values: Array<T | null | undefined | false>): T[] {
  return values.filter((v): v is T => Boolean(v));
}
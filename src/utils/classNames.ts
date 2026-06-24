// ─── Class Name Utilities ─────────────────────────────────────────────────────
// Note: In React Native we use StyleSheet objects, not class names.
// This utility is included for potential web/cross-platform support.

type ClassValue = string | undefined | null | false | Record<string, boolean>;

/**
 * Merge class names conditionally (for web/cross-platform use)
 */
export function cn(...classes: ClassValue[]): string {
  return classes
    .flatMap((cls) => {
      if (!cls) return [];
      if (typeof cls === 'string') return cls;
      return Object.entries(cls)
        .filter(([, value]) => value)
        .map(([key]) => key);
    })
    .join(' ');
}
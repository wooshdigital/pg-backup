// ─── AsyncStorage Key Utilities ───────────────────────────────────────────────

const PREFIX = '@splitmate';

export const StorageKeys = {
  TRIPS: `${PREFIX}/trips`,
  EXPENSES: `${PREFIX}/expenses`,
  SPLITS: `${PREFIX}/splits`,
  PARTICIPANTS: `${PREFIX}/participants`,
  SETTLEMENTS: `${PREFIX}/settlements`,
  THEME_MODE: `${PREFIX}/theme_mode`,
  DEFAULT_CURRENCY: `${PREFIX}/default_currency`,
  ONBOARDING_COMPLETE: `${PREFIX}/onboarding_complete`,

  // Dynamic keys
  trip: (id: string) => `${PREFIX}/trip/${id}`,
  expense: (id: string) => `${PREFIX}/expense/${id}`,
  tripExpenses: (tripId: string) => `${PREFIX}/trip/${tripId}/expenses`,
} as const;
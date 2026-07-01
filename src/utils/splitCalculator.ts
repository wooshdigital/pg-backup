export interface Split {
  participantId: string;
  amount: number;
}

export function calculateEqualSplits(
  participantIds: string[],
  total: number
): Split[] {
  if (participantIds.length === 0) return [];
  const base = roundCurrency(total / participantIds.length);
  const splits: Split[] = participantIds.map((id) => ({
    participantId: id,
    amount: base,
  }));
  // Fix rounding remainder on last participant
  const sum = splits.reduce((acc, s) => acc + s.amount, 0);
  const diff = roundCurrency(total - sum);
  if (diff !== 0) {
    splits[splits.length - 1].amount = roundCurrency(
      splits[splits.length - 1].amount + diff
    );
  }
  return splits;
}

export function validateCustomSplits(
  splits: Split[],
  total: number
): { valid: boolean; diff: number } {
  const sum = splits.reduce((acc, s) => acc + s.amount, 0);
  const diff = roundCurrency(total - sum);
  return { valid: diff === 0, diff };
}

export function adjustLastParticipant(
  splits: Split[],
  total: number
): Split[] {
  if (splits.length === 0) return splits;
  const adjusted = splits.map((s) => ({ ...s }));
  const sumExceptLast = adjusted
    .slice(0, -1)
    .reduce((acc, s) => acc + s.amount, 0);
  adjusted[adjusted.length - 1].amount = roundCurrency(total - sumExceptLast);
  return adjusted;
}

export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}
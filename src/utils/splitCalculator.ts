export type SplitResult = {
  participantId: string;
  amount: number;
};

export function calculateEqualSplit(
  totalAmount: number,
  participantIds: string[]
): SplitResult[] {
  if (participantIds.length === 0) return [];

  const share = Math.floor((totalAmount / participantIds.length) * 100) / 100;
  const remainder =
    Math.round((totalAmount - share * participantIds.length) * 100) / 100;

  return participantIds.map((id, index) => ({
    participantId: id,
    amount:
      index === participantIds.length - 1
        ? Math.round((share + remainder) * 100) / 100
        : share,
  }));
}

export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export function validateCustomSplits(
  splits: Record<string, number>,
  total: number
): { valid: boolean; diff: number } {
  const sum = Object.values(splits).reduce(
    (acc, v) => acc + roundCurrency(v),
    0
  );
  const diff = roundCurrency(total - roundCurrency(sum));
  return { valid: diff === 0, diff };
}

export function adjustLastParticipant(
  splits: Record<string, number>,
  total: number,
  participantIds: string[]
): Record<string, number> {
  if (participantIds.length === 0) return splits;

  const lastId = participantIds[participantIds.length - 1];
  const othersSum = participantIds
    .slice(0, -1)
    .reduce((acc, id) => acc + roundCurrency(splits[id] ?? 0), 0);

  const lastAmount = roundCurrency(total - othersSum);

  return {
    ...splits,
    [lastId]: lastAmount >= 0 ? lastAmount : 0,
  };
}
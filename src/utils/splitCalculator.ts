import { Participant } from '../types';

export interface Split {
  participantId: string;
  amount: number;
}

export function calculateEqualSplits(
  participants: Participant[],
  total: number
): Split[] {
  if (participants.length === 0) return [];

  const perPerson = roundCurrency(total / participants.length);
  const splits: Split[] = participants.map((p) => ({
    participantId: p.id,
    amount: perPerson,
  }));

  // Adjust last participant for floating point rounding
  return adjustLastParticipant(splits, total);
}

export function validateCustomSplits(
  splits: Split[],
  total: number
): { valid: boolean; diff: number } {
  const sum = splits.reduce((acc, s) => acc + s.amount, 0);
  const diff = roundCurrency(total - sum);
  return { valid: diff === 0, diff };
}

export function adjustLastParticipant(splits: Split[], total: number): Split[] {
  if (splits.length === 0) return splits;

  const allButLast = splits.slice(0, -1);
  const sumOfRest = allButLast.reduce((acc, s) => acc + s.amount, 0);
  const lastAmount = roundCurrency(total - sumOfRest);

  return [
    ...allButLast,
    { ...splits[splits.length - 1], amount: lastAmount },
  ];
}

export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}
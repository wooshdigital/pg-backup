export function formatCurrency(amount: number, decimals = 2): string {
  return amount.toFixed(decimals);
}

export function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
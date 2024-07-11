const numberFormat = Intl.NumberFormat('en', { notation: 'compact' });

export function formatCompact(number: number) {
  return numberFormat.format(number);
}

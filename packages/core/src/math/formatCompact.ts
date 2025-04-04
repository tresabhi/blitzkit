export function formatCompact(locale: string, number: number) {
  const numberFormat = Intl.NumberFormat(locale, { notation: 'compact' });
  return numberFormat.format(number);
}

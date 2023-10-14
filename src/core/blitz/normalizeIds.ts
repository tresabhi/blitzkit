export function normalizeIds(ids: number | number[]): string {
  return typeof ids === 'number' ? ids.toString() : ids.join(',');
}

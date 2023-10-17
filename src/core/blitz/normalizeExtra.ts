export function normalizeExtra(extra?: string[]) {
  return extra ? `&extra=${extra.join(',')}` : '';
}

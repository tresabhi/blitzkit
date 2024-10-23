export function NaNFallback(value: number, fallback: number) {
  return isNaN(value) ? fallback : value;
}

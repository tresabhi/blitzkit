export default function isNumber(value: any) {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

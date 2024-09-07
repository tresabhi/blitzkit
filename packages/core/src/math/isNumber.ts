export default function isNumber(value: any) {
  return typeof value === 'number' && isFinite(value);
}

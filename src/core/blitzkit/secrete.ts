export function assertSecrete(secrete?: string) {
  if (secrete === undefined) throw new Error('Missing secret');
  return secrete;
}

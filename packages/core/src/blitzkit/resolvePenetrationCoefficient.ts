import { ShellType } from '../blitzkit/tankDefinitions';

export function resolvePenetrationCoefficient(
  calibratedShells: boolean,
  type: ShellType,
) {
  if (!calibratedShells) return 1;

  return type === 'ap'
    ? 1.08
    : type === 'ap_cr'
      ? 1.05
      : type === 'hc'
        ? 1.13
        : 1.08;
}

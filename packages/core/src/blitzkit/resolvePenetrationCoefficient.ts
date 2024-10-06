import { ShellType } from '../protos';

export function resolvePenetrationCoefficient(
  calibratedShells: boolean,
  type: ShellType,
) {
  if (!calibratedShells) return 1;

  return type === ShellType.AP
    ? 1.08
    : type === ShellType.APCR
      ? 1.05
      : type === ShellType.HEAT
        ? 1.13
        : 1.08;
}

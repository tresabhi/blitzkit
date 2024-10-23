import { ShellDefinition, ShellType } from '@blitzkit/core';

export function isExplosive(
  type: ShellDefinition['type'],
): type is ShellType.HEAT | ShellType.HE {
  return type === ShellType.HEAT || type === ShellType.HE;
}

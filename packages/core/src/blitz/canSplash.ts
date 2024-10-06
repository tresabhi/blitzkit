import { type ShellDefinition, ShellType } from '@blitzkit/core';

export function canSplash(type: ShellDefinition['type']): type is ShellType.HE {
  return type === ShellType.HE;
}

import { ShellDefinition, ShellType } from '../blitzkit/tankDefinitions';

export function canSplash(type: ShellDefinition['type']): type is ShellType.HE {
  return type === ShellType.HE;
}

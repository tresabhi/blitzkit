import { ShellDefinition } from '../blitzkrieg/tankDefinitions';

export function canRicochet(
  type: ShellDefinition['type'],
): type is 'ap' | 'ap_cr' {
  return type === 'ap' || type === 'ap_cr';
}

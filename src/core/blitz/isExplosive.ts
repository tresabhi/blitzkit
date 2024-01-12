import { ShellDefinition } from '../blitzkrieg/tankDefinitions';

export function isExplosive(
  type: ShellDefinition['type'],
): type is 'he' | 'hc' {
  return type === 'he' || type === 'hc';
}

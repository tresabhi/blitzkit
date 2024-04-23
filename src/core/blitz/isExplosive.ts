import { ShellDefinition } from '../blitzkit/tankDefinitions';

export function isExplosive(
  type: ShellDefinition['type'],
): type is 'he' | 'hc' {
  return type === 'he' || type === 'hc';
}

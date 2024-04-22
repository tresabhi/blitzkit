import { ShellDefinition } from '../blitzrinth/tankDefinitions';

export function isExplosive(
  type: ShellDefinition['type'],
): type is 'he' | 'hc' {
  return type === 'he' || type === 'hc';
}

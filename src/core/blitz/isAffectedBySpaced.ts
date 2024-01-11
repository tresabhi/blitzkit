import { ShellDefinition } from '../blitzkrieg/tankDefinitions';

export function isAffectedBySpaced(
  type: ShellDefinition['type'],
): type is 'he' | 'hc' {
  return type === 'he' || type === 'hc';
}

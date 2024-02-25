import { ShellDefinition } from '../blitzkrieg/tankDefinitions';

export function canRicochet(
  type: ShellDefinition['type'],
): type is Exclude<ShellDefinition['type'], 'he'> {
  return type !== 'he';
}

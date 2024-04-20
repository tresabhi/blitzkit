import { ShellDefinition } from '../blitzrinth/tankDefinitions';

export function canRicochet(
  type: ShellDefinition['type'],
): type is Exclude<ShellDefinition['type'], 'he'> {
  return type !== 'he';
}

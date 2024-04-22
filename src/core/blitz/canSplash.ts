import { ShellDefinition } from '../blitzrinth/tankDefinitions';

export function canSplash(type: ShellDefinition['type']): type is 'he' {
  return type === 'he';
}

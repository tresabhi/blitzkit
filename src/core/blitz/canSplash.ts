import { ShellDefinition } from '../blitzkit/tankDefinitions';

export function canSplash(type: ShellDefinition['type']): type is 'he' {
  return type === 'he';
}

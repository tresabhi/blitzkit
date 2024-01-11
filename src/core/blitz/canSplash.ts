import { ShellDefinition } from '../blitzkrieg/tankDefinitions';

export function canSplash(type: ShellDefinition['type']): type is 'he' {
  return type === 'he';
}

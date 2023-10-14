import { ChatInputCommandInteraction } from 'discord.js';
import primaryButton from './primaryButton';

export function refreshButton(
  interaction: ChatInputCommandInteraction,
  path: string,
) {
  if (
    interaction.appPermissions?.has('AttachFiles') &&
    interaction.appPermissions?.has('ViewChannel')
  ) {
    return primaryButton(path, 'Refresh');
  }

  return null;
}

import { ChatInputCommandInteraction } from 'discord.js';
import buttonPrimary from './buttonPrimary';

export function buttonRefresh(
  interaction: ChatInputCommandInteraction,
  path: string,
) {
  if (
    interaction.appPermissions?.has('AttachFiles') &&
    interaction.appPermissions?.has('ViewChannel')
  ) {
    return buttonPrimary(path, 'Refresh');
  }

  return null;
}

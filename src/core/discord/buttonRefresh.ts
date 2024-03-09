import { ChatInputCommandInteraction } from 'discord.js';
import { translator } from '../localization/translator';
import buttonPrimary from './buttonPrimary';

export function buttonRefresh(
  interaction: ChatInputCommandInteraction,
  path: string,
) {
  const { t } = translator(interaction.locale);

  if (
    interaction.appPermissions?.has('ReadMessageHistory') &&
    interaction.appPermissions?.has('ViewChannel')
  ) {
    return buttonPrimary(path, t`bot.common.buttons.refresh`);
  }

  return null;
}

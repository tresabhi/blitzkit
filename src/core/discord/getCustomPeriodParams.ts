import { ChatInputCommandInteraction } from 'discord.js';
import { PeriodType } from './addPeriodSubCommands';

export function getCustomPeriodParams(
  interaction: ChatInputCommandInteraction,
) {
  if ((interaction.options.getSubcommand() as PeriodType) === 'custom')
    return {
      start: interaction.options.getInteger('start', true),
      end: interaction.options.getInteger('end', true),
    };

  return undefined;
}

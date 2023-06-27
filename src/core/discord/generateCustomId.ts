import { CacheType, ChatInputCommandInteraction } from 'discord.js';

export default function generateCustomId(
  interaction: ChatInputCommandInteraction<CacheType>,
) {
  return `${interaction.commandName}/${
    interaction.options.getSubcommandGroup() ?? ''
  }/${interaction.options.getSubcommand() ?? ''}`;
}

import { SlashCommandSubcommandBuilder } from 'discord.js';

export default function addCustomPeriodOption(
  option: SlashCommandSubcommandBuilder,
) {
  return option
    .addIntegerOption((option) =>
      option
        .setName('start')
        .setDescription('Start of period in days ago from today')
        .setMinValue(0)
        .setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName('end')
        .setDescription('End of period in days ago from today')
        .setMinValue(0)
        .setRequired(true),
    );
}

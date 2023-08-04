import {
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
} from 'discord.js';
import { PERIOD_NAMES } from '../discord/resolvePeriodFromCommand';

export type Period = 'period' | 'customperiod';

export default function addPeriodSubCommands(
  option: SlashCommandSubcommandGroupBuilder,
  extra: (
    option: SlashCommandSubcommandBuilder,
  ) => SlashCommandSubcommandBuilder = (option) => option,
) {
  return option
    .addSubcommand((option) =>
      extra(
        option
          .setName('period' satisfies Period)
          .setDescription(PERIOD_NAMES.period)
          .addStringOption((option) =>
            option
              .setName('days')
              .setDescription('A preset period')
              .setChoices(
                { name: 'Today', value: '1' },
                { name: '30 days', value: '30' },
                { name: '60 days', value: '60' },
                { name: '90 days', value: '90' },
                { name: 'Career', value: 'Infinity' },
              )
              .setRequired(true),
          ),
      ),
    )
    .addSubcommand((option) =>
      extra(
        option
          .setName('customperiod' satisfies Period)
          .setDescription(PERIOD_NAMES.customperiod)
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
          ),
      ),
    );
}

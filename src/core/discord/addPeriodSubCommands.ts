import {
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
} from 'discord.js';
import { PERIOD_NAMES } from '../discord/resolvePeriodFromCommand';

export type PeriodSubcommand = 'period' | 'custom';
export type PeriodOption = `${number}` | 'career';

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
          .setName('period' satisfies PeriodSubcommand)
          .setDescription(PERIOD_NAMES.period)
          .addStringOption((option) =>
            option
              .setName('period')
              .setDescription('A preset period')
              .setChoices(
                { name: 'Today', value: '1' satisfies PeriodOption },
                { name: '30 days', value: '30' satisfies PeriodOption },
                { name: '60 days', value: '60' satisfies PeriodOption },
                { name: '90 days', value: '90' satisfies PeriodOption },
                { name: 'Career', value: 'career' satisfies PeriodOption },
              )
              .setRequired(true),
          ),
      ),
    )
    .addSubcommand((option) =>
      extra(
        option
          .setName('custom' satisfies PeriodSubcommand)
          .setDescription(PERIOD_NAMES.custom)
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

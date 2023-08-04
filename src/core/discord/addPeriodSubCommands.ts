import {
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
} from 'discord.js';

export type PeriodType = 'period' | 'custom';
export type PeriodSize = `${number}` | 'career';

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
          .setName('period' satisfies PeriodType)
          .setDescription("Preset period's statistics")
          .addStringOption((option) =>
            option
              .setName('period')
              .setDescription('A preset period')
              .setChoices(
                { name: 'Today', value: '1' satisfies PeriodSize },
                { name: '30 days', value: '30' satisfies PeriodSize },
                { name: '60 days', value: '60' satisfies PeriodSize },
                { name: '90 days', value: '90' satisfies PeriodSize },
                { name: 'Career', value: 'career' satisfies PeriodSize },
              )
              .setRequired(true),
          ),
      ),
    )
    .addSubcommand((option) =>
      extra(
        option
          .setName('custom' satisfies PeriodType)
          .setDescription("Custom period's statistics")
          .addIntegerOption((option) =>
            option
              .setName('start')
              .setDescription('Days ago from today')
              .setMinValue(0)
              .setRequired(true),
          )
          .addIntegerOption((option) =>
            option
              .setName('end')
              .setDescription('Days ago from today')
              .setMinValue(0)
              .setRequired(true),
          ),
      ),
    );
}

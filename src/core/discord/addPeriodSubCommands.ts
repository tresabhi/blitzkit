import {
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
} from 'discord.js';

export type PeriodType = 'today' | '30' | '60' | '90' | 'career' | 'custom';
export type PeriodSize = 'today' | `${number}` | 'career';

export default function addPeriodSubCommands(
  option: SlashCommandBuilder | SlashCommandSubcommandGroupBuilder,
  extra: (
    option: SlashCommandSubcommandBuilder,
  ) => SlashCommandSubcommandBuilder = (option) => option,
) {
  option
    .addSubcommand((option) =>
      extra(option.setName('today').setDescription('Today')),
    )
    .addSubcommand((option) =>
      extra(option.setName('30').setDescription('30 days')),
    )
    .addSubcommand((option) =>
      extra(option.setName('60').setDescription('60 days')),
    )
    .addSubcommand((option) =>
      extra(option.setName('90').setDescription('90 days')),
    )
    .addSubcommand((option) =>
      extra(option.setName('career').setDescription('Career')),
    )
    .addSubcommand((option) =>
      extra(
        option
          .setName('custom')
          .setDescription('Custom range')
          .addIntegerOption((option) =>
            option
              .setName('start')
              .setDescription('Start in number of days ago from today')
              .setRequired(true),
          )
          .addIntegerOption((option) =>
            option
              .setName('end')
              .setDescription('End in number of days')
              .setRequired(true),
          ),
      ),
    );
}

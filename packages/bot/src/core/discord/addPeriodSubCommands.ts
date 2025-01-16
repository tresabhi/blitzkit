import {
  Locale,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
} from 'discord.js';
import { translator } from '../localization/translator';
import { localizationObject } from './localizationObject';

export type PeriodType = 'today' | '30' | '60' | '90' | 'career' | 'custom';
export type PeriodSize = 'today' | `${number}` | 'career';

export function addPeriodSubCommands(
  option: SlashCommandBuilder | SlashCommandSubcommandGroupBuilder,
  extra: (
    option: SlashCommandSubcommandBuilder,
  ) => SlashCommandSubcommandBuilder = (option) => option,
) {
  const { strings } = translator(Locale.EnglishUS);
  const subcommandNameLocalizations = {
    today: localizationObject(
      (strings) => strings.bot.common.subcommands.today.$,
      undefined,
      true,
    ),
    30: localizationObject(
      (strings) => strings.bot.common.subcommands[30].$,
      undefined,
      true,
    ),
    60: localizationObject(
      (strings) => strings.bot.common.subcommands[60].$,
      undefined,
      true,
    ),
    90: localizationObject(
      (strings) => strings.bot.common.subcommands[90].$,
      undefined,
      true,
    ),
    career: localizationObject(
      (strings) => strings.bot.common.subcommands.career.$,
      undefined,
      true,
    ),
    custom: localizationObject(
      (strings) => strings.bot.common.subcommands.custom.$,
      undefined,
      true,
    ),
  };
  const subcommandDescriptionLocalizations = {
    today: localizationObject(
      (strings) => strings.bot.common.subcommands.today.description,
    ),
    30: localizationObject(
      (strings) => strings.bot.common.subcommands[30].description,
    ),
    60: localizationObject(
      (strings) => strings.bot.common.subcommands[60].description,
    ),
    90: localizationObject(
      (strings) => strings.bot.common.subcommands[90].description,
    ),
    career: localizationObject(
      (strings) => strings.bot.common.subcommands.career.description,
    ),
    custom: localizationObject(
      (strings) => strings.bot.common.subcommands.custom.description,
    ),
  };

  option
    .addSubcommand((option) =>
      extra(
        option
          .setName(strings.bot.common.subcommands.today.$)
          .setNameLocalizations(subcommandNameLocalizations.today)
          .setDescription(strings.bot.common.subcommands.today.description)
          .setDescriptionLocalizations(
            subcommandDescriptionLocalizations.today,
          ),
      ),
    )
    .addSubcommand((option) =>
      extra(
        option
          .setName(strings.bot.common.subcommands[30].$)
          .setNameLocalizations(subcommandNameLocalizations[30])
          .setDescription(strings.bot.common.subcommands[30].description)
          .setDescriptionLocalizations(subcommandDescriptionLocalizations[30]),
      ),
    )
    .addSubcommand((option) =>
      extra(
        option
          .setName(strings.bot.common.subcommands[60].$)
          .setNameLocalizations(subcommandNameLocalizations[60])
          .setDescription(strings.bot.common.subcommands[60].description)
          .setDescriptionLocalizations(subcommandDescriptionLocalizations[60]),
      ),
    )
    .addSubcommand((option) =>
      extra(
        option
          .setName(strings.bot.common.subcommands[90].$)
          .setNameLocalizations(subcommandNameLocalizations[90])
          .setDescription(strings.bot.common.subcommands[90].description)
          .setDescriptionLocalizations(subcommandDescriptionLocalizations[90]),
      ),
    )
    .addSubcommand((option) =>
      extra(
        option
          .setName(strings.bot.common.subcommands.career.$)
          .setNameLocalizations(subcommandNameLocalizations.career)
          .setDescription(strings.bot.common.subcommands.career.description)
          .setDescriptionLocalizations(
            subcommandDescriptionLocalizations.career,
          ),
      ),
    )
    .addSubcommand((option) =>
      extra(
        option
          .setName(strings.bot.common.subcommands.custom.$)
          .setNameLocalizations(subcommandNameLocalizations.custom)
          .setDescription(strings.bot.common.subcommands.custom.description)
          .setDescriptionLocalizations(
            subcommandDescriptionLocalizations.custom,
          )
          .addIntegerOption((option) =>
            option
              .setName(strings.bot.common.subcommands.custom.options.start.$)
              .setDescription(
                strings.bot.common.subcommands.custom.options.start.description,
              )
              .setRequired(true),
          )
          .addIntegerOption((option) =>
            option
              .setName(strings.bot.common.subcommands.custom.options.end.$)
              .setDescription(
                strings.bot.common.subcommands.custom.options.end.description,
              )
              .setRequired(true),
          ),
      ),
    );
}

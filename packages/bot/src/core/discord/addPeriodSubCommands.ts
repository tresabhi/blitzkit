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
      (strings) => strings.bot.common.subcommands.today.name,
      undefined,
      true,
    ),
    30: localizationObject(
      (strings) => strings.bot.common.subcommands[30].name,
      undefined,
      true,
    ),
    60: localizationObject(
      (strings) => strings.bot.common.subcommands[60].name,
      undefined,
      true,
    ),
    90: localizationObject(
      (strings) => strings.bot.common.subcommands[90].name,
      undefined,
      true,
    ),
    career: localizationObject(
      (strings) => strings.bot.common.subcommands.career.name,
      undefined,
      true,
    ),
    custom: localizationObject(
      (strings) => strings.bot.common.subcommands.custom.name,
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
          .setName(strings.bot.common.subcommands.today.name)
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
          .setName(strings.bot.common.subcommands[30].name)
          .setNameLocalizations(subcommandNameLocalizations[30])
          .setDescription(strings.bot.common.subcommands[30].description)
          .setDescriptionLocalizations(subcommandDescriptionLocalizations[30]),
      ),
    )
    .addSubcommand((option) =>
      extra(
        option
          .setName(strings.bot.common.subcommands[60].name)
          .setNameLocalizations(subcommandNameLocalizations[60])
          .setDescription(strings.bot.common.subcommands[60].description)
          .setDescriptionLocalizations(subcommandDescriptionLocalizations[60]),
      ),
    )
    .addSubcommand((option) =>
      extra(
        option
          .setName(strings.bot.common.subcommands[90].name)
          .setNameLocalizations(subcommandNameLocalizations[90])
          .setDescription(strings.bot.common.subcommands[90].description)
          .setDescriptionLocalizations(subcommandDescriptionLocalizations[90]),
      ),
    )
    .addSubcommand((option) =>
      extra(
        option
          .setName(strings.bot.common.subcommands.career.name)
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
          .setName(strings.bot.common.subcommands.custom.name)
          .setNameLocalizations(subcommandNameLocalizations.custom)
          .setDescription(strings.bot.common.subcommands.custom.description)
          .setDescriptionLocalizations(
            subcommandDescriptionLocalizations.custom,
          )
          .addIntegerOption((option) =>
            option
              .setName(strings.bot.common.subcommands.custom.options.start.name)
              .setDescription(
                strings.bot.common.subcommands.custom.options.start.description,
              )
              .setRequired(true),
          )
          .addIntegerOption((option) =>
            option
              .setName(strings.bot.common.subcommands.custom.options.end.name)
              .setDescription(
                strings.bot.common.subcommands.custom.options.end.description,
              )
              .setRequired(true),
          ),
      ),
    );
}

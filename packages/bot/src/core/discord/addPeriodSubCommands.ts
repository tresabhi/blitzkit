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
  const { translate } = translator(Locale.EnglishUS);
  const subcommandNameLocalizations = {
    today: localizationObject('bot.common.subcommands.today'),
    30: localizationObject('bot.common.subcommands.30'),
    60: localizationObject('bot.common.subcommands.60'),
    90: localizationObject('bot.common.subcommands.90'),
    career: localizationObject('bot.common.subcommands.career'),
    custom: localizationObject('bot.common.subcommands.custom'),
  };
  const subcommandDescriptionLocalizations = {
    today: localizationObject('bot.common.subcommands.today.description'),
    30: localizationObject('bot.common.subcommands.30.description'),
    60: localizationObject('bot.common.subcommands.60.description'),
    90: localizationObject('bot.common.subcommands.90.description'),
    career: localizationObject('bot.common.subcommands.career.description'),
    custom: localizationObject('bot.common.subcommands.custom.description'),
  };

  option
    .addSubcommand((option) =>
      extra(
        option
          .setName(translate('bot.common.subcommands.today'))
          .setNameLocalizations(subcommandNameLocalizations.today)
          .setDescription(translate('bot.common.subcommands.today.description'))
          .setDescriptionLocalizations(
            subcommandDescriptionLocalizations.today,
          ),
      ),
    )
    .addSubcommand((option) =>
      extra(
        option
          .setName(translate('bot.common.subcommands.30'))
          .setNameLocalizations(subcommandNameLocalizations[30])
          .setDescription(translate('bot.common.subcommands.30.description'))
          .setDescriptionLocalizations(subcommandDescriptionLocalizations[30]),
      ),
    )
    .addSubcommand((option) =>
      extra(
        option
          .setName(translate('bot.common.subcommands.60'))
          .setNameLocalizations(subcommandNameLocalizations[60])
          .setDescription(translate('bot.common.subcommands.60.description'))
          .setDescriptionLocalizations(subcommandDescriptionLocalizations[60]),
      ),
    )
    .addSubcommand((option) =>
      extra(
        option
          .setName(translate('bot.common.subcommands.90'))
          .setNameLocalizations(subcommandNameLocalizations[90])
          .setDescription(translate('bot.common.subcommands.90.description'))
          .setDescriptionLocalizations(subcommandDescriptionLocalizations[90]),
      ),
    )
    .addSubcommand((option) =>
      extra(
        option
          .setName(translate('bot.common.subcommands.career'))
          .setNameLocalizations(subcommandNameLocalizations.career)
          .setDescription(
            translate('bot.common.subcommands.career.description'),
          )
          .setDescriptionLocalizations(
            subcommandDescriptionLocalizations.career,
          ),
      ),
    )
    .addSubcommand((option) =>
      extra(
        option
          .setName(translate('bot.common.subcommands.custom'))
          .setNameLocalizations(subcommandNameLocalizations.custom)
          .setDescription(
            translate('bot.common.subcommands.custom.description'),
          )
          .setDescriptionLocalizations(
            subcommandDescriptionLocalizations.custom,
          )
          .addIntegerOption((option) =>
            option
              .setName(translate('bot.common.subcommands.custom.options.start'))
              .setDescription(
                translate(
                  'bot.common.subcommands.custom.options.start.description',
                ),
              )
              .setRequired(true),
          )
          .addIntegerOption((option) =>
            option
              .setName(translate('bot.common.subcommands.custom.options.end'))
              .setDescription(
                translate(
                  'bot.common.subcommands.custom.options.end.description',
                ),
              )
              .setRequired(true),
          ),
      ),
    );
}

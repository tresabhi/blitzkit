import {
  TANK_CLASSES,
  TANK_TYPE_COMMAND_NAMES,
  TANK_TYPES,
} from '@blitzkit/core';
import {
  APIApplicationCommandOptionChoice,
  Locale,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from 'discord.js';
import { translator } from '../localization/translator';
import { addTankChoices } from './addTankChoices';
import { addTierChoices } from './addTierChoices';
import { localizationObject } from './localizationObject';

export function addFilterOptions<
  Option extends SlashCommandBuilder | SlashCommandSubcommandBuilder,
>(option: Option, nations: string[]) {
  const { translate } = translator(Locale.EnglishUS);

  return (
    option
      .addStringOption((option) =>
        option
          .setName(translate('bot.common.options.filters.nation'))
          .setNameLocalizations(
            localizationObject('bot.common.options.filters.nation'),
          )
          .setDescription(
            translate('bot.common.options.filters.nation.description'),
          )
          .setDescriptionLocalizations(
            localizationObject('bot.common.options.filters.nation.description'),
          )
          .addChoices(
            ...nations.map(
              (nation) =>
                ({
                  value: nation,
                  name: translate(`common.nations.${nation}`),
                  name_localizations: localizationObject(
                    `common.nations.${nation}`,
                  ),
                }) satisfies APIApplicationCommandOptionChoice,
            ),
          )
          .setRequired(false),
      )
      .addStringOption((option) => addTierChoices(option).setRequired(false))
      .addStringOption((option) =>
        option
          .setName(translate('bot.common.options.filters.class'))
          .setNameLocalizations(
            localizationObject('bot.common.options.filters.class'),
          )
          .setDescription(
            translate('bot.common.options.filters.class.description'),
          )
          .setDescriptionLocalizations(
            localizationObject('bot.common.options.filters.class.description'),
          )
          .addChoices(
            ...TANK_CLASSES.map(
              (tankType) =>
                ({
                  value: `${tankType}`,
                  name: translate(`common.tank_class_short.${tankType}`),
                  name_localizations: localizationObject(
                    `common.tank_class_short.${tankType}`,
                  ),
                }) satisfies APIApplicationCommandOptionChoice,
            ),
          )
          .setRequired(false),
      )
      .addStringOption((option) =>
        option
          .setName(translate('bot.common.options.filters.type'))
          .setNameLocalizations(
            localizationObject('bot.common.options.filters.type'),
          )
          .setDescription(
            translate('bot.common.options.filters.type.description'),
          )
          .setDescriptionLocalizations(
            localizationObject('bot.common.options.filters.type.description'),
          )
          .addChoices(
            ...TANK_TYPES.map(
              (treeType) =>
                ({
                  value: TANK_TYPE_COMMAND_NAMES[treeType],
                  name: translate(`common.tree_type.${treeType}`),
                  name_localizations: localizationObject(
                    `common.tree_type.${treeType}`,
                  ),
                }) satisfies APIApplicationCommandOptionChoice,
            ),
          )
          .setRequired(false),
      )
      // TODO: somehow localize this?
      .addStringOption((option) =>
        addTankChoices(option).setRequired(false),
      ) as Option
  );
}

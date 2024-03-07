import {
  APIApplicationCommandOptionChoice,
  Locale,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from 'discord.js';
import { TANK_TYPES, TREE_TYPES } from '../../components/Tanks';
import { translator } from '../localization/translator';
import addTankChoices from './addTankChoices';
import addTierChoices from './addTierChoices';
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
          .setName(translate('bot.common.options.filters.tank_type'))
          .setNameLocalizations(
            localizationObject('bot.common.options.filters.tank_type'),
          )
          .setDescription(
            translate('bot.common.options.filters.tank_type.description'),
          )
          .setDescriptionLocalizations(
            localizationObject(
              'bot.common.options.filters.tank_type.description',
            ),
          )
          .addChoices(
            ...TANK_TYPES.map(
              (tankType) =>
                ({
                  value: tankType,
                  name: translate(`common.tank_type_short.${tankType}`),
                  name_localizations: localizationObject(
                    `common.tank_type_short.${tankType}`,
                  ),
                }) satisfies APIApplicationCommandOptionChoice,
            ),
          )
          .setRequired(false),
      )
      .addStringOption((option) =>
        option
          .setName(translate('bot.common.options.filters.tree_type'))
          .setNameLocalizations(
            localizationObject('bot.common.options.filters.tree_type'),
          )
          .setDescription(
            translate('bot.common.options.filters.tree_type.description'),
          )
          .setDescriptionLocalizations(
            localizationObject(
              'bot.common.options.filters.tree_type.description',
            ),
          )
          .addChoices(
            ...TREE_TYPES.map(
              (treeType) =>
                ({
                  value: treeType,
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

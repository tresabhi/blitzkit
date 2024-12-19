import { REGIONS } from '@blitzkit/core';
import {
  APIApplicationCommandOptionChoice,
  Locale,
  SlashCommandStringOption,
} from 'discord.js';
import { translator } from '../localization/translator';
import { localizationObject } from './localizationObject';

export function addRegionChoices(option: SlashCommandStringOption) {
  const { t, translate } = translator(Locale.EnglishUS);

  return option
    .setName(t`bot.common.options.region`)
    .setNameLocalizations(
      localizationObject('bot.common.options.region', undefined, true),
    )
    .setDescription(t`bot.common.options.region.description`)
    .setDescriptionLocalizations(
      localizationObject('bot.common.options.region.description'),
    )
    .addChoices(
      ...REGIONS.map(
        (region) =>
          ({
            value: region,
            name: translate(`common.regions.normal.${region}`),
            name_localizations: localizationObject(
              `common.regions.normal.${region}`,
            ),
          }) satisfies APIApplicationCommandOptionChoice,
      ),
    )
    .setRequired(true);
}

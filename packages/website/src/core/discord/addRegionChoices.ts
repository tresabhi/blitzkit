import {
  APIApplicationCommandOptionChoice,
  Locale,
  SlashCommandStringOption,
} from 'discord.js';
import { REGIONS } from '../../constants/regions';
import { translator } from '../localization/translator';
import { localizationObject } from './localizationObject';

export default function addRegionChoices(option: SlashCommandStringOption) {
  const { t, translate } = translator(Locale.EnglishUS);

  return option
    .setName(t`bot.common.options.region`)
    .setNameLocalizations(localizationObject('bot.common.options.region'))
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

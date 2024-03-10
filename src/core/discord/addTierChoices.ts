import {
  APIApplicationCommandOptionChoice,
  Locale,
  SlashCommandStringOption,
} from 'discord.js';
import { range } from 'lodash';
import { translator } from '../localization/translator';
import numberToRomanNumeral from '../math/numberToRomanNumeral';
import { localizationObject } from './localizationObject';

export default function addTierChoices(option: SlashCommandStringOption) {
  const { t, translate } = translator(Locale.EnglishUS);

  return option
    .setName(t`bot.common.options.tier`)
    .setNameLocalizations(localizationObject('bot.common.options.tier'))
    .setDescription(t`bot.common.options.tier.description`)
    .setDescriptionLocalizations(
      localizationObject('bot.common.options.tier.description'),
    )
    .setChoices(
      ...range(10, 0).map(
        (tier) =>
          ({
            name: translate('bot.common.options.tier.choices.tier', [
              `${tier}`,
              numberToRomanNumeral(tier),
            ]),
            value: `${tier}`,
            name_localizations: localizationObject(
              'bot.common.options.tier.choices.tier',
              [`${tier}`, numberToRomanNumeral(tier)],
            ),
          }) satisfies APIApplicationCommandOptionChoice,
      ),
    )
    .setRequired(true);
}

import { Locale, SlashCommandStringOption } from 'discord.js';
import { translator } from '../localization/translator';
import { localizationObject } from './localizationObject';

export function addTankChoices(option: SlashCommandStringOption) {
  const { translate } = translator(Locale.EnglishUS);

  return option
    .setName(translate('bot.common.options.tank'))
    .setNameLocalizations(
      localizationObject('bot.common.options.tank', undefined, true),
    )
    .setDescription(translate('bot.common.options.tank.description'))
    .setDescriptionLocalizations(
      localizationObject('bot.common.options.tank.description'),
    )
    .setAutocomplete(true)
    .setRequired(true);
}

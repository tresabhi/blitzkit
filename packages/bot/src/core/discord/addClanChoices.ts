import { Locale, SlashCommandStringOption } from 'discord.js';
import { translator } from '../localization/translator';
import { localizationObject } from './localizationObject';

export function addClanChoices(option: SlashCommandStringOption) {
  const { translate } = translator(Locale.EnglishUS);

  return option
    .setName('clan')
    .setNameLocalizations(
      localizationObject('bot.common.options.clan', undefined, true),
    )
    .setDescription(translate('bot.common.options.clan.description'))
    .setDescriptionLocalizations(
      localizationObject('bot.common.options.clan.description'),
    )
    .setAutocomplete(true)
    .setMinLength(2)
    .setRequired(true);
}

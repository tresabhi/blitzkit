import { Locale, SlashCommandStringOption } from 'discord.js';
import { translator } from '../localization/translator';
import { localizationObject } from './localizationObject';

export default function addUsernameChoices(option: SlashCommandStringOption) {
  const { t } = translator(Locale.EnglishUS);

  return option
    .setName(t`bot.common.options.username`)
    .setNameLocalizations(localizationObject('bot.common.options.username'))
    .setDescription(t`bot.common.options.username.description`)
    .setDescriptionLocalizations(
      localizationObject('bot.common.options.username.description'),
    )
    .setAutocomplete(true);
}

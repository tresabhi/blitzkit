import { Locale, SlashCommandStringOption } from 'discord.js';
import { translator } from '../localization/translator';
import { localizationObject } from './localizationObject';

export function addUsernameChoices(option: SlashCommandStringOption) {
  const { strings } = translator(Locale.EnglishUS);

  return option
    .setName(strings.bot.common.options.username.$)
    .setNameLocalizations(
      localizationObject(
        (strings) => strings.bot.common.options.username.$,
        undefined,
        true,
      ),
    )
    .setDescription(strings.bot.common.options.username.description)
    .setDescriptionLocalizations(
      localizationObject(
        (strings) => strings.bot.common.options.username.description,
      ),
    )
    .setAutocomplete(true);
}

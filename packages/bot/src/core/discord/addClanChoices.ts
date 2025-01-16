import { Locale, SlashCommandStringOption } from 'discord.js';
import { translator } from '../localization/translator';
import { localizationObject } from './localizationObject';

export function addClanChoices(option: SlashCommandStringOption) {
  const { strings } = translator(Locale.EnglishUS);

  return option
    .setName('clan')
    .setNameLocalizations(
      localizationObject(
        (strings) => strings.bot.common.options.clan.name,
        undefined,
        true,
      ),
    )
    .setDescription(strings.bot.common.options.clan.description)
    .setDescriptionLocalizations(
      localizationObject(
        (strings) => strings.bot.common.options.clan.description,
      ),
    )
    .setAutocomplete(true)
    .setMinLength(2)
    .setRequired(true);
}

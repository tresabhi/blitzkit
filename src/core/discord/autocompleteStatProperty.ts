import { AutocompleteInteraction, CacheType } from 'discord.js';
import { go } from 'fuzzysort';
import { STAT_PROPERTIES } from '../blitzkrieg/addStatPropertyOptions';

export default async function autocompleteStatProperty(
  interaction: AutocompleteInteraction<CacheType>,
  name = 'stat-property',
) {
  const focusedOption = interaction.options.getFocused(true);
  if (focusedOption.name !== name) return;

  await interaction.respond(
    focusedOption.value
      ? go(focusedOption.value, STAT_PROPERTIES, {
          keys: ['name'],
          limit: 10,
        }).map(({ obj }) => obj)
      : STAT_PROPERTIES.slice(0, 25),
  );
}

import {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  CacheType,
} from 'discord.js';
import { go } from 'fuzzysort';
import { TANKS, TANK_NAMES_DIACRITICS } from '../blitz/tankopedia';

export default async function autocompleteTanks(
  interaction: AutocompleteInteraction<CacheType>,
) {
  const focusedOption = interaction.options.getFocused(true);
  if (focusedOption.name !== 'tank') return;

  await interaction.respond(
    focusedOption.value
      ? await Promise.all(
          go(focusedOption.value, await TANK_NAMES_DIACRITICS, {
            keys: ['combined'],
            limit: 10,
          }).map(
            async (item, index) =>
              ({
                name: item.obj.original,
                value: `${(await TANKS)[index].tank_id}`,
              }) satisfies ApplicationCommandOptionChoiceData<string>,
          ),
        )
      : [],
  );

  console.log(`Tanks autocomplete for ${focusedOption.value}`);
}

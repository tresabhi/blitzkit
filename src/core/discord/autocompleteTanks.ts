import {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  CacheType,
} from 'discord.js';
import { go } from 'fuzzysort';
import { TANK_NAMES_DIACRITICS } from '../blitz/tankopedia';

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
            async (item) =>
              ({
                name: item.obj.original,
                value: `${item.obj.id}`,
              }) satisfies ApplicationCommandOptionChoiceData<string>,
          ),
        )
      : [],
  );
}

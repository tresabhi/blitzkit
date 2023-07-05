import {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  CacheType,
} from 'discord.js';
import { go } from 'fuzzysort';
import resolveTankName from '../blitz/resolveTankName.js';
import { TANKS } from '../blitz/tankopedia.js';

export default async function autocompleteTanks(
  interaction: AutocompleteInteraction<CacheType>,
) {
  const focusedOption = interaction.options.getFocused(true);
  if (focusedOption.name !== 'tank') return;

  await interaction.respond(
    focusedOption.value
      ? await Promise.all(
          go(focusedOption.value, TANKS, { keys: ['name'], limit: 10 }).map(
            async (item) =>
              ({
                name: item.obj.name
                  ? item.obj.name
                  : await resolveTankName(item.obj.tank_id),
                value: `${item.obj.tank_id}`,
              } satisfies ApplicationCommandOptionChoiceData<string>),
          ),
        )
      : [],
  );

  console.log(`Tanks autocomplete for ${focusedOption.value}`);
}

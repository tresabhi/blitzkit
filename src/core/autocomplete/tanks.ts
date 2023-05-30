import {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  CacheType,
} from 'discord.js';
import { go } from 'fuzzysort';
import resolveTankName from '../../utilities/resolveTankName.js';
import { tanks } from '../blitzstars/tankopedia.js';

export default async function tanksAutocomplete(
  interaction: AutocompleteInteraction<CacheType>,
) {
  const focusedOption = interaction.options.getFocused(true);
  if (focusedOption.name !== 'tank') return;

  await interaction.respond(
    focusedOption.value
      ? go(focusedOption.value, tanks, { keys: ['name'], limit: 10 }).map(
          (item) =>
            ({
              name: item.obj.name
                ? item.obj.name
                : resolveTankName(item.obj.tank_id),
              value: `${item.obj.tank_id}`,
            } satisfies ApplicationCommandOptionChoiceData<string>),
        )
      : [],
  );

  console.log(`Tanks autocomplete for ${focusedOption.value}`);
}

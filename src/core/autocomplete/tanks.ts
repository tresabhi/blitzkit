import {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  CacheType,
} from 'discord.js';
import { go } from 'fuzzysort';
import { tanks } from '../../utilities/tankopedia.js';

export default async function tanksAutocomplete(
  interaction: AutocompleteInteraction<CacheType>,
) {
  const focusedValue = interaction.options.getFocused();

  await interaction.respond(
    focusedValue
      ? go(focusedValue, tanks, { keys: ['name'], limit: 10 }).map(
          (item) =>
            ({
              name: item.obj.name
                ? item.obj.name
                : `Unknown Tank ${item.obj.tank_id}`,
              value: `${item.obj.tank_id}`,
            } satisfies ApplicationCommandOptionChoiceData<string>),
        )
      : [],
  );
}

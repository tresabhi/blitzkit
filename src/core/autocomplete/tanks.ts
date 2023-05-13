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
  const focusedValue = interaction.options.getFocused();

  await interaction.respond(
    focusedValue
      ? go(focusedValue, tanks, { keys: ['name'], limit: 10 }).map(
          (item) =>
            ({
              name: item.obj.name ? item.obj.name : resolveTankName(item.obj),
              value: `${item.obj.tank_id}`,
            } satisfies ApplicationCommandOptionChoiceData<string>),
        )
      : [],
  );
}

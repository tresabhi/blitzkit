import {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  CacheType,
} from 'discord.js';
import { go } from 'fuzzysort';
import { TANK_NAMES_DIACRITICS } from '../blitzkrieg/tankopedia';
import {
  DISCORD_CHOICES_MAX_NAME_SIZE,
  OVERFLOW_SUFFIX,
} from './autocompleteClan';

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
          }).map(async (item) => {
            let name = item.obj.original;

            if (name.length > DISCORD_CHOICES_MAX_NAME_SIZE) {
              const overSize = name.length - DISCORD_CHOICES_MAX_NAME_SIZE;

              name = `${item.obj.original.slice(
                0,
                item.obj.original.length - overSize - OVERFLOW_SUFFIX.length,
              )}${OVERFLOW_SUFFIX}`;
            }

            return {
              name,
              value: `${item.obj.id}`,
            } satisfies ApplicationCommandOptionChoiceData<string>;
          }),
        )
      : [],
  );
}

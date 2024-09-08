import {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  CacheType,
} from 'discord.js';
import { go } from 'fuzzysort';
import {
  DISCORD_CHOICES_MAX_NAME_SIZE,
  OVERFLOW_SUFFIX,
} from './autocompleteClan/constants';
import { tankNames } from '@blitzkit/core';

export const tankNamesTechTreeOnly = tankNames.then((names) =>
  names.filter((tank) => tank.treeType === 'researchable'),
);

export default async function autocompleteTanks(
  interaction: AutocompleteInteraction<CacheType>,
  techTreeOnly = false,
  fields = ['tank'],
) {
  const focusedOption = interaction.options.getFocused(true);
  if (!fields.includes(focusedOption.name)) return;

  await interaction.respond(
    focusedOption.value
      ? await Promise.all(
          go(
            focusedOption.value,
            await (techTreeOnly ? tankNamesTechTreeOnly : tankNames),
            {
              keys: ['searchableName', 'searchableNameDeburr', 'camouflages'],
              limit: 10,
            },
          ).map(async (item) => {
            let name = item.obj.searchableName;

            if (name.length > DISCORD_CHOICES_MAX_NAME_SIZE) {
              const overSize = name.length - DISCORD_CHOICES_MAX_NAME_SIZE;

              name = `${item.obj.searchableName.slice(
                0,
                item.obj.searchableName.length -
                  overSize -
                  OVERFLOW_SUFFIX.length,
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

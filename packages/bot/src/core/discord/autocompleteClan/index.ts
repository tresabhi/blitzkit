import { searchClansAcrossRegions } from '@blitzkit/core';
import {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  CacheType,
} from 'discord.js';
import { translator } from '../../localization/translator';
import { DISCORD_CHOICES_MAX_NAME_SIZE, OVERFLOW_SUFFIX } from './constants';

export async function autocompleteClan(
  interaction: AutocompleteInteraction<CacheType>,
) {
  const { strings } = translator(interaction.locale);
  const focusedOption = interaction.options.getFocused(true);
  if (focusedOption.name !== 'clan') return;
  if (focusedOption.value.length < 2) return interaction.respond([]);
  const clans = await searchClansAcrossRegions(focusedOption.value);

  await interaction.respond(
    clans
      ? clans.map((clan) => {
          let name = `${clan.name} (${strings.common.regions.short[clan.region]})`;

          if (name.length > DISCORD_CHOICES_MAX_NAME_SIZE) {
            const overSize = name.length - DISCORD_CHOICES_MAX_NAME_SIZE;

            name = `${clan.name.slice(
              0,
              clan.name.length - overSize - OVERFLOW_SUFFIX.length,
            )}${OVERFLOW_SUFFIX} (${strings.common.regions.short[clan.region]})`;
          }

          return {
            name,
            value: `${clan.region}/${clan.clan_id}`,
          } satisfies ApplicationCommandOptionChoiceData<string>;
        })
      : [],
  );
}

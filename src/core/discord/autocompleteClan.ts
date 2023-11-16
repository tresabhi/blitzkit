import {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  CacheType,
} from 'discord.js';
import { REGION_NAMES_SHORT } from '../../constants/regions';
import searchClansAcrossRegions from '../blitz/searchClansAcrossRegions';

export const DISCORD_CHOICES_MAX_NAME_SIZE = 25;
export const OVERFLOW_SUFFIX = '…';

export default async function autocompleteClan(
  interaction: AutocompleteInteraction<CacheType>,
) {
  const focusedOption = interaction.options.getFocused(true);
  if (focusedOption.name !== 'clan') return;
  if (focusedOption.value.length < 2) return interaction.respond([]);
  const clans = await searchClansAcrossRegions(focusedOption.value);

  await interaction.respond(
    clans
      ? clans.map((clan) => {
          let name = `${clan.name} (${REGION_NAMES_SHORT[clan.region]})`;

          if (name.length > DISCORD_CHOICES_MAX_NAME_SIZE) {
            const overSize = name.length - DISCORD_CHOICES_MAX_NAME_SIZE;

            name = `${clan.name.slice(
              0,
              clan.name.length - overSize - OVERFLOW_SUFFIX.length,
            )}${OVERFLOW_SUFFIX} (${REGION_NAMES_SHORT[clan.region]})`;
          }

          return {
            name,
            value: `${clan.region}/${clan.clan_id}`,
          } satisfies ApplicationCommandOptionChoiceData<string>;
        })
      : [],
  );
}

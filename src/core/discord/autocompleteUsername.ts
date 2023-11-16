import {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  CacheType,
} from 'discord.js';
import { REGION_NAMES_SHORT } from '../../constants/regions';
import searchPlayersAcrossRegions from '../blitz/searchPlayersAcrossRegions';
import {
  DISCORD_CHOICES_MAX_NAME_SIZE,
  OVERFLOW_SUFFIX,
} from './autocompleteClan';

export default async function autocompleteUsername(
  interaction: AutocompleteInteraction<CacheType>,
) {
  const focusedOption = interaction.options.getFocused(true);
  if (focusedOption.name !== 'username') return;
  const players = await searchPlayersAcrossRegions(focusedOption.value);

  try {
    await interaction.respond(
      players
        ? players.map((player) => {
            let name = `${player.nickname} (${
              REGION_NAMES_SHORT[player.region]
            })`;

            if (name.length > DISCORD_CHOICES_MAX_NAME_SIZE) {
              const overSize = name.length - DISCORD_CHOICES_MAX_NAME_SIZE;

              name = `${player.nickname.slice(
                0,
                player.nickname.length - overSize - OVERFLOW_SUFFIX.length,
              )}${OVERFLOW_SUFFIX} (${REGION_NAMES_SHORT[player.region]})`;
            }

            return {
              name,
              value: `${player.region}/${player.account_id}`,
            } satisfies ApplicationCommandOptionChoiceData<string>;
          })
        : [],
    );
  } catch (error) {}
}

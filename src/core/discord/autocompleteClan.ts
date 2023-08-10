import {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  CacheType,
} from 'discord.js';
import { REGION_NAMES } from '../../constants/regions';
import listClans from '../blitz/listClans';

export default async function autocompleteClan(
  interaction: AutocompleteInteraction<CacheType>,
) {
  const focusedOption = interaction.options.getFocused(true);
  if (focusedOption.name !== 'clan') return;
  if (focusedOption.value.length < 2) return interaction.respond([]);
  const players = await listClans(focusedOption.value);

  await interaction.respond(
    players
      ? players.map(
          (player) =>
            ({
              name: `${player.name} (${REGION_NAMES[player.server]})`,
              value: `${player.server}/${player.clan_id}`,
            }) satisfies ApplicationCommandOptionChoiceData<string>,
        )
      : [],
  );

  console.log(`Clan autocomplete for ${focusedOption.value}`);
}

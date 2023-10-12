import {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  CacheType,
} from 'discord.js';
import { REGION_NAMES } from '../../constants/regions';
import listPlayers from '../blitz/listPlayers';

export default async function autocompleteUsername(
  interaction: AutocompleteInteraction<CacheType>,
) {
  const focusedOption = interaction.options.getFocused(true);
  if (focusedOption.name !== 'username') return;
  const players = await listPlayers(focusedOption.value);

  try {
    await interaction.respond(
      players
        ? players.map(
            (player) =>
              ({
                name: `${player.nickname} (${REGION_NAMES[player.region]})`,
                value: `${player.region}/${player.account_id}`,
              }) satisfies ApplicationCommandOptionChoiceData<string>,
          )
        : [],
    );
  } catch (error) {}
}

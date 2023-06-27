import {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  CacheType,
} from 'discord.js';
import { BLITZ_SERVERS } from '../../constants/servers.js';
import listPlayers from '../blitz/listPlayers.js';

export default async function usernameAutocomplete(
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
                name: `${player.nickname} (${BLITZ_SERVERS[player.server]})`,
                value: `${player.server}/${player.account_id}`,
              } satisfies ApplicationCommandOptionChoiceData<string>),
          )
        : [],
    );

    console.log(`Username autocomplete for ${focusedOption.value}`);
  } catch (error) {
    console.warn(
      `Failed to autocomplete username for ${focusedOption.value} in time`,
    );
  }
}

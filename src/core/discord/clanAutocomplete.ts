import {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  CacheType,
} from 'discord.js';
import { BLITZ_SERVERS } from '../../constants/servers.js';
import listClansPanServer from '../blitz/listClansPanServer.js';

export default async function clanAutocomplete(
  interaction: AutocompleteInteraction<CacheType>,
) {
  const focusedOption = interaction.options.getFocused(true);
  if (focusedOption.name !== 'clan') return;
  const players = await listClansPanServer(focusedOption.value);

  await interaction.respond(
    players
      ? players.map(
          (player) =>
            ({
              name: `${player.name} (${BLITZ_SERVERS[player.server]})`,
              value: `${player.server}/${player.clan_id}`,
            } satisfies ApplicationCommandOptionChoiceData<string>),
        )
      : [],
  );

  console.log(`Clan autocomplete for ${focusedOption.value}`);
}

import {
  ApplicationCommandOptionChoiceData,
  AutocompleteInteraction,
  CacheType,
} from 'discord.js';
import { BlitzServer } from '../../constants/servers.js';
import { AccountList } from '../../types/players.js';
import getWargamingResponse from '../blitz/getWargamingResponse.js';
import { args } from '../process/args.js';

export default async function usernameAutocomplete(
  interaction: AutocompleteInteraction<CacheType>,
) {
  const focusedOption = interaction.options.getFocused(true);
  if (focusedOption.name !== 'username') return;
  const server = interaction.options.getString('server') as BlitzServer;

  const players = await getWargamingResponse<AccountList>(
    `https://api.wotblitz.${
      server ?? 'com'
    }/wotb/account/list/?application_id=${
      args['wargaming-application-id']
    }&search=${focusedOption.value}&limit=10`,
  );

  await interaction.respond(
    players
      ? players.map(
          (player) =>
            ({
              name: player.nickname,
              value: `${player.account_id}`,
            } satisfies ApplicationCommandOptionChoiceData<string>),
        )
      : [],
  );

  console.log(`Username autocomplete for ${focusedOption.value}`);
}

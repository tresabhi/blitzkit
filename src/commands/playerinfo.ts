import { SlashCommandBuilder } from 'discord.js';
import markdownEscape from 'markdown-escape';
import getWargamingResponse from '../core/blitz/getWargamingResponse.js';
import addUsernameOption from '../core/discord/addUsernameOption.js';
import cleanTable from '../core/discord/cleanTable.js';
import infoEmbed from '../core/discord/infoEmbed.js';
import resolvePlayer from '../core/discord/resolvePlayer.js';
import usernameAutocomplete from '../core/discord/usernameAutocomplete.js';
import { WARGAMING_APPLICATION_ID } from '../core/node/args.js';
import { CommandRegistry } from '../events/interactionCreate/index.js';
import { AccountInfo } from '../types/accountInfo.js';

export default {
  inProduction: true,
  inDevelopment: false,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName('playerinfo')
    .setDescription('Basic information about a player')
    .addStringOption(addUsernameOption),

  async handler(interaction) {
    const account = await resolvePlayer(interaction);
    const { id, server } = account;
    const accounts = await getWargamingResponse<AccountInfo>(
      `https://api.wotblitz.${server}/wotb/account/info/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}`,
    );
    const accountInfo = accounts[id];

    return infoEmbed(
      `${markdownEscape(accountInfo.nickname)}'s information`,

      cleanTable([
        ['Nickname', `${accountInfo.nickname}`],
        ['Battles', `${accountInfo.statistics.all.battles}`],
        [
          'Winrate',
          `${(
            100 *
            (accountInfo.statistics.all.wins /
              accountInfo.statistics.all.battles)
          ).toFixed(2)}%`,
        ],
        [],
        ['Account ID', `${accountInfo.account_id}`],
        [
          'Created',
          `${new Date(accountInfo.created_at * 1000).toDateString()}`,
        ],
        [
          'Last battle',
          `${new Date(accountInfo.last_battle_time * 1000).toDateString()}`,
        ],
      ]),
    );
  },

  autocomplete: usernameAutocomplete,
} satisfies CommandRegistry;

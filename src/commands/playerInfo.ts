import { SlashCommandBuilder } from 'discord.js';
import markdownEscape from 'markdown-escape';
import getWargamingResponse from '../core/blitz/getWargamingResponse.js';
import addUsernameChoices from '../core/discord/addUsernameChoices.js';
import autocompleteUsername from '../core/discord/autocompleteUsername.js';
import embedInfo from '../core/discord/embedInfo.js';
import markdownTable from '../core/discord/markdownTable.js';
import resolvePlayerFromCommand from '../core/discord/resolvePlayerFromCommand.js';
import { WARGAMING_APPLICATION_ID } from '../core/node/arguments.js';
import { CommandRegistry } from '../events/interactionCreate/index.js';
import { AccountInfo } from '../types/accountInfo.js';

export const playerInfoCommand: CommandRegistry = {
  inProduction: true,
  inDevelopment: false,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName('playerinfo')
    .setDescription('Basic information about a player')
    .addStringOption(addUsernameChoices),

  async handler(interaction) {
    const account = await resolvePlayerFromCommand(interaction);
    const { id, server } = account;
    const accounts = await getWargamingResponse<AccountInfo>(
      `https://api.wotblitz.${server}/wotb/account/info/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${id}`,
    );
    const accountInfo = accounts[id];

    return embedInfo(
      `${markdownEscape(accountInfo.nickname)}'s information`,

      markdownTable([
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

  autocomplete: autocompleteUsername,
};

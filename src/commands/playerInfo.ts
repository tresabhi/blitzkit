import { SlashCommandBuilder } from 'discord.js';
import markdownEscape from 'markdown-escape';
import markdownTable from '../LEGACY_core/discord/markdownTable';
import resolvePlayerFromCommand from '../LEGACY_core/discord/resolvePlayerFromCommand';
import { getAccountInfo } from '../core/blitz/getAccountInfo';
import addUsernameChoices from '../core/discord/addUsernameChoices';
import autocompleteUsername from '../core/discord/autocompleteUsername';
import embedInfo from '../core/discord/embedInfo';
import { CommandRegistry } from '../events/interactionCreate';

export const playerInfoCommand: CommandRegistry = {
  inProduction: true,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName('player-info')
    .setDescription('Basic information about a player')
    .addStringOption(addUsernameChoices),

  async handler(interaction) {
    const account = await resolvePlayerFromCommand(interaction);
    const { id, region: region } = account;
    const accountInfo = await getAccountInfo(region, id);

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

import { SlashCommandBuilder } from 'discord.js';
import markdownEscape from 'markdown-escape';
import usernameAutocomplete from '../core/autocomplete/username.js';
import getBlitzAccount from '../core/blitz/getBlitzAccount.js';
import getWargamingResponse from '../core/blitz/getWargamingResponse.js';
import cleanTable from '../core/interaction/cleanTable.js';
import cmdName from '../core/interaction/cmdName.js';
import infoEmbed from '../core/interaction/infoEmbed.js';
import addUsernameOption from '../core/options/addUsernameOption.js';
import { args } from '../core/process/args.js';
import { CommandRegistry } from '../events/interactionCreate.js';
import { AccountInfo } from '../types/accountInfo.js';

export default {
  inProduction: true,
  inDevelopment: false,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName(cmdName('playerinfo'))
    .setDescription('Basic information about a player')
    .addStringOption(addUsernameOption),

  async execute(interaction) {
    const name = interaction.options.getString('username')!;
    const account = await getBlitzAccount(interaction, name);
    const { id, server } = account;
    const accounts = await getWargamingResponse<AccountInfo>(
      `https://api.wotblitz.${server}/wotb/account/info/?application_id=${args['wargaming-application-id']}&account_id=${id}`,
    );
    const accountInfo = accounts[id];

    interaction.editReply({
      embeds: [
        infoEmbed(
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
        ),
      ],
    });

    console.log(`Displaying player info for ${accountInfo.nickname}`);
  },

  autocomplete: usernameAutocomplete,
} satisfies CommandRegistry;

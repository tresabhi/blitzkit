import { SlashCommandBuilder } from 'discord.js';
import startCase from 'lodash.startcase';
import markdownEscape from 'markdown-escape';
import usernameAutocomplete from '../core/autocomplete/username.js';
import getBlitzAccount from '../core/blitz/getBlitzAccount.js';
import getWargamingResponse from '../core/blitz/getWargamingResponse.js';
import cleanTable, { TableInputEntry } from '../core/interaction/cleanTable.js';
import cmdName from '../core/interaction/cmdName.js';
import infoEmbed from '../core/interaction/infoEmbed.js';
import addUsernameOption from '../core/options/addUsernameOption.js';
import { wargamingApplicationId } from '../core/process/args.js';
import { CommandRegistry } from '../events/interactionCreate.js';
import { AccountAchievements } from '../types/accountAchievements.js';
import { AccountInfo } from '../types/accountInfo.js';

type SortBy = 'name' | 'count';

export default {
  inProduction: true,
  inDevelopment: false,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName(cmdName('playerachievements'))
    .setDescription("All the player's achievements")
    .addStringOption(addUsernameOption)
    .addStringOption((option) =>
      option
        .setName('sort')
        .setDescription('What to sort by (default: name)')
        .addChoices(
          { name: 'By name', value: 'name' satisfies SortBy },
          { name: 'By count', value: 'count' satisfies SortBy },
        ),
    ),

  async execute(interaction) {
    const sortBy = (interaction.options.getString('sort') ?? 'name') as SortBy;
    const account = await getBlitzAccount(interaction);
    const { id, server } = account;
    const accounts = await getWargamingResponse<AccountInfo>(
      `https://api.wotblitz.${server}/wotb/account/info/?application_id=${wargamingApplicationId}&account_id=${id}`,
    );
    const accountsAchievements =
      await getWargamingResponse<AccountAchievements>(
        `https://api.wotblitz.${server}/wotb/account/achievements/?application_id=${wargamingApplicationId}&account_id=${id}`,
      );
    const accountAchievements = accountsAchievements[id];
    const compound = {
      ...accountAchievements.achievements,
      ...accountAchievements.max_series,
    };

    interaction.editReply({
      embeds: [
        infoEmbed(
          `${markdownEscape(accounts[id].nickname)}'s information`,

          cleanTable(
            Object.keys(compound)
              .filter((achievement) => compound[achievement] > 0)
              .sort(
                sortBy === 'count'
                  ? (a, b) => compound[b] - compound[a]
                  : undefined,
              )
              .map(
                (achievement) =>
                  [
                    startCase(achievement),
                    compound[achievement],
                  ] as TableInputEntry,
              ),
          ),
        ),
      ],
    });
  },

  autocomplete: usernameAutocomplete,
} satisfies CommandRegistry;

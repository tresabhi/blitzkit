import { SlashCommandBuilder } from 'discord.js';
import { startCase } from 'lodash';
import markdownEscape from 'markdown-escape';
import getWargamingResponse from '../core/blitz/getWargamingResponse';
import addUsernameChoices from '../core/discord/addUsernameChoices';
import autocompleteUsername from '../core/discord/autocompleteUsername';
import embedInfo from '../core/discord/embedInfo';
import markdownTable, { TableInputEntry } from '../core/discord/markdownTable';
import resolvePlayerFromCommand from '../core/discord/resolvePlayerFromCommand';
import { secrets } from '../core/node/secrets';
import { CommandRegistry } from '../events/interactionCreate';
import { AccountAchievements } from '../types/accountAchievements';
import { AccountInfo } from '../types/accountInfo';

type SortBy = 'name' | 'count';

export const playerAchievementsCommand: CommandRegistry = {
  inProduction: true,
  inDevelopment: true,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName('player-achievements')
    .setDescription("All the player's achievements")
    .addStringOption(addUsernameChoices)
    .addStringOption((option) =>
      option
        .setName('sort')
        .setDescription('What to sort by (default: name)')
        .addChoices(
          { name: 'By name', value: 'name' satisfies SortBy },
          { name: 'By count', value: 'count' satisfies SortBy },
        ),
    ),

  async handler(interaction) {
    const sortBy = (interaction.options.getString('sort') ?? 'name') as SortBy;
    const account = await resolvePlayerFromCommand(interaction);
    const { id, region: server } = account;
    const accounts = await getWargamingResponse<AccountInfo>(
      `https://api.wotblitz.${server}/wotb/account/info/?application_id=${secrets.WARGAMING_APPLICATION_ID}&account_id=${id}`,
    );
    const accountsAchievements =
      await getWargamingResponse<AccountAchievements>(
        `https://api.wotblitz.${server}/wotb/account/achievements/?application_id=${secrets.WARGAMING_APPLICATION_ID}&account_id=${id}`,
      );
    const accountAchievements = accountsAchievements[id];
    const compound = {
      ...accountAchievements.achievements,
      ...accountAchievements.max_series,
    };

    return embedInfo(
      `${markdownEscape(accounts[id].nickname)}'s information`,

      markdownTable(
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
    );
  },

  autocomplete: autocompleteUsername,
};

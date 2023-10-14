import { SlashCommandBuilder } from 'discord.js';
import { startCase } from 'lodash';
import markdownEscape from 'markdown-escape';
import markdownTable, {
  TableInputEntry,
} from '../LEGACY_core/discord/markdownTable';
import resolvePlayerFromCommand from '../LEGACY_core/discord/resolvePlayerFromCommand';
import { getAccountAchievements } from '../core/blitz/getAccountAchievements';
import { getAccountInfo } from '../core/blitz/getAccountInfo';
import addUsernameChoices from '../core/discord/addUsernameChoices';
import autocompleteUsername from '../core/discord/autocompleteUsername';
import embedInfo from '../core/discord/embedInfo';
import { CommandRegistry } from '../events/interactionCreate';

type SortBy = 'name' | 'count';

export const playerAchievementsCommand: CommandRegistry = {
  inProduction: true,
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
    const { id, region: region } = account;
    const accountInfo = await getAccountInfo(region, id);
    const accountsAchievements = await getAccountAchievements(region, id);
    const accountAchievements = accountsAchievements;
    const compound = {
      ...accountAchievements.achievements,
      ...accountAchievements.max_series,
    };

    return embedInfo(
      `${markdownEscape(accountInfo.nickname)}'s information`,

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

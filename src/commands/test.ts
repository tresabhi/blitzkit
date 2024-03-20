import { SlashCommandBuilder } from 'discord.js';
import markdownEscape from 'markdown-escape';
import { getAccountInfo } from '../core/blitz/getAccountInfo';
import { getRatingNeighbors } from '../core/blitz/getRatingNeighbors';
import { getArchivedRatingLeaderboard } from '../core/blitzkrieg/getArchivedRatingLeaderboard';
import addUsernameChoices from '../core/discord/addUsernameChoices';
import markdownTable from '../core/discord/markdownTable';
import resolvePlayerFromCommand from '../core/discord/resolvePlayerFromCommand';
import { deltaBkrlBlitzStats } from '../core/statistics/deltaBkrlBlitzStats';
import { BkrlFormat } from '../core/streams/bkrl';
import { CommandRegistry } from '../events/interactionCreate';

export const testCommand = new Promise<CommandRegistry>((resolve) => {
  resolve({
    command: new SlashCommandBuilder()
      .setName('test')
      .setDescription('test')
      .addStringOption(addUsernameChoices),

    inProduction: false,
    inPublic: true,

    async handler(interaction) {
      const { id, region } = await resolvePlayerFromCommand(interaction);
      const leaderboard = await getArchivedRatingLeaderboard(region, 53);

      if (leaderboard.format === BkrlFormat.Minimal) {
        return 'bkrl minimal format not supported';
      }

      const statsA = leaderboard.entries.find((entry) => entry.id === id);

      if (!statsA) {
        return `Didn't find player: ${id}, region: ${region}`;
      }
      const accountInfo = await getAccountInfo(region, id, [
        'statistics.rating',
      ]);
      const statsB1 = accountInfo.statistics.rating!;

      if (!statsB1) {
        return 'User did not participate in this season';
      }

      const delta = deltaBkrlBlitzStats(statsA, accountInfo.statistics.rating!);
      const [statsB2] = (await getRatingNeighbors(region, id, 0)).neighbors;
      const scoreDiff = statsB2.score - statsA.score;

      return `# ${markdownEscape(accountInfo.nickname)}\n\n${markdownTable([
        [
          'score',
          `${statsB2.score}${scoreDiff === 0 ? '' : ` (${scoreDiff > 0 ? '+' : ''}${scoreDiff})`}`,
        ],
        ['winrate', `${(100 * (delta.wins / delta.battles)).toFixed(0)}%`],
        ['battles', delta.battles],
        ['wins / losses', `${delta.wins} / ${delta.battles - delta.wins}`],
        ['wn8', 'impossible'],
        ['survival', `${(100 * (delta.survived / delta.battles)).toFixed(0)}%`],
        ['accuracy', `${(100 * (delta.hits / delta.shots)).toFixed(0)}%`],
        ['average damage', (delta.damageDealt / delta.battles).toFixed(0)],
        ['damager per tier', 'impossible'],
        ['damage ratio', (delta.damageDealt / delta.damageReceived).toFixed(2)],
        ['average kills', (delta.kills / delta.battles).toFixed(2)],
        ['average tier', 'impossible'],
        ['average spots', 'possible'],
        ['average xp', 'possible'],
        [
          'kills to death ratio',
          (delta.kills / (delta.wins - delta.survived)).toFixed(2),
        ],
      ])}`;
    },
  });
});

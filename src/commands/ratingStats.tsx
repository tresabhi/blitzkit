import markdownEscape from 'markdown-escape';
import AllStatsOverview from '../components/AllStatsOverview';
import CommandWrapper from '../components/CommandWrapper';
import NoData from '../components/NoData';
import TitleBar from '../components/TitleBar';
import { getAccountInfo } from '../core/blitz/getAccountInfo';
import { getRatingNeighbors } from '../core/blitz/getRatingNeighbors';
import { getArchivedRatingLeaderboard } from '../core/blitzkrieg/getArchivedRatingLeaderboard';
import addUsernameChoices from '../core/discord/addUsernameChoices';
import { createLocalizedCommand } from '../core/discord/createLocalizedCommand';
import resolvePlayerFromCommand from '../core/discord/resolvePlayerFromCommand';
import { translator } from '../core/localization/translator';
import { deltaBkrlBlitzStats } from '../core/statistics/deltaBkrlBlitzStats';
import { BkrlFormat } from '../core/streams/bkrl';
import { CommandRegistry } from '../events/interactionCreate';

export const ratingStatsCommand = new Promise<CommandRegistry>((resolve) => {
  resolve({
    command:
      createLocalizedCommand('rating-stats').addStringOption(
        addUsernameChoices,
      ),

    inProduction: true,
    inPublic: true,

    async handler(interaction) {
      const { t, translate } = translator(interaction.locale);
      const { id, region } = await resolvePlayerFromCommand(interaction);
      const leaderboard = await getArchivedRatingLeaderboard(region, 53);

      if (leaderboard.format === BkrlFormat.Minimal) {
        throw new Error(
          'Encountered bkrl minimal format in latest season. Wait till next cron?',
        );
      }

      const accountInfo = await getAccountInfo(region, id, [
        'statistics.rating',
      ]);
      const statsA = leaderboard.entries.find((entry) => entry.id === id);
      const statsB1 = accountInfo.statistics.rating!;
      const [statsB2] = (await getRatingNeighbors(region, id, 0)).neighbors;

      if (!statsA) {
        return t`bot.commands.rating_stats.errors.unrecorded_stats`;
      }
      if (!statsB1) {
        return translate('bot.commands.rating_stats.errors.no_participation', [
          markdownEscape(accountInfo.nickname),
        ]);
      }

      const delta = deltaBkrlBlitzStats(statsA, accountInfo.statistics.rating!);
      const scoreDiff = statsB2.score - statsA.score;

      return (
        <CommandWrapper>
          <TitleBar
            title={accountInfo.nickname}
            // image={clanImage} // TODO: add league icon here
            description={t`bot.commands.rating_stats.body.subtitle`}
          />

          {delta.battles === 0 && (
            <NoData type="battles_in_season" locale={interaction.locale} />
          )}
          {delta.battles > 0 && (
            <AllStatsOverview
              locale={interaction.locale}
              stats={{
                battles: delta.battles,
                damage_dealt: delta.damageDealt,
                damage_received: delta.damageReceived,
                frags: delta.kills,
                hits: delta.hits,
                shots: delta.shots,
                survived_battles: delta.survived,
                wins: delta.wins,
              }}
              supplementaryStats={{ WN8: 3000, tier: 10 }}
            />
          )}
        </CommandWrapper>
      );

      // return `# ${markdownEscape(accountInfo.nickname)}\n\n${markdownTable([
      //   [
      //     'score',
      //     `${statsB2.score}${scoreDiff === 0 ? '' : ` (${scoreDiff > 0 ? '+' : ''}${scoreDiff})`}`,
      //   ],
      //   ['winrate', `${(100 * (delta.wins / delta.battles)).toFixed(0)}%`],
      //   ['battles', delta.battles],
      //   ['wins / losses', `${delta.wins} / ${delta.battles - delta.wins}`],
      //   ['wn8', 'impossible'],
      //   ['survival', `${(100 * (delta.survived / delta.battles)).toFixed(0)}%`],
      //   ['accuracy', `${(100 * (delta.hits / delta.shots)).toFixed(0)}%`],
      //   ['average damage', (delta.damageDealt / delta.battles).toFixed(0)],
      //   ['damager per tier', 'impossible'],
      //   ['damage ratio', (delta.damageDealt / delta.damageReceived).toFixed(2)],
      //   ['average kills', (delta.kills / delta.battles).toFixed(2)],
      //   ['average tier', 'impossible'],
      //   ['average spots', 'possible'],
      //   ['average xp', 'possible'],
      //   [
      //     'kills to death ratio',
      //     (delta.kills / (delta.wins - delta.survived)).toFixed(2),
      //   ],
      // ])}`;
    },
  });
});

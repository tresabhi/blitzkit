import markdownEscape from 'markdown-escape';
import CommandWrapper from '../components/CommandWrapper';
import { DeltaCaret } from '../components/DeltaCaret';
import NoData from '../components/NoData';
import TitleBar from '../components/TitleBar';
import { getAccountInfo } from '../core/blitz/getAccountInfo';
import { getClanAccountInfo } from '../core/blitz/getClanAccountInfo';
import { getLeagueFromScore } from '../core/blitz/getLeagueFromScore';
import getRatingInfo from '../core/blitz/getRatingInfo';
import { getRatingNeighbors } from '../core/blitz/getRatingNeighbors';
import { normalizeLeagueIcon } from '../core/blitz/normalizeLeagueIcon';
import { emblemURL } from '../core/blitzkrieg/emblemURL';
import { getArchivedRatingLeaderboard } from '../core/blitzkrieg/getArchivedRatingLeaderboard';
import addUsernameChoices from '../core/discord/addUsernameChoices';
import { createLocalizedCommand } from '../core/discord/createLocalizedCommand';
import resolvePlayerFromCommand from '../core/discord/resolvePlayerFromCommand';
import { translator } from '../core/localization/translator';
import { deltaBkrlBlitzStats } from '../core/statistics/deltaBkrlBlitzStats';
import { BkrlFormat } from '../core/streams/bkrl';
import { CommandRegistry } from '../events/interactionCreate';
import { theme } from '../stitches.config';

export const ratingStatsCommand = new Promise<CommandRegistry>((resolve) => {
  resolve({
    command:
      createLocalizedCommand('rating-session').addStringOption(
        addUsernameChoices,
      ),

    inProduction: true,
    inPublic: true,

    async handler(interaction) {
      const { t, translate } = translator(interaction.locale);
      const { id, region } = await resolvePlayerFromCommand(interaction);
      const clan = (await getClanAccountInfo(region, id, ['clan']))?.clan;
      const clanImage = clan ? emblemURL(clan.emblem_set_id) : undefined;
      const leaderboard = await getArchivedRatingLeaderboard(region, 53);

      if (leaderboard.format === BkrlFormat.Minimal) {
        throw new Error(
          'Encountered bkrl minimal format in latest season. Wait till next cron?',
        );
      }

      const ratingInfo = await getRatingInfo(region);
      const accountInfo = await getAccountInfo(region, id, [
        'statistics.rating',
      ]);
      const statsA = leaderboard.entries.find((entry) => entry.id === id);
      const statsB1 = accountInfo.statistics.rating!;
      const [statsB2] = (await getRatingNeighbors(region, id, 0)).neighbors;
      const league = getLeagueFromScore(statsB2.score);

      if (ratingInfo.detail) {
        throw new Error(`Rating info not available for ${region}`);
      }
      if (!statsA) {
        return t`bot.commands.rating_session.errors.unrecorded_stats`;
      }
      if (!statsB1) {
        return translate(
          'bot.commands.rating_session.errors.no_participation',
          [markdownEscape(accountInfo.nickname)],
        );
      }

      const delta = deltaBkrlBlitzStats(
        statsA,
        accountInfo.statistics.rating!,
        statsB2,
      );

      return (
        <CommandWrapper>
          <TitleBar
            title={accountInfo.nickname}
            image={clanImage}
            description={t`bot.commands.rating_session.body.subtitle`}
          />

          {delta.battles === 0 && (
            <NoData type="battles_in_season" locale={interaction.locale} />
          )}
          {delta.battles > 0 && (
            <div
              style={{
                padding: 16,
                backgroundColor: theme.colors.appBackground2_purple,
                borderRadius: 4,
                border: `1px solid ${theme.colors.componentInteractive_purple}`,
                display: 'flex',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <img
                  style={{
                    width: 64,
                    height: 64,
                    objectFit: 'contain',
                  }}
                  src={normalizeLeagueIcon(
                    ratingInfo.leagues[league.index].big_icon,
                  )}
                />

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span
                      style={{
                        color: theme.colors.textHighContrast_purple,
                        fontSize: 24,
                        fontWeight: 900,
                      }}
                    >
                      {statsB2.score.toLocaleString(interaction.locale)}
                    </span>
                    {delta.score !== 0 && (
                      <>
                        <DeltaCaret delta={delta.score} />
                        <span
                          style={{
                            color:
                              delta.score > 0
                                ? theme.colors.textLowContrast_green
                                : theme.colors.textLowContrast_red,
                            fontSize: 16,
                          }}
                        >
                          {delta.score.toLocaleString(interaction.locale)}
                        </span>
                      </>
                    )}
                  </div>
                  <span
                    style={{
                      color: theme.colors.textLowContrast_purple,
                      fontSize: 16,
                    }}
                  >
                    #{statsB2.number.toLocaleString(interaction.locale)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CommandWrapper>
      );
    },
  });
});

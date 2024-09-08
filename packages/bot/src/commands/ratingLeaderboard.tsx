import {
  BkrlDiscriminatedEntries,
  FIRST_MINIMAL_ARCHIVED_RATING_SEASON,
  getArchivedLatestSeasonNumber,
  getArchivedRatingInfo,
  getArchivedRatingLeaderboard,
  getRatingInfo,
  LEAGUES,
  RatingInfo,
  Region,
} from '@blitzkit/core';
import { getArchivedRatingMidnightLeaderboard } from '@blitzkit/core/src/blitzkit/getArchivedRatingMidnightLeaderboard';
import {
  APIApplicationCommandOptionChoice,
  Locale,
  SlashCommandSubcommandBuilder,
} from 'discord.js';
import { range } from 'lodash';
import markdownEscape from 'markdown-escape';
import { getAccountInfo } from '../../../website/src/core/blitz/getAccountInfo';
import { getClanAccountInfo } from '../../../website/src/core/blitz/getClanAccountInfo';
import { getRatingLeague } from '../../../website/src/core/blitz/getRatingLeague';
import { getRatingNeighbors } from '../../../website/src/core/blitz/getRatingNeighbors';
import { isOnGoingRatingSeason } from '../../../website/src/core/blitz/isOnGoingRatingSeason';
import { UserError } from '../../../website/src/hooks/userError';
import { CommandWrapper } from '../components/CommandWrapper';
import * as Leaderboard from '../components/Leaderboard';
import { TitleBar } from '../components/TitleBar';
import { addRegionChoices } from '../core/discord/addRegionChoices';
import { addUsernameChoices } from '../core/discord/addUsernameChoices';
import { autocompleteUsername } from '../core/discord/autocompleteUsername';
import { createLocalizedCommand } from '../core/discord/createLocalizedCommand';
import { localizationObject } from '../core/discord/localizationObject';
import { resolvePlayerFromCommand } from '../core/discord/resolvePlayerFromCommand';
import { translator } from '../core/localization/translator';
import { CommandRegistry } from '../events/interactionCreate';

interface SimplifiedPlayer {
  id: number;
  score: number;
  position: number;
  clan: string | undefined;
  nickname: string;
}

const DEFAULT_LIMIT = 10;

export const ratingLeaderboardCommand = new Promise<CommandRegistry>(
  async (resolve) => {
    const latestArchivedSeasonNumber = await getArchivedLatestSeasonNumber();
    const onGoingSeason = await isOnGoingRatingSeason();
    const seasonNumbers = range(
      FIRST_MINIMAL_ARCHIVED_RATING_SEASON,
      latestArchivedSeasonNumber + (onGoingSeason ? 1 : 0) + 1,
    );

    function addOptions(option: SlashCommandSubcommandBuilder) {
      const { t, translate } = translator(Locale.EnglishUS);

      return option
        .addIntegerOption((option) =>
          option
            .setName(t`bot.commands.rating_leaderboard.options.limit`)
            .setNameLocalizations(
              localizationObject(
                'bot.commands.rating_leaderboard.options.limit',
              ),
            )
            .setDescription(
              translate(
                'bot.commands.rating_leaderboard.options.limit.description',
                [`${DEFAULT_LIMIT}`],
              ),
            )
            .setDescriptionLocalizations(
              localizationObject(
                'bot.commands.rating_leaderboard.options.limit.description',
                [`${DEFAULT_LIMIT}`],
              ),
            )
            .setRequired(false)
            .setMinValue(5)
            .setMaxValue(30),
        )
        .addStringOption((option) =>
          option
            .setName(t`bot.commands.rating_leaderboard.options.season`)
            .setNameLocalizations(
              localizationObject(
                'bot.commands.rating_leaderboard.options.season',
              ),
            )
            .setDescription(
              translate(
                'bot.commands.rating_leaderboard.options.season.description',
              ),
            )
            .setDescriptionLocalizations(
              localizationObject(
                'bot.commands.rating_leaderboard.options.season.description',
              ),
            )
            .setRequired(false)
            .addChoices(
              ...seasonNumbers
                .map((number, index) => {
                  const current =
                    index === seasonNumbers.length - 1 && onGoingSeason;

                  return {
                    name: current
                      ? translate(
                          'bot.commands.rating_leaderboard.options.season.choices.current',
                          [`${number}`],
                        )
                      : `${number}`,
                    value: `${number}`,
                    name_localizations: current
                      ? localizationObject(
                          'bot.commands.rating_leaderboard.options.season.choices.current',
                          [`${number}`],
                        )
                      : undefined,
                  } satisfies APIApplicationCommandOptionChoice<string>;
                })
                .reverse(),
            ),
        );
    }

    resolve({
      command: createLocalizedCommand('rating-leaderboard', [
        {
          subcommand: 'neighbors',
          modify(option: SlashCommandSubcommandBuilder) {
            option.addStringOption(addUsernameChoices);
            addOptions(option);
          },
        },
        {
          subcommand: 'league',
          modify(option: SlashCommandSubcommandBuilder) {
            option
              .addStringOption((option) => {
                const { t, translate } = translator(Locale.EnglishUS);

                return option
                  .setName(t`bot.commands.rating_leaderboard.options.league`)
                  .setNameLocalizations(
                    localizationObject(
                      'bot.commands.rating_leaderboard.options.league',
                    ),
                  )
                  .setDescription(
                    translate(
                      'bot.commands.rating_leaderboard.options.league.description',
                    ),
                  )
                  .setDescriptionLocalizations(
                    localizationObject(
                      'bot.commands.rating_leaderboard.options.league.description',
                    ),
                  )
                  .addChoices(
                    ...LEAGUES.map(
                      ({ name }, value) =>
                        ({
                          name: translate(`common.leagues.${name}`),
                          value: `${value}`,
                          name_localizations: localizationObject(
                            `common.leagues.${name}`,
                          ),
                        }) satisfies APIApplicationCommandOptionChoice<string>,
                    ),
                  )
                  .setRequired(true);
              })
              .addStringOption(addRegionChoices);
            addOptions(option);
          },
        },
      ]),

      // BIG TODO: title seems to be in english

      async handler(interaction) {
        const { t, translate } = translator(interaction.locale);
        const subcommand = interaction.options.getSubcommand(true) as
          | 'league'
          | 'neighbors';
        const limit = interaction.options.getInteger('limit') ?? DEFAULT_LIMIT;
        const seasonOption = interaction.options.getString('season');
        const season = seasonOption
          ? parseInt(seasonOption)
          : onGoingSeason
            ? latestArchivedSeasonNumber + 1
            : latestArchivedSeasonNumber;
        const isCurrentSeason = season === latestArchivedSeasonNumber + 1;
        let titleName: string;
        let titleImage: string | undefined;
        let titleDescription: string;
        let playersAfter: number;
        let players: SimplifiedPlayer[] | undefined;
        let midnightLeaderboard: BkrlDiscriminatedEntries | null;
        let playerId: number | undefined;
        let regionRatingInfo: RatingInfo;

        if (subcommand === 'league') {
          const leagueIndex = parseInt(
            interaction.options.getString('league')!,
          );
          const region = interaction.options.getString('region') as Region;
          regionRatingInfo = await (isCurrentSeason
            ? getRatingInfo(region)
            : getArchivedRatingInfo(region, season!));

          if (regionRatingInfo.detail !== undefined)
            return t`bot.commands.rating_leaderboard.body.no_ongoing_season`;

          const result = isCurrentSeason
            ? await getRatingLeague(region, leagueIndex).then(async (result) =>
                result.slice(0, limit).map(
                  (player) =>
                    ({
                      id: player.spa_id,
                      score: player.score,
                      position: player.number,
                      clan: player.clan_tag,
                      nickname: player.nickname,
                    }) satisfies SimplifiedPlayer,
                ),
              )
            : await getArchivedRatingLeaderboard(region, season!).then(
                async (players) => {
                  const firstPlayerIndex =
                    leagueIndex === 0
                      ? 0
                      : players.entries.findIndex(
                          (player) =>
                            player.score < LEAGUES[leagueIndex - 1].minScore,
                        );
                  const lastPlayerIndex = firstPlayerIndex + limit - 1;
                  const trimmed = players.entries.slice(
                    firstPlayerIndex,
                    lastPlayerIndex + 1,
                  );
                  const clanData = await getClanAccountInfo(
                    region,
                    trimmed.map(({ id }) => id),
                    ['clan'],
                  );

                  return trimmed.map(
                    (player, index) =>
                      ({
                        id: player.id,
                        score: player.score,
                        position: firstPlayerIndex + index + 1,
                        clan: clanData[player.id]?.clan?.tag,
                        nickname:
                          clanData[index]?.account_name ??
                          translate(
                            'bot.commands.rating_leaderboard.body.deleted_player',
                            [`${player.id}`],
                          ),
                      }) satisfies SimplifiedPlayer,
                  );
                },
              );
          const leagueInfo = regionRatingInfo.leagues[leagueIndex];
          midnightLeaderboard = isCurrentSeason
            ? await getArchivedRatingMidnightLeaderboard(
                region,
                regionRatingInfo.current_season,
              )
            : await getArchivedRatingMidnightLeaderboard(region, season!);

          players = result;
          playersAfter =
            regionRatingInfo.count - result[result.length - 1].position;
          titleName = `${
            leagueInfo
              ? translate(`common.leagues.${LEAGUES[leagueInfo.index].name}`)
              : ''
          } - ${translate(`common.regions.short.${region}`)}`;
          titleImage = leagueInfo.big_icon.startsWith('http')
            ? leagueInfo.big_icon
            : `https:${leagueInfo.big_icon}`;
          titleDescription = translate(
            'bot.commands.rating_leaderboard.body.top_players',
            [`${limit}`],
          );
        } else {
          const { region, id } = await resolvePlayerFromCommand(interaction);
          regionRatingInfo = isCurrentSeason
            ? await getRatingInfo(region)
            : await getArchivedRatingInfo(region, season!);

          if (regionRatingInfo.detail !== undefined)
            return t`bot.commands.rating_leaderboard.body.no_ongoing_season`;

          const accountInfo = await getAccountInfo(region, id);
          const clan = (await getClanAccountInfo(region, id, ['clan']))?.clan;
          const neighbors = isCurrentSeason
            ? await getRatingNeighbors(region, id, Math.round(limit / 2)).then(
                (players) =>
                  players.neighbors.map(
                    (player) =>
                      ({
                        id: player.spa_id,
                        position: player.number,
                        score: player.score,
                        clan: player.clan_tag,
                        nickname: player.nickname,
                      }) satisfies SimplifiedPlayer,
                  ),
              )
            : await getArchivedRatingLeaderboard(region, season!).then(
                async (players) => {
                  const playerIndex = players.entries.findIndex(
                    (player) => player.id === id,
                  );

                  if (playerIndex === -1) {
                    throw new UserError(
                      translate(
                        'bot.commands.rating_leaderboard.body.no_participation',
                        [markdownEscape(accountInfo.nickname), `${season}`],
                      ),
                    );
                  }

                  const halfRange = Math.round(limit / 2);
                  const trimmed = players.entries.slice(
                    playerIndex - halfRange,
                    playerIndex + halfRange + 1,
                  );
                  const clanData = await getClanAccountInfo(
                    region,
                    trimmed.map((player) => player.id),
                    ['clan'],
                  );

                  return trimmed.map((player, index) => ({
                    id: player.id,
                    score: player.score,
                    position: playerIndex + index + 1,
                    clan: clanData[index]?.clan?.tag,
                    nickname: clanData[index]
                      ? clanData[index]!.account_name
                      : `Deleted ${player.id}`,
                  }));
                },
              );
          midnightLeaderboard = isCurrentSeason
            ? await getArchivedRatingMidnightLeaderboard(
                region,
                regionRatingInfo.current_season,
              )
            : await getArchivedRatingMidnightLeaderboard(region, season!);

          players = neighbors;
          titleImage = clan
            ? `https://wotblitz-gc.gcdn.co/icons/clanEmblems1x/clan-icon-v2-${clan.emblem_set_id}.png`
            : undefined;
          titleName = neighbors ? accountInfo.nickname : '';
          titleDescription = t`bot.commands.rating_leaderboard.body.neighbors`;
          playersAfter =
            regionRatingInfo.count - neighbors[neighbors.length - 1].position;
          playerId = id;
        }

        const items = players.map((player) => {
          const midnightIndex = midnightLeaderboard?.entries.findIndex(
            (item) => item.id === player.id,
          );
          const midnightScore =
            midnightIndex === undefined
              ? player.score
              : midnightLeaderboard!.entries[midnightIndex].score;
          const midnightPosition =
            midnightIndex === undefined ? player.position : midnightIndex + 1;

          return (
            <Leaderboard.Item
              nickname={player.nickname}
              score={player.score}
              position={player.position}
              clan={player.clan}
              deltaScore={player.score - midnightScore}
              deltaPosition={midnightPosition - player.position}
              key={player.id}
              highlight={player.id === playerId}
            />
          );
        });

        return (
          <CommandWrapper>
            <TitleBar
              title={titleName}
              image={titleImage}
              description={titleDescription}
            />

            {items && (
              <Leaderboard.Root>
                {items}
                {playersAfter > 0 && (
                  <Leaderboard.Gap
                    message={translate(
                      'bot.commands.rating_leaderboard.body.more',
                      [`${playersAfter.toLocaleString(interaction.locale)}`],
                    )}
                  />
                )}
              </Leaderboard.Root>
            )}
          </CommandWrapper>
        );
      },

      autocomplete: autocompleteUsername,
    });
  },
);

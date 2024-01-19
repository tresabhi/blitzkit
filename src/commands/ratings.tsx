import {
  APIApplicationCommandOptionChoice,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
} from 'discord.js';
import { range } from 'lodash';
import { BlitzkriegRatingsLeaderboard } from '../../scripts/buildRatingsLeaderboard';
import * as Leaderboard from '../components/Leaderboard';
import TitleBar from '../components/TitleBar';
import Wrapper from '../components/Wrapper';
import { LEAGUES } from '../constants/leagues';
import { FIRST_ARCHIVED_RATINGS_SEASON } from '../constants/ratings';
import { REGION_NAMES_SHORT, Region } from '../constants/regions';
import { getAccountInfo } from '../core/blitz/getAccountInfo';
import { getClanAccountInfo } from '../core/blitz/getClanAccountInfo';
import getRatingsInfo from '../core/blitz/getRatingsInfo';
import { getRatingsLeague } from '../core/blitz/getRatingsLeague';
import { getRatingsNeighbors } from '../core/blitz/getRatingsNeighbors';
import { isOnGoingRatingsSeason } from '../core/blitz/isOnGoingRatingsSeason';
import { getArchivedLatestSeasonNumber } from '../core/blitzkrieg/getArchivedLatestSeasonNumber';
import getArchivedRatingsInfo from '../core/blitzkrieg/getArchivedRatingsInfo';
import { getArchivedRatingsLeaderboard } from '../core/blitzkrieg/getArchivedRatingsLeaderboard';
import getArchivedRatingsMidnightLeaderboard from '../core/blitzkrieg/getArchivedRatingsMidnightLeaderboard';
import { UserError } from '../core/blitzkrieg/userError';
import addRegionChoices from '../core/discord/addRegionChoices';
import autocompleteUsername from '../core/discord/autocompleteUsername';
import embedNegative from '../core/discord/embedNegative';
import resolvePlayerFromCommand from '../core/discord/resolvePlayerFromCommand';
import { CommandRegistryRaw } from '../events/interactionCreate';

export interface RatingsPlayer {
  spa_id: number;
  mmr: number;
  season_number: number;
  calibrationBattlesLeft: number;
  number: number;
  percentile: number;
  skip: boolean;
  updated_at: string;
  score: number;
  nickname: string;
  clan_tag: string;
}

export interface LeagueTop {
  result: RatingsPlayer[];
}

export type RatingsReward = {
  from_position: number;
  to_position: number;
  count: number;
} & (
  | {
      type: 'vehicle';

      vehicle: {
        id: number;
        name: string;
        nation: string;
        subnation: string;
        use_subnation_flag: boolean;
        type_slug: string;
        level: number;
        roman_level: string;
        user_string: string;
        image_url: string;
        preview_url: string;
        is_premium: boolean;
        is_collectible: boolean;
      };
    }
  | {
      type: 'stuff';

      stuff: {
        name: string;
        count: number;
        title: string;
        image_url: string;
        type: string;

        sizes: {};
      };
    }
);

export interface RatingsLeague {
  title: string;
  small_icon: string;
  big_icon: string;
  background: string;
  index: number;
  percentile: number;
}

export type RatingsInfo =
  | {
      detail: undefined;

      title: string;
      icon: string | null;
      start_at: string;
      finish_at: string;
      current_season: number;
      updated_at: string;
      count: number;

      rewards: RatingsReward[];
      leagues: RatingsLeague[];
    }
  | { detail: { error: string } };

export interface RatingsNeighbors {
  neighbors: RatingsPlayer[];
}

const noOngoingSeason = embedNegative(
  'No ongoing season',
  "Wargaming didn't provide any data for this season.",
);

export const ratingsCommand = new Promise<CommandRegistryRaw>(
  async (resolve) => {
    const latestArchivedSeasonNumber = await getArchivedLatestSeasonNumber();
    const onGoingSeason = await isOnGoingRatingsSeason();
    const seasonNumbers = range(
      FIRST_ARCHIVED_RATINGS_SEASON,
      latestArchivedSeasonNumber + (onGoingSeason ? 1 : 0) + 1,
    );

    function addSubcommands(option: SlashCommandSubcommandBuilder) {
      return option
        .addIntegerOption((option) =>
          option
            .setName('limit')
            .setDescription('How many neighbors to display (default: 10)')
            .setRequired(false)
            .setMinValue(5)
            .setMaxValue(30),
        )
        .addStringOption((option) =>
          option
            .setName('season')
            .setDescription('Season number')
            .setRequired(false)
            .addChoices(
              ...seasonNumbers
                .map(
                  (number, index) =>
                    ({
                      name: `${number}${index === seasonNumbers.length - 1 && onGoingSeason ? ' (current)' : ''}`,
                      value: `${number}`,
                    }) satisfies APIApplicationCommandOptionChoice<string>,
                )
                .reverse(),
            ),
        );
    }

    const command = new SlashCommandBuilder()
      .setName('ratings')
      .setDescription('Ratings battles statistics')
      .addSubcommand((option) =>
        addSubcommands(
          option
            .setName('neighbors')
            .setDescription('Shows neighboring players on the leaderboard'),
        ),
      )
      .addSubcommand((option) =>
        addSubcommands(
          option
            .setName('league')
            .setDescription('Shows top players from a league')
            .addStringOption(addRegionChoices)
            .addStringOption((option) =>
              option
                .setName('league')
                .setDescription('The league to display')
                .addChoices(
                  ...LEAGUES.map(
                    ({ name }, value) =>
                      ({
                        name,
                        value: `${value}`,
                      }) satisfies APIApplicationCommandOptionChoice<string>,
                  ),
                )
                .setRequired(true),
            ),
        ),
      );

    resolve({
      inProduction: true,
      inPublic: true,

      command,

      async handler(interaction) {
        interface SimplifiedPlayer {
          id: number;
          score: number;
          position: number;
          clan: string | undefined;
          nickname: string;
        }

        const subcommand = interaction.options.getSubcommand(true) as
          | 'league'
          | 'neighbors';
        const limit = interaction.options.getInteger('limit') ?? 10;
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
        let playersBefore: number;
        let playersAfter: number;
        let players: SimplifiedPlayer[] | undefined;
        let midnightLeaderboard: BlitzkriegRatingsLeaderboard | undefined;
        let playerId: number | undefined;
        let regionRatingsInfo: RatingsInfo;

        if (subcommand === 'league') {
          const leagueIndex = parseInt(
            interaction.options.getString('league')!,
          );
          const region = interaction.options.getString('region') as Region;
          regionRatingsInfo = await (isCurrentSeason
            ? getRatingsInfo(region)
            : getArchivedRatingsInfo(region, season!));

          if (regionRatingsInfo.detail !== undefined) return noOngoingSeason;

          const result = isCurrentSeason
            ? await getRatingsLeague(region, leagueIndex).then(async (result) =>
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
            : await getArchivedRatingsLeaderboard(region, season!).then(
                async (players) => {
                  const firstPlayerIndex =
                    leagueIndex === 0
                      ? 0
                      : players.findIndex(
                          (player) =>
                            player.score < LEAGUES[leagueIndex - 1].minScore,
                        );
                  const lastPlayerIndex = firstPlayerIndex + limit - 1;
                  const trimmed = players.slice(
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
                          `Deleted ${player.id}`,
                      }) satisfies SimplifiedPlayer,
                  );
                },
              );
          const leagueInfo = regionRatingsInfo.leagues[leagueIndex];
          midnightLeaderboard = isCurrentSeason
            ? await getArchivedRatingsMidnightLeaderboard(
                region,
                regionRatingsInfo.current_season,
              )
            : await getArchivedRatingsMidnightLeaderboard(region, season!);

          players = result;
          playersBefore = result ? result[0].position - 1 : 0;
          playersAfter =
            regionRatingsInfo.count - result[result.length - 1].position;
          titleName = `${
            leagueInfo ? leagueInfo.title : 'No Ongoing Season'
          } - ${REGION_NAMES_SHORT[region]}`;
          titleImage = leagueInfo.big_icon.startsWith('http')
            ? leagueInfo.big_icon
            : `https:${leagueInfo.big_icon}`;
          titleDescription = `Top ${limit} players`;
        } else {
          const { region, id } = await resolvePlayerFromCommand(interaction);
          regionRatingsInfo = isCurrentSeason
            ? await getRatingsInfo(region)
            : await getArchivedRatingsInfo(region, season!);

          if (regionRatingsInfo.detail !== undefined) return noOngoingSeason;

          const accountInfo = await getAccountInfo(region, id);
          const clan = (await getClanAccountInfo(region, id, ['clan']))?.clan;
          const neighbors = isCurrentSeason
            ? await getRatingsNeighbors(region, id, Math.round(limit / 2)).then(
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
            : await getArchivedRatingsLeaderboard(region, season!).then(
                async (players) => {
                  const playerIndex = players.findIndex(
                    (player) => player.id === id,
                  );

                  if (playerIndex === -1) {
                    throw new UserError(
                      `${accountInfo.nickname} didn't play ratings in season ${season}`,
                      'This player did not participate in this season or did not get past calibration.',
                    );
                  }

                  const halfRange = Math.round(limit / 2);
                  const trimmed = players.slice(
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
            ? await getArchivedRatingsMidnightLeaderboard(
                region,
                regionRatingsInfo.current_season,
              )
            : await getArchivedRatingsMidnightLeaderboard(region, season!);

          players = neighbors;
          titleImage = clan
            ? `https://wotblitz-gc.gcdn.co/icons/clanEmblems1x/clan-icon-v2-${clan.emblem_set_id}.png`
            : undefined;
          titleName = neighbors
            ? accountInfo.nickname
            : `No Ongoing Season - ${REGION_NAMES_SHORT[region]}`;
          titleDescription = 'Ratings neighbors';
          playersBefore = neighbors ? neighbors[0].position - 1 : 0;
          playersAfter =
            regionRatingsInfo.count - neighbors[neighbors.length - 1].position;
          playerId = id;
        }

        const resolvedRegionRatingsInfo: typeof regionRatingsInfo & {
          detail: undefined;
        } = regionRatingsInfo;

        const items = players.map((player) => {
          const reward = resolvedRegionRatingsInfo.rewards.find(
            (reward) =>
              player.position >= reward.from_position &&
              player.position <= reward.to_position,
          );
          const midnightIndex = midnightLeaderboard?.findIndex(
            (item) => item.id === player.id,
          );
          const midnightScore =
            midnightIndex === undefined
              ? player.score
              : midnightLeaderboard![midnightIndex].score;
          const midnightPosition =
            midnightIndex === undefined ? player.position : midnightIndex + 1;

          return (
            <Leaderboard.Item
              nickname={player.nickname}
              score={player.score}
              position={player.position}
              clan={player.clan}
              reward={reward}
              deltaScore={player.score - midnightScore}
              deltaPosition={midnightPosition - player.position}
              key={player.id}
              highlight={player.id === playerId}
            />
          );
        });

        return (
          <Wrapper>
            <TitleBar
              name={titleName}
              image={titleImage}
              description={titleDescription}
            />

            {items && (
              <Leaderboard.Root>
                {playersBefore > 0 && (
                  <Leaderboard.Gap
                    message={`+ ${playersBefore.toLocaleString()} more`}
                  />
                )}
                {items}
                {playersAfter > 0 && (
                  <Leaderboard.Gap
                    message={`+ ${playersAfter.toLocaleString()} more`}
                  />
                )}
              </Leaderboard.Root>
            )}
          </Wrapper>
        );
      },

      autocomplete: autocompleteUsername,
    });
  },
);

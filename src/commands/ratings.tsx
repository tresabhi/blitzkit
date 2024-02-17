import {
  APIApplicationCommandOptionChoice,
  SlashCommandBuilder,
  SlashCommandSubcommandBuilder,
  SlashCommandSubcommandGroupBuilder,
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
import { getArchivedLatestSeasonNumber } from '../core/blitzkrieg/getArchivedLatestSeasonNumber';
import getArchivedRatingsInfo from '../core/blitzkrieg/getArchivedRatingsInfo';
import { getArchivedRatingsLeaderboard } from '../core/blitzkrieg/getArchivedRatingsLeaderboard';
import getArchivedRatingsMidnightLeaderboard from '../core/blitzkrieg/getArchivedRatingsMidnightLeaderboard';
import addRegionChoices from '../core/discord/addRegionChoices';
import addUsernameChoices from '../core/discord/addUsernameChoices';
import autocompleteUsername from '../core/discord/autocompleteUsername';
import embedNegative from '../core/discord/embedNegative';
import resolvePlayerFromCommand from '../core/discord/resolvePlayerFromCommand';
import { CommandRegistryRaw } from '../events/interactionCreate';
import { UserError } from '../hooks/userError';

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

function addSubcommands(
  option: SlashCommandSubcommandGroupBuilder,
  addOptions = (option: SlashCommandSubcommandBuilder) => option,
) {
  return option
    .addSubcommand((option) =>
      addOptions(
        option
          .setName('neighbors')
          .setDescription('Your position and neighbors'),
      )
        .addStringOption(addUsernameChoices)
        .addIntegerOption((option) =>
          option
            .setName('limit')
            .setDescription('How many neighbors to display (default: 10)')
            .setRequired(false)
            .setMinValue(5)
            .setMaxValue(30),
        ),
    )
    .addSubcommand((option) =>
      addOptions(option.setName('league').setDescription('Top league players'))
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
        )
        .addStringOption(addRegionChoices)
        .addIntegerOption((option) =>
          option
            .setName('limit')
            .setDescription('How many rows to display (default: 10)')
            .setRequired(false)
            .setMinValue(5)
            .setMaxValue(30),
        ),
    );
}

const noOngoingSeason = embedNegative(
  'No ongoing season',
  "Wargaming didn't provide any data for this season.",
);

export const ratingsCommand = new Promise<CommandRegistryRaw>(
  async (resolve) => {
    const latestArchivedSeasonNumber = await getArchivedLatestSeasonNumber();
    const seasonChoices = range(
      FIRST_ARCHIVED_RATINGS_SEASON,
      latestArchivedSeasonNumber + 1,
    ).map(
      (number) =>
        ({
          name: `Season ${number}`,
          value: `${number}`,
        }) satisfies APIApplicationCommandOptionChoice<string>,
    );

    const command = new SlashCommandBuilder()
      .setName('ratings')
      .setDescription('Ratings battles statistics')
      .addSubcommandGroup((option) =>
        addSubcommands(
          option.setName('archive').setDescription('Any previous season'),
          (option) =>
            option.addStringOption((option) =>
              option
                .setName('season')
                .setDescription('The season number')
                .setChoices(...seasonChoices)
                .setRequired(true),
            ),
        ),
      )
      .addSubcommandGroup((option) =>
        addSubcommands(
          option
            .setName('current')
            .setDescription('The current running Ratings season'),
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

        const subcommandGroup = interaction.options.getSubcommandGroup(true) as
          | 'archive'
          | 'current';
        const subcommand = interaction.options.getSubcommand(true) as
          | 'league'
          | 'neighbors';
        const limit = interaction.options.getInteger('limit') ?? 10;
        const seasonOption = interaction.options.getString('season');
        const season = seasonOption ? parseInt(seasonOption) : undefined;
        let titleName: string;
        let titleImage: string | undefined;
        let titleNameDiscriminator: string | undefined;
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
          regionRatingsInfo = await (subcommandGroup === 'current'
            ? getRatingsInfo(region)
            : getArchivedRatingsInfo(region, season!));

          if (regionRatingsInfo.detail !== undefined) return noOngoingSeason;

          const result =
            subcommandGroup === 'current'
              ? await getRatingsLeague(region, leagueIndex).then(
                  async (result) =>
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
                            clanData[player.id]?.account_name ??
                            `Unknown Player ${player.id}`,
                        }) satisfies SimplifiedPlayer,
                    );
                  },
                );
          const leagueInfo = regionRatingsInfo.leagues[leagueIndex];
          midnightLeaderboard =
            subcommandGroup === 'current'
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
          regionRatingsInfo =
            subcommandGroup === 'current'
              ? await getRatingsInfo(region)
              : await getArchivedRatingsInfo(region, season!);

          if (regionRatingsInfo.detail !== undefined) return noOngoingSeason;

          const accountInfo = await getAccountInfo(region, id);
          const clan = (await getClanAccountInfo(region, id, ['clan']))?.clan;
          const neighbors =
            subcommandGroup === 'current'
              ? await getRatingsNeighbors(
                  region,
                  id,
                  Math.round(limit / 2),
                ).then((players) =>
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
                        `${accountInfo.nickname} didn't player ratings in season ${season}`,
                        {
                          cause:
                            'This player did not participate in this season or did not get past calibration.',
                        },
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
                      clan: clanData[player.id]!.clan?.tag,
                      nickname: clanData[player.id]!.account_name,
                    }));
                  },
                );
          midnightLeaderboard =
            subcommandGroup === 'current'
              ? await getArchivedRatingsMidnightLeaderboard(
                  region,
                  regionRatingsInfo.current_season,
                )
              : await getArchivedRatingsMidnightLeaderboard(region, season!);

          if (clan && neighbors) titleNameDiscriminator = `[${clan.tag}]`;

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

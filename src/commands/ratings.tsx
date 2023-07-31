import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import { BlitzkriegRatingsLeaderboard } from '../../scripts/buildRatingsLeaderboard';
import { octokit } from '../bot';
import * as Leaderboard from '../components/Leaderboard';
import TitleBar from '../components/TitleBar';
import Wrapper from '../components/Wrapper';
import { REGION_NAMES, Region } from '../constants/regions';
import regionToRegionSubdomain from '../core/blitz/regionToRegionSubdomain';
import addRegionChoices from '../core/discord/addRegionChoices';
import { CommandRegistry } from '../events/interactionCreate';

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

export interface RatingsInfo {
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

export interface RatingsNeighbors {
  neighbors: RatingsPlayer[];
}

console.log('Caching ratings info...');
const ratingsInfo = fetch(
  'https://na.wotblitz.com/en/api/rating-leaderboards/season/',
)
  .then((response) => response.json() as Promise<RatingsInfo>)
  .then((info) => {
    console.log('Cached ratings info');
    return info;
  });

function optionalParameters(option: SlashCommandSubcommandBuilder) {
  return option
    .addStringOption(addRegionChoices)
    .addIntegerOption((option) =>
      option
        .setName('limit')
        .setDescription('How many rows to display (default: 10)')
        .setRequired(false)
        .setMinValue(5)
        .setMaxValue(30),
    );
}

const LEAGUE_INDEXES = ['diamond', 'platinum', 'gold', 'silver', 'bronze'];

export const DATABASE_REPO = { owner: 'tresabhi', repo: 'blitzkrieg-db' };

export const ratingsCommand: CommandRegistry = {
  inProduction: true,
  inDevelopment: true,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName('ratings')
    .setDescription('Ratings battles statistics')
    .addSubcommandGroup((option) =>
      option
        .setName('league')
        .setDescription('Top league players')
        .addSubcommand((option) =>
          optionalParameters(
            option
              .setName('diamond')
              .setDescription('Top Diamond League players'),
          ),
        )
        .addSubcommand((option) =>
          optionalParameters(
            option
              .setName('platinum')
              .setDescription('Top Platinum League players'),
          ),
        )
        .addSubcommand((option) =>
          optionalParameters(
            option.setName('gold').setDescription('Top Gold League players'),
          ),
        )
        .addSubcommand((option) =>
          optionalParameters(
            option
              .setName('silver')
              .setDescription('Top Silver League players'),
          ),
        )
        .addSubcommand((option) =>
          optionalParameters(
            option
              .setName('bronze')
              .setDescription('Top Bronze League players'),
          ),
        ),
    ),

  async handler(interaction) {
    const subcommandGroup = interaction.options.getSubcommandGroup(true);

    if (subcommandGroup === 'league') {
      const limit = interaction.options.getInteger('limit') ?? 10;
      const subcommand = interaction.options.getSubcommand(true);
      const leagueIndex = LEAGUE_INDEXES.indexOf(subcommand);
      const region = interaction.options.getString('region') as Region;
      const regionSubdomain = regionToRegionSubdomain(region);
      const result = await fetch(
        `https://${regionSubdomain}.wotblitz.com/en/api/rating-leaderboards/league/${leagueIndex}/top/`,
      )
        .then((response) => response.json() as Promise<LeagueTop>)
        .then(({ result }) => result.slice(0, limit));
      const awaitedInfo = await ratingsInfo;
      const leagueInfo = awaitedInfo.leagues[leagueIndex];
      const midnightLeaderboard = await octokit.repos
        .getContent({
          ...DATABASE_REPO,
          path: `${region}/ratings/${awaitedInfo.current_season}/midnight.json`,
        })
        .then(({ data }) => {
          if (!Array.isArray(data) && data.type === 'file') {
            const content = Buffer.from(data.content, 'base64').toString();
            const jsonContent = JSON.parse(
              content,
            ) as BlitzkriegRatingsLeaderboard;

            return jsonContent;
          }
        })
        .catch(() => console.warn('No midnight leaderboard found'));
      const items = await Promise.all(
        result.map(async (player) => {
          const reward = awaitedInfo.rewards.find(
            (reward) =>
              player.number >= reward.from_position &&
              player.number <= reward.to_position,
          );
          const midnightIndex = midnightLeaderboard?.findIndex(
            (item) => item.id === player.spa_id,
          );
          const midnightScore =
            midnightIndex === undefined
              ? player.score
              : midnightLeaderboard![midnightIndex].score;
          const midnightPosition =
            midnightIndex === undefined ? player.number : midnightIndex + 1;

          return (
            <Leaderboard.Item
              nickname={player.nickname}
              score={player.score}
              position={player.number}
              clan={player.clan_tag}
              reward={reward}
              deltaScore={player.score - midnightScore}
              deltaPosition={midnightPosition - player.number}
              key={player.spa_id}
            />
          );
        }),
      );

      const playersBefore = result[0].number - 1;
      const playersAfter = awaitedInfo.count - result[result.length - 1].number;

      return (
        <Wrapper>
          <TitleBar
            name={leagueInfo.title}
            image={
              leagueInfo.big_icon.startsWith('http')
                ? leagueInfo.big_icon
                : `https:${leagueInfo.big_icon}`
            }
            description={`Top ${limit} players • ${new Date().toDateString()} • ${
              REGION_NAMES[region]
            }`}
          />

          <Leaderboard.Root>
            {playersBefore > 0 && <Leaderboard.Gap number={playersBefore} />}
            {items}
            {playersAfter > 0 && <Leaderboard.Gap number={playersAfter} />}
          </Leaderboard.Root>
        </Wrapper>
      );
    }

    return [];
  },
};

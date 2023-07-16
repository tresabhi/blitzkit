import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import * as Leaderboard from '../components/Leaderboard';
import TitleBar from '../components/TitleBar';
import Wrapper from '../components/Wrapper';
import { REGION_NAMES } from '../constants/regions';
import getWargamingResponse from '../core/blitz/getWargamingResponse';
import regionToRegionSubdomain from '../core/blitz/regionToRegionSubdomain';
import addUsernameChoices from '../core/discord/addUsernameChoices';
import autocompleteUsername from '../core/discord/autocompleteUsername';
import resolvePlayerFromCommand from '../core/discord/resolvePlayerFromCommand';
import { WARGAMING_APPLICATION_ID } from '../core/node/arguments';
import { CommandRegistry } from '../events/interactionCreate';
import { AccountInfo } from '../types/accountInfo';

export interface LeaguePlayer {
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
  result: LeaguePlayer[];
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

console.log('Caching ratings info...');
const ratingsLeagueInfo = fetch(
  'https://na.wotblitz.com/en/api/rating-leaderboards/season/',
)
  .then((response) => response.json() as Promise<RatingsInfo>)
  .then((info) => {
    console.log('Cached ratings info');
    return info;
  });

function optionalParameters(option: SlashCommandSubcommandBuilder) {
  return option
    .addIntegerOption((option) =>
      option
        .setName('limit')
        .setDescription('How many rows to display (default: 16)')
        .setRequired(false)
        .setMinValue(5)
        .setMaxValue(30),
    )
    .addStringOption(addUsernameChoices);
}

const LEAGUE_INDEXES = ['diamond', 'platinum', 'gold', 'silver', 'bronze'];

export const ratingsCommand: CommandRegistry = {
  inProduction: true,
  inDevelopment: true,
  inPublic: true,
  inPreview: true,

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
      const limit = interaction.options.getInteger('limit') ?? 16;
      const subcommand = interaction.options.getSubcommand(true);
      const leagueIndex = LEAGUE_INDEXES.indexOf(subcommand);
      const player = await resolvePlayerFromCommand(interaction);
      const regionSubdomain = regionToRegionSubdomain(player.region);
      const { result } = await fetch(
        `https://${regionSubdomain}.wotblitz.com/en/api/rating-leaderboards/league/${leagueIndex}/top/`,
      ).then((response) => response.json() as Promise<LeagueTop>);
      const { nickname } = await getWargamingResponse<AccountInfo>(
        `https://api.wotblitz.${player.region}/wotb/account/info/?application_id=${WARGAMING_APPLICATION_ID}&account_id=${player.id}`,
      ).then((accounts) => accounts[player.id]);
      const leagueInfo = (await ratingsLeagueInfo).leagues[leagueIndex];
      const items = result
        .slice(0, limit)
        .map((player) => (
          <Leaderboard.Item
            nickname={player.nickname}
            points={player.score}
            position={player.number}
            clan={player.clan_tag}
            reward=""
            deltaPoints={Math.round(Math.random() * 10 - 5)}
            deltaPosition={Math.round(Math.random() * 10 - 5)}
            key={player.spa_id}
          />
        ));

      return (
        <Wrapper>
          <TitleBar
            name={leagueInfo.title}
            image={`https:${leagueInfo.small_icon}`}
            description={`Top ${limit} players • ${new Date().toDateString()} • ${
              REGION_NAMES[player.region]
            }`}
          />

          <Leaderboard.Root>{items}</Leaderboard.Root>
        </Wrapper>
      );
    }

    return [];
  },

  autocomplete: autocompleteUsername,
};

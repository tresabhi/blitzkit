import {
  APIApplicationCommandOptionChoice,
  SlashCommandBuilder,
} from 'discord.js';
import { BlitzkriegRatingsLeaderboard } from '../../scripts/buildRatingsLeaderboard';
import * as Leaderboard from '../components/Leaderboard';
import TitleBar from '../components/TitleBar';
import Wrapper from '../components/Wrapper';
import { REGION_NAMES_SHORT, Region } from '../constants/regions';
import getRatingsInfo from '../core/blitz/getRatingsInfo';
import getWargamingResponse from '../core/blitz/getWargamingResponse';
import regionToRegionSubdomain from '../core/blitz/regionToRegionSubdomain';
import getMidnightLeaderboard from '../core/database/getMidnightLeaderboard';
import addRegionChoices from '../core/discord/addRegionChoices';
import addUsernameChoices from '../core/discord/addUsernameChoices';
import autocompleteUsername from '../core/discord/autocompleteUsername';
import resolvePlayerFromCommand from '../core/discord/resolvePlayerFromCommand';
import { secrets } from '../core/node/secrets';
import { CommandRegistryRaw } from '../events/interactionCreate';
import { AccountInfo } from '../types/accountInfo';
import { PlayerClanData } from '../types/playerClanData';

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
const ratingsInfo = getRatingsInfo('com').then((info) => {
  console.log('Cached ratings info');
  return info;
});

export const ratingsCommand = new Promise<CommandRegistryRaw>(
  async (resolve) => {
    const awaitedRatingsInfo = await ratingsInfo;

    const command = new SlashCommandBuilder()
      .setName('ratings')
      .setDescription('Ratings battles statistics')
      .addSubcommand((option) =>
        option
          .setName('league')
          .setDescription('Top league players')
          .addStringOption((option) =>
            option
              .setName('league')
              .setDescription('The league to display')
              .addChoices(
                ...awaitedRatingsInfo.leagues.map(
                  (league) =>
                    ({
                      name: league.title.split(' ')[0].toLowerCase(),
                      value: `${league.index}`,
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
      )
      .addSubcommand((option) =>
        option
          .setName('neighbours')
          .setDescription('Your position and neighbours')
          .addStringOption(addUsernameChoices)
          .addIntegerOption((option) =>
            option
              .setName('limit')
              .setDescription('How many neighbours to display (default: 10)')
              .setRequired(false)
              .setMinValue(5)
              .setMaxValue(30),
          ),
      );

    resolve({
      inProduction: true,
      inPublic: true,

      command,

      async handler(interaction) {
        const subcommand = interaction.options.getSubcommand(true);
        const limit = interaction.options.getInteger('limit') ?? 10;
        let titleName: string;
        let titleImage: string | undefined;
        let titleNameDiscriminator: string | undefined;
        let titleDescription: string;
        let playersBefore: number;
        let playersAfter: number;
        let players: RatingsPlayer[];
        let midnightLeaderboard: BlitzkriegRatingsLeaderboard | undefined;
        let playerId: number | undefined;
        let regionRatingsInfo: RatingsInfo;

        if (subcommand === 'league') {
          const leagueIndex = parseInt(
            interaction.options.getString('league')!,
          );
          const region = interaction.options.getString('region') as Region;
          regionRatingsInfo = await getRatingsInfo(region);
          const regionSubdomain = regionToRegionSubdomain(region);
          const result = await fetch(
            `https://${regionSubdomain}.wotblitz.com/en/api/rating-leaderboards/league/${leagueIndex}/top/`,
          )
            .then((response) => response.json() as Promise<LeagueTop>)
            .then(({ result }) => result.slice(0, limit));
          const leagueInfo = regionRatingsInfo.leagues[leagueIndex];
          midnightLeaderboard = await getMidnightLeaderboard(
            region,
            regionRatingsInfo.current_season,
          );

          players = result;
          playersBefore = result[0].number - 1;
          playersAfter =
            regionRatingsInfo.count - result[result.length - 1].number;
          titleName = `${leagueInfo.title} - ${REGION_NAMES_SHORT[region]}`;
          titleImage = leagueInfo.big_icon.startsWith('http')
            ? leagueInfo.big_icon
            : `https:${leagueInfo.big_icon}`;
          titleDescription = `Top ${limit} players`;
        } else {
          const { region, id } = await resolvePlayerFromCommand(interaction);
          regionRatingsInfo = await getRatingsInfo(region);
          const accountInfo = await getWargamingResponse<AccountInfo>(
            `https://api.wotblitz.${region}/wotb/account/info/?application_id=${secrets.WARGAMING_APPLICATION_ID}&account_id=${id}`,
          );
          const clan = (
            await getWargamingResponse<PlayerClanData>(
              `https://api.wotblitz.${region}/wotb/clans/accountinfo/?application_id=${secrets.WARGAMING_APPLICATION_ID}&account_id=${id}&extra=clan`,
            )
          )[id]?.clan;
          const regionSubdomain = regionToRegionSubdomain(region);
          const { neighbors } = await fetch(
            `https://${regionSubdomain}.wotblitz.com/en/api/rating-leaderboards/user/${id}/?neighbors=${Math.round(
              limit / 2,
            )}`,
          ).then((response) => response.json() as Promise<RatingsNeighbors>);
          midnightLeaderboard = await getMidnightLeaderboard(
            region,
            regionRatingsInfo.current_season,
          );

          if (clan) titleNameDiscriminator = `[${clan.tag}]`;

          players = neighbors;
          titleImage = clan
            ? `https://wotblitz-gc.gcdn.co/icons/clanEmblems1x/clan-icon-v2-${clan.emblem_set_id}.png`
            : undefined;
          titleName = accountInfo[id].nickname;
          titleDescription = 'Ratings neighbours';
          playersBefore = neighbors[0].number - 1;
          playersAfter =
            regionRatingsInfo.count - neighbors[neighbors.length - 1].number;
          playerId = id;
        }

        const items = players.map((player) => {
          const reward = regionRatingsInfo.rewards.find(
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
              highlight={player.spa_id === playerId}
            />
          );
        });

        return (
          <Wrapper>
            <TitleBar
              name={titleName}
              image={titleImage}
              nameDiscriminator={titleNameDiscriminator}
              description={`${titleDescription} • ${new Date().toDateString()}`}
            />

            <Leaderboard.Root>
              {playersBefore > 0 && <Leaderboard.Gap number={playersBefore} />}
              {items}
              {playersAfter > 0 && <Leaderboard.Gap number={playersAfter} />}
            </Leaderboard.Root>
          </Wrapper>
        );
      },

      autocomplete: autocompleteUsername,
    });
  },
);

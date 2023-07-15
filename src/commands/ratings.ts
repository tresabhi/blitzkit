import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from 'discord.js';
import regionToRegionSubdomain from '../core/blitz/regionToRegionSubdomain';
import addUsernameChoices from '../core/discord/addUsernameChoices';
import autocompleteUsername from '../core/discord/autocompleteUsername';
import resolvePlayerFromCommand from '../core/discord/resolvePlayerFromCommand';
import { CommandRegistry } from '../events/interactionCreate';

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

const LEAGUE_INDEXES = ['diamond', 'platinum', 'gold', 'silver', 'bronze'];

function optionalParameters(option: SlashCommandSubcommandBuilder) {
  return option
    .addIntegerOption((option) =>
      option
        .setName('limit')
        .setDescription('How many rows to display (default: 16)')
        .setRequired(true)
        .setMinValue(5)
        .setMaxValue(30),
    )
    .addStringOption(addUsernameChoices);
}

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

      return `\`\`\`${result
        .slice(0, limit)
        .map(
          (player) =>
            `${player.number}: ${player.nickname} [${player.clan_tag}]`,
        )
        .join('\n')}\`\`\``;
    }

    return [];
  },

  autocomplete: autocompleteUsername,
};

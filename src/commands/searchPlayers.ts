import { SlashCommandBuilder } from 'discord.js';
import markdownEscape from 'markdown-escape';
import { AccountList, usernamePattern } from '../LEGACY_core/blitz/listPlayers';
import addRegionChoices from '../LEGACY_core/discord/addRegionChoices';
import addUsernameChoices from '../LEGACY_core/discord/addUsernameChoices';
import embedInfo from '../LEGACY_core/discord/embedInfo';
import { REGION_NAMES, Region } from '../constants/regions';
import { WARGAMING_APPLICATION_ID } from '../constants/wargamingApplicationID';
import fetchBlitz from '../core/blitz/fetchWargaming';
import { CommandRegistry } from '../events/interactionCreate';

export const searchPlayersCommand: CommandRegistry = {
  inProduction: true,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName('search-players')
    .setDescription('Search players in a Blitz server')
    .addStringOption(addRegionChoices)
    .addStringOption((option) =>
      addUsernameChoices(option).setAutocomplete(false).setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName('limit')
        .setDescription('The size of the search result (default: 25)')
        .setMinValue(1)
        .setMaxValue(100),
    ),

  async handler(interaction) {
    const server = interaction.options.getString('region') as Region;
    const name = interaction.options.getString('username')!;
    const limit = interaction.options.getInteger('limit') ?? 25;
    const trimmedSearch = name.trim();
    const players = usernamePattern.test(trimmedSearch)
      ? await fetchBlitz<AccountList>(
          `https://api.wotblitz.${server}/wotb/account/list/?application_id=${WARGAMING_APPLICATION_ID}&search=${encodeURIComponent(
            trimmedSearch,
          )}&limit=${limit}`,
        )
      : [];

    return embedInfo(
      `Player search for "${markdownEscape(name)}" in ${REGION_NAMES[server]}`,
      `\`\`\`${
        players.length === 0
          ? 'No players found.'
          : players.map((player) => player.nickname).join('\n')
      }\`\`\``,
    );
  },
};

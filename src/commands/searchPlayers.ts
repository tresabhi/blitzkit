import { SlashCommandBuilder } from 'discord.js';
import markdownEscape from 'markdown-escape';
import { BLITZ_SERVERS, BlitzServer } from '../constants/servers';
import getWargamingResponse from '../core/blitz/getWargamingResponse';
import { usernamePattern } from '../core/blitz/listPlayers';
import addServerChoices from '../core/discord/addServerChoices';
import addUsernameChoices from '../core/discord/addUsernameChoices';
import embedInfo from '../core/discord/embedInfo';
import { WARGAMING_APPLICATION_ID } from '../core/node/arguments';
import { CommandRegistry } from '../events/interactionCreate';
import { AccountList } from '../types/accountList';

export const searchPlayersCommand: CommandRegistry = {
  inProduction: true,
  inDevelopment: false,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName('searchplayers')
    .setDescription('Search players in a Blitz server')
    .addStringOption(addServerChoices)
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
    const server = interaction.options.getString('server') as BlitzServer;
    const name = interaction.options.getString('username')!;
    const limit = interaction.options.getInteger('limit') ?? 25;
    const trimmedSearch = name.trim();
    const players = usernamePattern.test(trimmedSearch)
      ? await getWargamingResponse<AccountList>(
          `https://api.wotblitz.${server}/wotb/account/list/?application_id=${WARGAMING_APPLICATION_ID}&search=${encodeURIComponent(
            trimmedSearch,
          )}&limit=${limit}`,
        )
      : [];

    return embedInfo(
      `Player search for "${markdownEscape(name)}" in ${BLITZ_SERVERS[server]}`,
      `\`\`\`${
        players.length === 0
          ? 'No players found.'
          : players.map((player) => player.nickname).join('\n')
      }\`\`\``,
    );
  },
};

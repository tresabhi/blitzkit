import { SlashCommandBuilder } from 'discord.js';
import markdownEscape from 'markdown-escape';
import { BLITZ_SERVERS, BlitzServer } from '../constants/servers.js';
import getWargamingResponse from '../core/blitz/getWargamingResponse.js';
import { usernamePattern } from '../core/blitz/listAccountsPanServer.js';
import cmdName from '../core/interaction/cmdName.js';
import infoEmbed from '../core/interaction/infoEmbed.js';
import addServerChoices from '../core/options/addServerChoices.js';
import addUsernameOption from '../core/options/addUsernameOption.js';
import { args } from '../core/process/args.js';
import { CommandRegistry } from '../events/interactionCreate.js';
import { AccountList } from '../types/accountList.js';

export default {
  inProduction: true,
  inDevelopment: true,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName(cmdName('searchplayers'))
    .setDescription('Search players in a Blitz server')
    .addStringOption(addServerChoices)
    .addStringOption((option) =>
      addUsernameOption(option).setAutocomplete(false).setRequired(true),
    )
    .addIntegerOption((option) =>
      option
        .setName('limit')
        .setDescription('The size of the search result (default: 25)')
        .setMinValue(1)
        .setMaxValue(100),
    ),

  async execute(interaction) {
    const server = interaction.options.getString('server') as BlitzServer;
    const name = interaction.options.getString('username')!;
    const limit = interaction.options.getInteger('limit') ?? 25;
    const trimmedSearch = name.trim();
    const players = usernamePattern.test(trimmedSearch)
      ? await getWargamingResponse<AccountList>(
          `https://api.wotblitz.${server}/wotb/account/list/?application_id=${
            args['wargaming-application-id']
          }&search=${encodeURIComponent(trimmedSearch)}&limit=${limit}`,
        )
      : [];

    await interaction.editReply({
      embeds: [
        infoEmbed(
          `Player search for "${markdownEscape(name)}" in ${
            BLITZ_SERVERS[server]
          }`,
          `\`\`\`${
            players.length === 0
              ? 'No players found.'
              : players.map((player) => player.nickname).join('\n')
          }\`\`\``,
        ),
      ],
    });

    console.log(`Player search results for "${name}"`);
  },
} satisfies CommandRegistry;

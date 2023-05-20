import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import markdownEscape from 'markdown-escape';
import { SKILLED_COLOR } from '../constants/colors.js';
import { BLITZ_SERVERS, BlitzServer } from '../constants/servers.js';
import getWargamingResponse from '../core/blitz/getWargamingResponse.js';
import cmdName from '../core/interaction/cmdName.js';
import addServerChoices from '../core/options/addServerChoices.js';
import addUsernameOption from '../core/options/addUsernameOption.js';
import { args } from '../core/process/args.js';
import { CommandRegistry } from '../events/interactionCreate.js';
import { AccountList } from '../types/accountList.js';

export default {
  inProduction: true,
  inDevelopment: false,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName(cmdName('searchplayers'))
    .setDescription('Search players in a Blitz server')
    .addStringOption(addServerChoices)
    .addStringOption((option) =>
      addUsernameOption(option).setAutocomplete(false),
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
    const players = await getWargamingResponse<AccountList>(
      `https://api.wotblitz.${server}/wotb/account/list/?application_id=${args['wargaming-application-id']}&search=${name}&limit=${limit}`,
    );
    if (!players) return;

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(SKILLED_COLOR)
          .setTitle(
            `Player search for "${markdownEscape(name)}" in ${
              BLITZ_SERVERS[server]
            }`,
          )
          .setDescription(
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

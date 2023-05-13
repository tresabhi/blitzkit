import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import markdownEscape from 'markdown-escape';
import { CommandRegistry } from '../behaviors/interactionCreate.js';
import { SKILLED_COLOR } from '../constants/colors.js';
import getWargamingResponse from '../core/blitz/getWargamingResponse.js';
import cmdName from '../core/interaction/cmdName.js';
import addIGNOption from '../core/options/addIGNOption.js';
import addServerChoices from '../core/options/addServerChoices.js';
import { args } from '../core/process/args.js';
import { Players } from '../types/players.js';

export default {
  inDevelopment: true,
  inProduction: true,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName(cmdName('searchplayers'))
    .setDescription('Search players in a Blitz server')
    .addStringOption(addServerChoices)
    .addStringOption(addIGNOption)
    .addIntegerOption((option) =>
      option
        .setName('limit')
        .setDescription('The size of the search result (default: 25)')
        .setMinValue(1)
        .setMaxValue(100),
    ),

  async execute(interaction) {
    const server = interaction.options.getString('server')!;
    const name = interaction.options.getString('name')!;
    const limit = interaction.options.getInteger('limit') ?? 25;
    const players = await getWargamingResponse<Players>(
      `https://api.wotblitz.${server}/wotb/account/list/?application_id=${args['wargaming-application-id']}&search=${name}&limit=${limit}`,
    );
    if (!players) return;

    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(SKILLED_COLOR)
          .setTitle(`Player search results for "${markdownEscape(name)}"`)
          .setDescription(
            `\`\`\`${
              players.length === 0
                ? 'No players found.'
                : players
                    .map((player) => markdownEscape(player.nickname))
                    .join('\n')
            }\`\`\``,
          ),
      ],
    });
  },
} satisfies CommandRegistry;

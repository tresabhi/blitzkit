import { SlashCommandBuilder } from 'discord.js';
import { go } from 'fuzzysort';
import markdownEscape from 'markdown-escape';
import { TANK_NAMES } from '../core/blitz/tankopedia.js';
import cmdName from '../core/interaction/cmdName.js';
import infoEmbed from '../core/interaction/infoEmbed.js';
import addTankChoices from '../core/options/addTankChoices.js';
import { CommandRegistry } from '../events/interactionCreate.js';

export default {
  inProduction: true,
  inDevelopment: true,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName(cmdName('searchtanks'))
    .setDescription('Search tanks')
    .addStringOption((option) => addTankChoices(option).setAutocomplete(false))
    .addIntegerOption((option) =>
      option
        .setName('limit')
        .setDescription('The size of the search result (default: 25)')
        .setMinValue(1)
        .setMaxValue(100),
    ),

  async execute(interaction) {
    const tank = interaction.options.getString('tank')!;
    const limit = interaction.options.getInteger('limit') ?? 25;
    const results = go(tank, TANK_NAMES, { limit }).map(
      (result) => result.target,
    );

    await interaction.editReply({
      embeds: [
        infoEmbed(
          `Tank search for "${markdownEscape(tank)}"`,
          results.length === 0
            ? 'No tanks found.'
            : `\`\`\`\n${results.join('\n')}\n\`\`\``,
        ),
      ],
    });
  },
} satisfies CommandRegistry;

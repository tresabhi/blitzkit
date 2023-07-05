import { SlashCommandBuilder } from 'discord.js';
import { go } from 'fuzzysort';
import markdownEscape from 'markdown-escape';
import { TANK_NAMES } from '../core/blitz/tankopedia.js';
import addTankChoices from '../core/discord/addTankChoices.js';
import embedInfo from '../core/discord/embedInfo.js';
import { CommandRegistry } from '../events/interactionCreate/index.js';

export const searchTanksCommand: CommandRegistry = {
  inProduction: true,
  inDevelopment: true,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName('searchtanks')
    .setDescription('Search tanks')
    .addStringOption((option) => addTankChoices(option).setAutocomplete(false))
    .addIntegerOption((option) =>
      option
        .setName('limit')
        .setDescription('The size of the search result (default: 25)')
        .setMinValue(1)
        .setMaxValue(100),
    ),

  async handler(interaction) {
    const tank = interaction.options.getString('tank')!;
    const limit = interaction.options.getInteger('limit') ?? 25;
    const results = go(tank, await TANK_NAMES, { limit }).map(
      (result) => result.target,
    );

    return embedInfo(
      `Tank search for "${markdownEscape(tank)}"`,
      results.length === 0
        ? 'No tanks found.'
        : `\`\`\`\n${results.join('\n')}\n\`\`\``,
    );
  },
};

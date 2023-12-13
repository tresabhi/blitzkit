import { SlashCommandBuilder } from 'discord.js';
import { go } from 'fuzzysort';
import markdownEscape from 'markdown-escape';
import { tankNamesDiacritics } from '../core/blitzkrieg/definitions/tanks';
import addTankChoices from '../core/discord/addTankChoices';
import embedInfo from '../core/discord/embedInfo';
import { CommandRegistry } from '../events/interactionCreate';

export const searchTanksCommand: CommandRegistry = {
  inProduction: true,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName('search-tanks')
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
    const results = go(tank, await tankNamesDiacritics, {
      limit,
      keys: ['combined'],
    }).map((result) => result.obj.original);

    return embedInfo(
      `Tank search for "${markdownEscape(tank)}"`,
      results.length === 0
        ? 'No tanks found.'
        : `\`\`\`\n${results.join('\n')}\n\`\`\``,
    );
  },
};

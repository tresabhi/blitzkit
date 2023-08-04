import { SlashCommandBuilder } from 'discord.js';
import markdownEscape from 'markdown-escape';
import { REGION_NAMES, Region } from '../constants/regions';
import getWargamingResponse from '../core/blitz/getWargamingResponse';
import addClanChoices from '../core/discord/addClanChoices';
import addRegionChoices from '../core/discord/addRegionChoices';
import embedInfo from '../core/discord/embedInfo';
import { secrets } from '../core/node/secrets';
import { CommandRegistry } from '../events/interactionCreate';
import { ClanList } from '../types/clanList';

export const searchClansCommand: CommandRegistry = {
  inProduction: true,
  inDevelopment: true,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName('search-clans')
    .setDescription('Search clans')
    .addStringOption(addRegionChoices)
    .addStringOption((option) => addClanChoices(option).setAutocomplete(false))
    .addIntegerOption((option) =>
      option
        .setName('limit')
        .setDescription('The size of the search result (default: 25)')
        .setMinValue(1)
        .setMaxValue(100),
    ),

  async handler(interaction) {
    const server = interaction.options.getString('region') as Region;
    const clan = interaction.options.getString('clan')!;
    const limit = interaction.options.getInteger('limit') ?? 25;
    const clanList = await getWargamingResponse<ClanList>(
      `https://api.wotblitz.${server}/wotb/clans/list/?application_id=${secrets.WARGAMING_APPLICATION_ID}&search=${clan}&limit=${limit}`,
    );

    return embedInfo(
      `Clan search for "${markdownEscape(clan)}" in ${REGION_NAMES[server]}`,
      clanList.length === 0
        ? 'No clans found.'
        : `\`\`\`\n${clanList
            .map((clan) => `${clan.name} [${clan.tag}]`)
            .join('\n')}\n\`\`\``,
    );
  },
};

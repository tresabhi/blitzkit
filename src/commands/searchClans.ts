import { SlashCommandBuilder } from 'discord.js';
import markdownEscape from 'markdown-escape';
import { REGION_DOMAIN_NAMES, RegionDomain } from '../constants/regions';
import getWargamingResponse from '../core/blitz/getWargamingResponse';
import addClanChoices from '../core/discord/addClanChoices';
import addServerChoices from '../core/discord/addServerChoices';
import embedInfo from '../core/discord/embedInfo';
import { WARGAMING_APPLICATION_ID } from '../core/node/arguments';
import { CommandRegistry } from '../events/interactionCreate';
import { ClanList } from '../types/clanList';

export const searchClansCommand: CommandRegistry = {
  inProduction: true,
  inDevelopment: false,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName('searchclans')
    .setDescription('Search clans')
    .addStringOption(addServerChoices)
    .addStringOption((option) => addClanChoices(option).setAutocomplete(false))
    .addIntegerOption((option) =>
      option
        .setName('limit')
        .setDescription('The size of the search result (default: 25)')
        .setMinValue(1)
        .setMaxValue(100),
    ),

  async handler(interaction) {
    const server = interaction.options.getString('server') as RegionDomain;
    const clan = interaction.options.getString('clan')!;
    const limit = interaction.options.getInteger('limit') ?? 25;
    const clanList = await getWargamingResponse<ClanList>(
      `https://api.wotblitz.${server}/wotb/clans/list/?application_id=${WARGAMING_APPLICATION_ID}&search=${clan}&limit=${limit}`,
    );

    return embedInfo(
      `Clan search for "${markdownEscape(clan)}" in ${
        REGION_DOMAIN_NAMES[server]
      }`,
      clanList.length === 0
        ? 'No clans found.'
        : `\`\`\`\n${clanList
            .map((clan) => `${clan.name} [${clan.tag}]`)
            .join('\n')}\n\`\`\``,
    );
  },
};

import { SlashCommandBuilder } from 'discord.js';
import markdownEscape from 'markdown-escape';
import { BLITZ_SERVERS, BlitzServer } from '../constants/servers.js';
import getWargamingResponse from '../core/blitz/getWargamingResponse.js';
import infoEmbed from '../core/interaction/infoEmbed.js';
import { WARGAMING_APPLICATION_ID } from '../core/node/args.js';
import addClanChoices from '../core/options/addClanChoices.js';
import addServerChoices from '../core/options/addServerChoices.js';
import { CommandRegistry } from '../events/interactionCreate/index.js';
import { ClanList } from '../types/clanList.js';

export default {
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
    const server = interaction.options.getString('server') as BlitzServer;
    const clan = interaction.options.getString('clan')!;
    const limit = interaction.options.getInteger('limit') ?? 25;
    const clanList = await getWargamingResponse<ClanList>(
      `https://api.wotblitz.${server}/wotb/clans/list/?application_id=${WARGAMING_APPLICATION_ID}&search=${clan}&limit=${limit}`,
    );

    return infoEmbed(
      `Clan search for "${markdownEscape(clan)}" in ${BLITZ_SERVERS[server]}`,
      clanList.length === 0
        ? 'No clans found.'
        : `\`\`\`\n${clanList
            .map((clan) => `${clan.name} [${clan.tag}]`)
            .join('\n')}\n\`\`\``,
    );
  },
} satisfies CommandRegistry;

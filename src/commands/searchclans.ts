import { SlashCommandBuilder } from 'discord.js';
import markdownEscape from 'markdown-escape';
import { BLITZ_SERVERS, BlitzServer } from '../constants/servers.js';
import getWargamingResponse from '../core/blitz/getWargamingResponse.js';
import cmdName from '../core/interaction/cmdName.js';
import infoEmbed from '../core/interaction/infoEmbed.js';
import addClanChoices from '../core/options/addClanChoices.js';
import addServerChoices from '../core/options/addServerChoices.js';
import { args } from '../core/process/args.js';
import { CommandRegistry } from '../events/interactionCreate.js';
import { ClanList } from '../types/clanList.js';

export default {
  inProduction: true,
  inDevelopment: false,
  inPublic: true,

  command: new SlashCommandBuilder()
    .setName(cmdName('searchclans'))
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

  async execute(interaction) {
    const server = interaction.options.getString('server') as BlitzServer;
    const clan = interaction.options.getString('clan')!;
    const limit = interaction.options.getInteger('limit') ?? 25;
    const clanList = await getWargamingResponse<ClanList>(
      `https://api.wotblitz.${server}/wotb/clans/list/?application_id=${args['wargaming-application-id']}&search=${clan}&limit=${limit}`,
    );
    if (!clanList) return;

    await interaction.editReply({
      embeds: [
        infoEmbed(
          `Clan search for "${markdownEscape(clan)}" in ${
            BLITZ_SERVERS[server]
          }`,
          clanList.length === 0
            ? 'No clans found.'
            : `\`\`\`\n${clanList
                .map((clan) => `${clan.name} [${clan.tag}]`)
                .join('\n')}\n\`\`\``,
        ),
      ],
    });

    console.log(`Clan search results for "${clan}"`);
  },
} satisfies CommandRegistry;

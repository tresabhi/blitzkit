import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import markdownEscape from 'markdown-escape';
import { NEGATIVE_COLOR } from '../../constants/colors.js';
import { BLITZ_SERVERS, BlitzServer } from '../../constants/servers.js';
import { ClanList } from '../../types/clanList.js';
import { args } from '../process/args.js';
import getWargamingResponse from './getWargamingResponse.js';

export default async function getClan(
  interaction: ChatInputCommandInteraction<CacheType>,
  name: string,
  server: BlitzServer,
) {
  const serverName = BLITZ_SERVERS[server];

  const clans = await getWargamingResponse<ClanList>(
    `https://api.wotblitz.${server}/wotb/clans/list/?application_id=${args['wargaming-application-id']}&search=${name}`,
  );

  if (
    clans.length > 0 &&
    (clans[0].name.toLowerCase() === name.toLowerCase() ||
      clans[0].tag.toLowerCase() === name.toLowerCase())
  ) {
    return clans[0];
  } else {
    // no exact match
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(NEGATIVE_COLOR)
          .setTitle(`Clan not found`)
          .setDescription(
            `I couldn't find "${markdownEscape(
              name,
            )}" in the ${serverName} server. I found ${
              clans ? (clans.length < 100 ? clans.length : 'over 100') : 0
            } similarly spelled clan${clans?.length !== 1 ? 's' : ''}. ${
              clans && clans.length > 0
                ? `Did you mean "${markdownEscape(
                    clans[0].name,
                  )}" or "${markdownEscape(clans[0].tag)}"? `
                : ''
            }Re-run the command, don't make typos.`,
          ),
      ],
    });

    console.log(`Clan not found for ${name} in ${serverName} server.`);

    return null;
  }
}

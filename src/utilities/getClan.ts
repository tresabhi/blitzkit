import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { NEGATIVE_COLOR } from '../constants/colors.js';
import { BLITZ_SERVERS, BlitzServer } from '../constants/servers.js';
import { Clan, ClanList } from '../types/clanList.js';
import getWargamingResponse from './getWargamingResponse.js';

export default async function getClan(
  interaction: ChatInputCommandInteraction<CacheType>,
  name: string,
  server: BlitzServer,
  callback: (account: Clan) => void,
) {
  const serverName = BLITZ_SERVERS[server];

  getWargamingResponse<ClanList>(
    `https://api.wotblitz.${server}/wotb/clans/list/?application_id=${process.env.WARGAMING_APPLICATION_ID}&search=${name}`,
    interaction,
    async (clans) => {
      if (
        clans.length > 0 &&
        (clans[0].name === name || clans[0].tag === name.toUpperCase())
      ) {
        callback(clans[0]);
      } else {
        // no exact match
        await interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(NEGATIVE_COLOR)
              .setTitle(`Clan not found`)
              .setDescription(
                `I couldn't find "${name}" in the ${serverName} server. I found ${
                  clans ? (clans.length < 100 ? clans.length : 'over 100') : 0
                } similarly spelled clan${clans?.length !== 1 ? 's' : ''}. ${
                  clans && clans.length > 0
                    ? `Did you mean "${clans[0].name}" or "${clans[0].tag}"? `
                    : ''
                }Re-run the command, don't make typos, and capitalize correctly.`,
              ),
          ],
        });

        console.log(`Clan not found for ${name} in ${serverName} server.`);
      }
    },
  );
}

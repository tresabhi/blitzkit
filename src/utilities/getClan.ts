import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import fetch from 'node-fetch';
import { NEGATIVE_COLOR } from '../constants/colors.js';
import { BLITZ_SERVERS, BlitzServer } from '../constants/servers.js';
import { Clan, ClanList } from '../types/clanList.js';

export default async function getClan(
  interaction: ChatInputCommandInteraction<CacheType>,
  name: string,
  server: BlitzServer,
  callback: (account: Clan) => void,
) {
  const serverName = BLITZ_SERVERS[server];

  const clans = (await fetch(
    `https://api.wotblitz.${server}/wotb/clans/list/?application_id=${process.env.WARGAMING_APPLICATION_ID}&search=${name}`,
  ).then((response) => response.json())) as ClanList;

  if (
    clans.status === 'ok' &&
    clans.data.length > 0 &&
    (clans.data[0].name === name || clans.data[0].tag === name.toUpperCase())
  ) {
    callback(clans.data[0]);
  } else {
    // no exact match
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(NEGATIVE_COLOR)
          .setTitle(`Clan not found`)
          .setDescription(
            `I couldn't find "${name}" in the ${serverName} server. I found ${
              clans?.data
                ? clans.data.length < 100
                  ? clans.data.length
                  : 'over 100'
                : 0
            } similarly spelled clan${clans?.data?.length !== 1 ? 's' : ''}. ${
              clans?.data && clans.data.length > 0
                ? `Did you mean "${clans.data[0].name}" or "${clans.data[0].tag}"? `
                : ''
            }Re-run the command, don't make typos, and capitalize correctly.`,
          ),
      ],
    });

    console.log(`Clan not found for ${name} in ${serverName} server.`);
  }
}

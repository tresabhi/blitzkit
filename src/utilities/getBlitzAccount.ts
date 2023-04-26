import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import fetch from 'node-fetch';
import { NEGATIVE_COLOR } from '../constants/colors.js';
import { BLITZ_SERVERS, BlitzServer } from '../constants/servers.js';
import { Player, Players } from '../types/players.js';

export default async function getBlitzAccount(
  interaction: ChatInputCommandInteraction<CacheType>,
  name: string,
  server: BlitzServer,
  callback: (account: Player) => void,
) {
  const serverName = BLITZ_SERVERS[server];
  const players = (await fetch(
    `https://api.wotblitz.${server}/wotb/account/list/?application_id=${process.env.WARGAMING_APPLICATION_ID}&search=${name}`,
  ).then((response) => response.json())) as Players;

  if (
    players.status === 'ok' &&
    players.data.length > 0 &&
    players.data[0].nickname === name
  ) {
    callback(players.data[0]);
  } else {
    // no exact match
    await interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(NEGATIVE_COLOR)
          .setTitle(`Account not found`)
          .setDescription(
            `I couldn't find "${name}" in the ${serverName} server. I found ${
              players?.data
                ? players.data.length < 100
                  ? players.data.length
                  : 'over 100'
                : 0
            } similarly spelled account${
              players?.data?.length !== 1 ? 's' : ''
            }. ${
              players?.data && players.data.length > 0
                ? `Did you mean "${players.data[0].nickname}"? `
                : ''
            }Re-run the command, don't make typos, and capitalize correctly.`,
          ),
      ],
    });

    console.log(`Account not found for ${name} in ${serverName} server.`);
  }
}

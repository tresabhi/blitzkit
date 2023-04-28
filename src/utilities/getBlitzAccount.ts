import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import { NEGATIVE_COLOR } from '../constants/colors.js';
import { BLITZ_SERVERS, BlitzServer } from '../constants/servers.js';
import { Player, Players } from '../types/players.js';
import { args } from './args.js';
import getWargamingResponse from './getWargamingResponse.js';

export default async function getBlitzAccount(
  interaction: ChatInputCommandInteraction<CacheType>,
  name: string,
  server: BlitzServer,
  callback: (account: Player) => void,
) {
  const serverName = BLITZ_SERVERS[server];

  getWargamingResponse<Players>(
    `https://api.wotblitz.${server}/wotb/account/list/?application_id=${args['wargaming-application-id']}&search=${name}`,
    interaction,
    async (players) => {
      if (players.length > 0 && players[0].nickname === name) {
        callback(players[0]);
      } else {
        // no exact match
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(NEGATIVE_COLOR)
              .setTitle(`Account not found`)
              .setDescription(
                `I couldn't find "${name}" in the ${serverName} server. I found ${
                  players
                    ? players.length < 100
                      ? players.length
                      : 'over 100'
                    : 0
                } similarly spelled account${
                  players?.length !== 1 ? 's' : ''
                }. ${
                  players && players.length > 0
                    ? `Did you mean "${players[0].nickname}"? `
                    : ''
                }Re-run the command, don't make typos, and capitalize correctly.`,
              ),
          ],
        });

        console.log(`Account not found for ${name} in ${serverName} server.`);
      }
    },
  );
}

import { CacheType, ChatInputCommandInteraction } from 'discord.js';
import { BLITZ_SERVERS, BlitzServer } from '../../constants/servers.js';
import { TanksStats } from '../../types/tanksStats.js';
import negativeEmbed from '../interaction/negativeEmbed.js';
import { args } from '../process/args.js';
import getWargamingResponse from './getWargamingResponse.js';

export default async function getTankStats(
  interaction: ChatInputCommandInteraction<CacheType>,
  server: BlitzServer,
  id: number,
) {
  const tankStats = await getWargamingResponse<TanksStats>(
    `https://api.wotblitz.${server}/wotb/tanks/stats/?application_id=${args['wargaming-application-id']}&account_id=${id}`,
  );

  if (tankStats[id] === null) {
    interaction.editReply({
      embeds: [
        negativeEmbed(
          'No tank stats available',
          `Wargaming says there is no tank stats for this account. This account may not have any battles/tanks or exist in the ${BLITZ_SERVERS[server]} server.`,
        ),
      ],
    });

    throw new Error(`No tank stats available for ${server}/${id}`);
  }

  return tankStats[id];
}

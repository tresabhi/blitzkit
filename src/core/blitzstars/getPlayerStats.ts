import { CacheType, ChatInputCommandInteraction } from 'discord.js';
import { PlayerStats } from '../../types/playerStats.js';

export default async function getPlayerStats(
  interaction: ChatInputCommandInteraction<CacheType>,
  command: string,
  id: number,
  callback: (playerStats: PlayerStats) => void,
) {
  fetch(`https://www.blitzstars.com/api/playerstats/${id}`).then(
    async (response) => {
      callback((await response.json()) as PlayerStats);
    },
  );
}

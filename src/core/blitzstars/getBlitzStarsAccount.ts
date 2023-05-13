import { CacheType, ChatInputCommandInteraction } from 'discord.js';
import fetch from 'node-fetch';
import { PlayerPeriodicStatsCollection } from '../../types/statistics.js';
import { notTrackedByBlitzStars } from '../interaction/notTrackedByBlitzStars.js';

export default async function getBlitzStarsAccount(
  interaction: ChatInputCommandInteraction<CacheType>,
  accountId: number,
) {
  try {
    const response = await fetch(
      `https://www.blitzstars.com/api/top/player/${accountId}`,
    );
    const parsed = (await response.json()) as PlayerPeriodicStatsCollection;

    if (parsed.statistics) {
      return parsed;
    } else throw new Error('No data to display');
  } catch (error) {
    await interaction.editReply({
      embeds: [notTrackedByBlitzStars],
    });

    console.log(`Not tracked by BlitzStars.`);

    return null;
  }
}

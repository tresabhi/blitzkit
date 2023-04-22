import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import fetch from 'node-fetch';
import { NEGATIVE_COLOR } from '../constants/colors.js';
import { PlayerStatistics } from '../types/statistics.js';

export default async function getBlitzStarsAccount(
  interaction: ChatInputCommandInteraction<CacheType>,
  accountId: number,
  ign: string,
  callback: (account: PlayerStatistics) => void,
) {
  fetch(`https://www.blitzstars.com/api/top/player/${accountId}`)
    .then(async (response) => {
      callback((await response.json()) as PlayerStatistics);
    })
    .catch(() => {
      interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setTitle('No data to display')
            .setDescription(`${ign} is not tracked by BlitzStars.`)
            .setColor(NEGATIVE_COLOR),
        ],
      });
    });
}

import {
  CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import markdownEscape from 'markdown-escape';
import fetch from 'node-fetch';
import { NEGATIVE_COLOR } from '../constants/colors.js';
import { PlayerStatistics } from '../types/statistics.js';
import blitzStarsError from './blitzStarsError.js';

export default async function getBlitzStarsAccount(
  interaction: ChatInputCommandInteraction<CacheType>,
  command: string,
  accountId: number,
  name: string,
  callback: (account: PlayerStatistics) => void,
) {
  if (!interaction.deferred) await interaction.deferReply();

  fetch(`https://www.blitzstars.com/api/top/player/${accountId}`)
    .then(async (response) => {
      const data = (await response.json()) as PlayerStatistics;

      if (data.statistics) {
        callback(data);
      } else {
        await interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setTitle('No data to display')
              .setDescription(
                `${markdownEscape(name)} is not tracked by BlitzStars.`,
              )
              .setColor(NEGATIVE_COLOR),
          ],
        });

        console.log(`${name} is not tracked by BlitzStars.`);
      }
    })
    .catch((error) => blitzStarsError(interaction, error, command));
}

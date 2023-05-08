import { CacheType, ChatInputCommandInteraction } from 'discord.js';
import markdownEscape from 'markdown-escape';
import fetch from 'node-fetch';
import { PlayerStatistics } from '../types/statistics.js';
import errorEmbed from './errorEmbed.js';

export default async function getBlitzStarsAccount(
  interaction: ChatInputCommandInteraction<CacheType>,
  accountId: number,
  name: string,
) {
  try {
    const response = await fetch(
      `https://www.blitzstars.com/api/top/player/${accountId}`,
    );
    const parsed = (await response.json()) as PlayerStatistics;

    if (parsed.statistics) {
      return parsed;
    } else throw new Error('No data to display');
  } catch (error) {
    await interaction.editReply({
      embeds: [
        errorEmbed(
          'No data to display',
          `${markdownEscape(name)} is not tracked by BlitzStars.`,
        ),
      ],
    });

    console.log(`${name} is not tracked by BlitzStars.`);

    return null;
  }
}
